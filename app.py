from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from enum import Enum
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import os
import json
from pathlib import Path
import bcrypt
import secrets
import jwt
from datetime import datetime, timedelta
import random
import logging

# Fallback verse used when Bible data is missing or incomplete
FALLBACK_VERSE_REFERENCE = "John 3:16"
FALLBACK_VERSE_TEXT = (
    "For God so loved the world, as to give his only begotten Son: "
    "that whosoever believeth in him may not perish, but may have life everlasting."
)

# JWT secret key
_DEFAULT_JWT_SECRET = "your-secret-key-change-in-production"
JWT_SECRET = os.getenv("JWT_SECRET", _DEFAULT_JWT_SECRET)
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 30  # 30 days

# Surface insecure/missing secrets. Hard-fail only on the deployed Render
# instance (RENDER is set there); just warn locally so dev still runs.
_IS_RENDER = bool(os.getenv("RENDER"))
if JWT_SECRET == _DEFAULT_JWT_SECRET:
    if _IS_RENDER:
        raise RuntimeError(
            "JWT_SECRET is unset/default in production. render.yaml auto-generates "
            "it (generateValue); set it before serving auth."
        )
    logging.warning("JWT_SECRET is the insecure default — set JWT_SECRET in production.")
if _IS_RENDER and not os.getenv("ADMIN_PASSWORD"):
    logging.warning("ADMIN_PASSWORD is not set — the /metrics endpoint will be unavailable.")

# User storage file
USERS_FILE = Path("users.json")
if USERS_FILE.exists():
    try:
        with USERS_FILE.open("r") as f:
            users = json.load(f)
    except Exception:
        users = {}
else:
    users = {}

# Cache file setup
CACHE_FILE = Path("qa_cache.json")
if CACHE_FILE.exists():
    try:
        with CACHE_FILE.open("r") as f:
            cache = json.load(f)
    except Exception:
        cache = {}
else:
    cache = {}

# Load Bible data once at startup. If loading fails or returns empty,
# a fallback verse (John 3:16) is inserted so the API remains functional.
try:
    with open("EntireBible-DR.json", "r", encoding="utf-8") as f:
        BIBLE_DATA = json.load(f)
except Exception as e:
    logging.error("Failed to load Bible data: %s", e)
    BIBLE_DATA = {}

if not BIBLE_DATA:
    logging.error("Bible data is empty; using fallback verse %s", FALLBACK_VERSE_REFERENCE)
    BIBLE_DATA = {"John": {"3": {"16": FALLBACK_VERSE_TEXT}}}

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from templates import prompt_for_mode
import metrics
import db

# 1) Read API key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError(
        "OPENAI_API_KEY environment variable not set. Please provide your OpenAI API key."
    )

# 2) Vector store (lazy). Prefer durable Supabase pgvector when configured;
#    otherwise fall back to the local Chroma index (legacy / local dev).
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
USE_SUPABASE_VECTORS = bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)

vectorstore = None

def get_vectorstore():
    global vectorstore
    if vectorstore is None:
        embeddings = OpenAIEmbeddings(openai_api_key=api_key)
        if USE_SUPABASE_VECTORS:
            from supabase import create_client
            from langchain_community.vectorstores import SupabaseVectorStore
            client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            vectorstore = SupabaseVectorStore(
                client=client,
                embedding=embeddings,
                table_name="documents",
                query_name="match_documents",
            )
        else:
            vectorstore = Chroma(
                persist_directory="veritas_ai_chroma_db",
                embedding_function=embeddings,
            )
    return vectorstore

# 3) Retriever will be created on-demand (lazy loading)

# 4) Initialize the Chat model
llm = ChatOpenAI(
    model_name="gpt-4o-mini",  # Much faster than gpt-4-turbo, still very capable
    temperature=0.0,
    openai_api_key=api_key,
    max_tokens=1500,  # Limit response length for faster processing
    request_timeout=30  # 30 second timeout
)

# 5) Create FastAPI app and enable CORS
# Build CORS origins from environment variables for flexibility
DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add Vercel frontend domain from env var
VERCEL_FRONTEND_URL = os.getenv("VERCEL_FRONTEND_URL", "")
CUSTOM_DOMAINS = os.getenv("CORS_ORIGINS", "")  # Comma-separated list

cors_origins = DEFAULT_ORIGINS.copy()
if VERCEL_FRONTEND_URL:
    cors_origins.append(VERCEL_FRONTEND_URL)
if CUSTOM_DOMAINS:
    cors_origins.extend([d.strip() for d in CUSTOM_DOMAINS.split(",") if d.strip()])

app = FastAPI(title="GraceGuide AI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)

security = HTTPBasic()
admin_password = os.getenv("ADMIN_PASSWORD")

# 6) Request and response models
class SourceMode(str, Enum):
    bible = "bible"
    both = "both"
    catechism = "catechism"

class QARequest(BaseModel):
    question: str
    mode: SourceMode = SourceMode.both

class QAResponse(BaseModel):
    answer: str
    sources: list[str]

class SubscribeRequest(BaseModel):
    email: str

class LogEvent(BaseModel):
    event: str

class AuthRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    email: str

def hash_password(password: str) -> str:
    """Hash password using bcrypt with a generated salt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against an existing hash"""
    return bcrypt.checkpw(password.encode(), password_hash.encode())

def create_jwt_token(email: str) -> str:
    """Create JWT token for user"""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "email": email,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def save_users():
    """Save users to file"""
    try:
        with USERS_FILE.open("w") as f:
            json.dump(users, f)
        return True
    except Exception as e:
        logging.error("Failed to save users: %s", e)
        return False

# Authentication endpoints
@app.post("/auth/signup", response_model=AuthResponse)
def signup(request: AuthRequest):
    email = request.email.lower().strip()
    password_hash = hash_password(request.password)

    if db.enabled:
        if db.get_user(email):
            raise HTTPException(status_code=400, detail="User already exists")
        try:
            db.create_user(email, password_hash)
        except Exception as e:
            logging.error("Failed to create user: %s", e)
            raise HTTPException(status_code=500, detail="Failed to save user data")
    else:
        if email in users:
            raise HTTPException(status_code=400, detail="User already exists")
        users[email] = {
            "password_hash": password_hash,
            "created_at": datetime.utcnow().isoformat(),
        }
        if not save_users():
            raise HTTPException(status_code=500, detail="Failed to save user data")

    token = create_jwt_token(email)
    return AuthResponse(token=token, email=email)

@app.post("/auth/signin", response_model=AuthResponse)
def signin(request: AuthRequest):
    email = request.email.lower().strip()

    if db.enabled:
        user = db.get_user(email)
        password_hash = user["password_hash"] if user else None
    else:
        password_hash = users.get(email, {}).get("password_hash")

    if not password_hash or not verify_password(request.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_jwt_token(email)
    return AuthResponse(token=token, email=email)

# Verse of the Day models
class VerseOfTheDayResponse(BaseModel):
    verse_text: str
    verse_reference: str

# Load meaningful verses for daily selection.
# `book`/`chapter`/`verse` are Douay-Rheims LOOKUP KEYS into EntireBible-DR.json
# (e.g. "Isaias", and Psalm 22 = the shepherd psalm in Vulgate numbering).
# `display` is the MODERN reference label shown to users — decoupled from the
# lookup key so we can show normal names/numbers ("Isaiah", "Psalm 23") while
# the verse text is still pulled from the DR data. `display` also corrects the
# James data defect: the wisdom verse is mis-keyed at 1:6 here but its true
# citation is 1:5. Every entry is verified by scripts/verify_daily_verses.py.
MEANINGFUL_VERSES = [
    {"book": "Matthew", "chapter": "5", "verse": "8", "theme": "purity", "display": "Matthew 5:8"},
    {"book": "John", "chapter": "3", "verse": "16", "theme": "love", "display": "John 3:16"},
    {"book": "Psalms", "chapter": "22", "verse": "1", "theme": "trust", "display": "Psalm 23:1"},
    {"book": "Romans", "chapter": "8", "verse": "28", "theme": "providence", "display": "Romans 8:28"},
    {"book": "1 John", "chapter": "4", "verse": "8", "theme": "love", "display": "1 John 4:8"},
    {"book": "Philippians", "chapter": "4", "verse": "13", "theme": "strength", "display": "Philippians 4:13"},
    {"book": "Isaias", "chapter": "40", "verse": "31", "theme": "hope", "display": "Isaiah 40:31"},
    {"book": "Proverbs", "chapter": "3", "verse": "5", "theme": "trust", "display": "Proverbs 3:5"},
    {"book": "Matthew", "chapter": "6", "verse": "33", "theme": "priorities", "display": "Matthew 6:33"},
    {"book": "James", "chapter": "1", "verse": "6", "theme": "wisdom", "display": "James 1:5"},
    {"book": "Ephesians", "chapter": "2", "verse": "8", "theme": "grace", "display": "Ephesians 2:8"},
    {"book": "Hebrews", "chapter": "11", "verse": "1", "theme": "faith", "display": "Hebrews 11:1"},
    {"book": "Jeremias", "chapter": "29", "verse": "11", "theme": "hope", "display": "Jeremiah 29:11"},
    {"book": "Matthew", "chapter": "11", "verse": "28", "theme": "rest", "display": "Matthew 11:28"},
    {"book": "John", "chapter": "14", "verse": "6", "theme": "truth", "display": "John 14:6"},
]

# Cache for verse of the day
verse_of_day_cache = {}

@app.get("/verse-of-the-day", response_model=VerseOfTheDayResponse)
def get_verse_of_the_day():
    """Return a consistent daily verse.

    If the desired verse is missing from the loaded data, a fallback verse
    (John 3:16) is returned instead and the missing reference is logged.
    """
    # Use current date as key for consistent daily verse
    today = datetime.utcnow().date().isoformat()

    # Check cache first
    if today in verse_of_day_cache:
        return VerseOfTheDayResponse(**verse_of_day_cache[today])

    # Select verse based on day of year for consistency
    day_of_year = datetime.utcnow().timetuple().tm_yday
    verse_index = day_of_year % len(MEANINGFUL_VERSES)
    selected_verse = MEANINGFUL_VERSES[verse_index]

    try:
        book_data = BIBLE_DATA.get(selected_verse["book"])
        chapter_data = book_data.get(selected_verse["chapter"]) if book_data else None
        verse_text = (
            chapter_data.get(selected_verse["verse"]) if chapter_data else None
        )

        if verse_text is None:
            missing = f"{selected_verse['book']} {selected_verse['chapter']}:{selected_verse['verse']}"
            logging.warning(
                "Missing verse %s; using fallback verse %s.",
                missing,
                FALLBACK_VERSE_REFERENCE,
            )
            verse_text = FALLBACK_VERSE_TEXT
            verse_reference = FALLBACK_VERSE_REFERENCE
        else:
            # Strip Douay-Rheims footnote markers (*) so they don't render in the UI.
            verse_text = verse_text.replace("*", "").strip()
            # Show the modern label; fall back to the DR coordinates if absent.
            verse_reference = selected_verse.get("display") or (
                f"{selected_verse['book']} {selected_verse['chapter']}:{selected_verse['verse']}"
            )

        result = {"verse_text": verse_text, "verse_reference": verse_reference}

        # Cache the result
        verse_of_day_cache[today] = result

        return VerseOfTheDayResponse(**result)

    except Exception as e:
        logging.error("Unexpected error retrieving verse of the day: %s", e)
        return VerseOfTheDayResponse(
            verse_text=FALLBACK_VERSE_TEXT,
            verse_reference=FALLBACK_VERSE_REFERENCE,
        )

# 7) /qa endpoint
@app.post("/qa", response_model=QAResponse)
def qa(request: QARequest):
    key = f"{request.mode.value}|{request.question.strip()}"
    if db.enabled:
        try:
            cached = db.qa_cache_get(key)
        except Exception:
            cached = None
    else:
        cached = cache.get(key)
    if cached:
        return QAResponse(**cached)
    # Build retriever with optional source filter
    filter_opt = None
    if request.mode == SourceMode.bible:
        filter_opt = {"source": "Bible"}
    elif request.mode == SourceMode.catechism:
        filter_opt = {"source": "CCC"}

    local_retriever = get_vectorstore().as_retriever(
        search_kwargs={"k": 5, **({"filter": filter_opt} if filter_opt else {})}  # Reduced from 8 to 5
    )

    # Manual retrieval chain (RetrievalQA is deprecated)
    try:
        # Get relevant documents using invoke() (new LangChain API)
        docs = local_retriever.invoke(request.question)
        
        # Build context from retrieved docs
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Get the prompt template
        prompt_template = prompt_for_mode(request.mode.value)
        
        # Format the prompt with context and question
        formatted_prompt = prompt_template.format(context=context, question=request.question)
        
        # Get LLM response
        response = llm.invoke(formatted_prompt)
        res = {"result": response.content, "source_documents": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    raw = res["result"].strip()

    if "=== Sources ===" in raw:
        answer_text, sources_block = raw.split("=== Sources ===", 1)
    else:
        answer_text, sources_block = raw, ""

    sources = [
        line[2:].strip()
        for line in sources_block.splitlines()
        if line.strip().startswith("- ")
    ]

    answer = answer_text.strip()
    resp = {"answer": answer, "sources": sources}
    if db.enabled:
        try:
            db.qa_cache_set(key, answer, sources)
        except Exception as e:
            logging.error("Failed to write qa cache: %s", e)
    else:
        cache[key] = resp
        try:
            with CACHE_FILE.open("w") as f:
                json.dump(cache, f)
        except Exception:
            pass
    return QAResponse(**resp)

# 8) /subscribe endpoint to capture emails
@app.post("/subscribe")
def subscribe(req: SubscribeRequest):
    import csv
    import hashlib
    import requests

    email = req.email.strip().lower()
    csv_fname = "subscribers.csv"

    def ensure_csv():
        if not os.path.isfile(csv_fname):
            with open(csv_fname, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["email"])

    def email_in_csv() -> bool:
        if not os.path.isfile(csv_fname):
            return False
        with open(csv_fname, "r", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get("email", "").strip().lower() == email:
                    return True
        return False

    mc_key = os.getenv("MAILCHIMP_API_KEY")
    mc_server = os.getenv("MAILCHIMP_SERVER_PREFIX")
    mc_list = os.getenv("MAILCHIMP_LIST_ID")

    if mc_key and mc_server and mc_list:
        auth = ("anystring", mc_key)
        member_hash = hashlib.md5(email.encode()).hexdigest()
        base_url = f"https://{mc_server}.api.mailchimp.com/3.0"
        member_url = f"{base_url}/lists/{mc_list}/members/{member_hash}"
        try:
            r = requests.get(member_url, auth=auth, timeout=10)
            if r.status_code == 200:
                return {"status": "already_subscribed"}
            if r.status_code != 404:
                raise Exception(f"GET {r.status_code}: {r.text}")

            data = {"email_address": email, "status": "subscribed"}
            r = requests.put(member_url, auth=auth, json=data, timeout=10)
            if 200 <= r.status_code < 300:
                return {"status": "ok"}
            raise Exception(f"PUT {r.status_code}: {r.text}")
        except Exception as e:
            print(f"Mailchimp error: {e}")

    # Durable store when configured, else legacy CSV (ephemeral on Render).
    if db.enabled:
        try:
            if db.subscriber_exists(email):
                return {"status": "already_subscribed"}
            db.add_subscriber(email)
            return {"status": "ok"}
        except Exception as e:
            logging.error("Failed to store subscriber: %s", e)

    ensure_csv()
    if email_in_csv():
        return {"status": "already_subscribed"}
    with open(csv_fname, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([email])
    return {"status": "ok"}

# 9) /metrics endpoint with basic auth
@app.get("/metrics")
def get_metrics(credentials: HTTPBasicCredentials = Depends(security)):
    if not admin_password:
        raise HTTPException(status_code=500, detail="ADMIN_PASSWORD not set")
    import secrets
    correct = credentials.username == "admin" and secrets.compare_digest(credentials.password, admin_password)
    if not correct:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )
    return metrics.get_counts()

# 10) /log_event endpoint to record frontend events
@app.post("/log_event")
def log_event(evt: LogEvent):
    metrics.log_event(evt.event)
    return {"status": "ok"}

# 11) Health check endpoint for monitoring
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# 13) Serve frontend - mount entire dist folder at root (API routes already defined above take precedence)
ui_path = "graceguide-ui/dist"
if os.path.isdir(ui_path):
    # Mount the entire dist folder at root with html=True for SPA fallback
    app.mount("/", StaticFiles(directory=ui_path, html=True), name="static")
else:
    # avoids startup crash when dist folder is missing
    print(f"Static UI not found at {ui_path}, skipping mount")

# To run locally:
# uvicorn app:app --reload --port 8000
