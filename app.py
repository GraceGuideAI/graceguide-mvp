from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from enum import Enum
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import os
import json
from pathlib import Path
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
import random

# JWT secret key
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 30  # 30 days

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

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA
from templates import prompt_for_mode
import metrics

# 1) Read API key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError(
        "OPENAI_API_KEY environment variable not set. Please provide your OpenAI API key."
    )

# 2) Load the Chroma vector store
vectorstore = Chroma(
    persist_directory="veritas_ai_chroma_db",
    embedding_function=OpenAIEmbeddings(openai_api_key=api_key)
)

# 3) Build retriever
retriever = vectorstore.as_retriever(search_kwargs={"k": 8})

# 4) Initialize the Chat model
llm = ChatOpenAI(
    model_name="gpt-4-turbo",
    temperature=0.0,
    openai_api_key=api_key
)

# 5) Create FastAPI app and enable CORS
app = FastAPI(title="Veritas AI QA API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://yourdomain.com",
        "https://ef5c-198-232-127-236.ngrok-free.app"
    ],
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
    """Hash password with salt"""
    return hashlib.sha256(password.encode()).hexdigest()

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
    except Exception:
        pass

# Authentication endpoints
@app.post("/auth/signup", response_model=AuthResponse)
def signup(request: AuthRequest):
    email = request.email.lower().strip()
    
    # Check if user already exists
    if email in users:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    users[email] = {
        "password_hash": hash_password(request.password),
        "created_at": datetime.utcnow().isoformat()
    }
    save_users()
    
    # Create token
    token = create_jwt_token(email)
    return AuthResponse(token=token, email=email)

@app.post("/auth/signin", response_model=AuthResponse)
def signin(request: AuthRequest):
    email = request.email.lower().strip()
    
    # Check if user exists
    if email not in users:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if users[email]["password_hash"] != hash_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_jwt_token(email)
    return AuthResponse(token=token, email=email)

# Verse of the Day models
class VerseOfTheDayResponse(BaseModel):
    verse_text: str
    verse_reference: str
    explanation: str
    catechism_references: list[str]

# Load meaningful verses for daily selection
MEANINGFUL_VERSES = [
    {"book": "Matthew", "chapter": "5", "verse": "8", "theme": "purity"},
    {"book": "John", "chapter": "3", "verse": "16", "theme": "love"},
    {"book": "Psalms", "chapter": "23", "verse": "1", "theme": "trust"},
    {"book": "Romans", "chapter": "8", "verse": "28", "theme": "providence"},
    {"book": "1 Corinthians", "chapter": "13", "verse": "13", "theme": "love"},
    {"book": "Philippians", "chapter": "4", "verse": "13", "theme": "strength"},
    {"book": "Isaiah", "chapter": "40", "verse": "31", "theme": "hope"},
    {"book": "Proverbs", "chapter": "3", "verse": "5", "theme": "trust"},
    {"book": "Matthew", "chapter": "6", "verse": "33", "theme": "priorities"},
    {"book": "James", "chapter": "1", "verse": "5", "theme": "wisdom"},
    {"book": "Ephesians", "chapter": "2", "verse": "8", "theme": "grace"},
    {"book": "Hebrews", "chapter": "11", "verse": "1", "theme": "faith"},
    {"book": "Jeremiah", "chapter": "29", "verse": "11", "theme": "hope"},
    {"book": "Matthew", "chapter": "11", "verse": "28", "theme": "rest"},
    {"book": "John", "chapter": "14", "verse": "6", "theme": "truth"},
]

# Cache for verse of the day
verse_of_day_cache = {}

@app.get("/verse-of-the-day", response_model=VerseOfTheDayResponse)
def get_verse_of_the_day():
    # Use current date as key for consistent daily verse
    today = datetime.utcnow().date().isoformat()
    
    # Check cache first
    if today in verse_of_day_cache:
        return VerseOfTheDayResponse(**verse_of_day_cache[today])
    
    # Select verse based on day of year for consistency
    day_of_year = datetime.utcnow().timetuple().tm_yday
    verse_index = day_of_year % len(MEANINGFUL_VERSES)
    selected_verse = MEANINGFUL_VERSES[verse_index]
    
    # Load Bible data to get the verse text
    try:
        with open("EntireBible-DR.json", "r", encoding="utf-8") as f:
            bible_data = json.load(f)
        
        verse_text = bible_data.get(selected_verse["book"], {}).get(
            selected_verse["chapter"], {}
        ).get(selected_verse["verse"], "Verse not found")
        
        verse_reference = f"{selected_verse['book']} {selected_verse['chapter']}:{selected_verse['verse']}"
        
        # Generate explanation using the LLM with Catechism context
        prompt = f"""Given this Bible verse: "{verse_text}" ({verse_reference})

Please provide a brief Catholic explanation (2-3 sentences) that:
1. Explains the spiritual meaning of this verse
2. Connects it to Catholic teaching from the Catechism
3. Offers a practical application for daily life

Keep the explanation concise and accessible."""

        # Search for relevant Catechism passages
        theme_filter = {"source": "CCC"}
        catechism_retriever = vectorstore.as_retriever(
            search_kwargs={"k": 3, "filter": theme_filter}
        )
        
        # Get relevant CCC passages based on the verse theme
        search_query = f"{selected_verse['theme']} {verse_text[:50]}"
        relevant_docs = catechism_retriever.get_relevant_documents(search_query)
        
        # Extract CCC references
        catechism_refs = []
        for doc in relevant_docs:
            ref = doc.metadata.get("reference", "")
            if ref and ref not in catechism_refs:
                catechism_refs.append(ref)
        
        # Generate explanation
        try:
            response = llm.invoke(prompt)
            explanation = str(response.content).strip() if hasattr(response, 'content') else str(response).strip()
        except Exception as e:
            explanation = "This verse reminds us of God's infinite love and mercy. The Catechism teaches us that Scripture is the living Word of God, speaking to us today. Let us meditate on this verse and apply its wisdom to our daily lives."
        
        # Prepare response
        result = {
            "verse_text": verse_text,
            "verse_reference": verse_reference,
            "explanation": explanation,
            "catechism_references": catechism_refs[:2]  # Limit to 2 references
        }
        
        # Cache the result
        verse_of_day_cache[today] = result
        
        return VerseOfTheDayResponse(**result)
        
    except Exception as e:
        # Fallback response
        return VerseOfTheDayResponse(
            verse_text="For God so loved the world, as to give his only begotten Son: that whosoever believeth in him may not perish, but may have life everlasting.",
            verse_reference="John 3:16",
            explanation="This verse encapsulates the heart of the Gospel - God's infinite love for humanity. The Catechism teaches that God's love is the source of our salvation. Today, let us reflect on how we can share this divine love with others.",
            catechism_references=["CCC 457", "CCC 458"]
        )

# 7) /qa endpoint
@app.post("/qa", response_model=QAResponse)
def qa(request: QARequest):
    key = f"{request.mode.value}|{request.question.strip()}"
    cached = cache.get(key)
    if cached:
        return QAResponse(**cached)
    # Build retriever with optional source filter
    filter_opt = None
    if request.mode == SourceMode.bible:
        filter_opt = {"source": "Bible"}
    elif request.mode == SourceMode.catechism:
        filter_opt = {"source": "CCC"}

    local_retriever = vectorstore.as_retriever(
        search_kwargs={"k": 8, **({"filter": filter_opt} if filter_opt else {})}
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=local_retriever,
        chain_type_kwargs={"prompt": prompt_for_mode(request.mode.value)},
    )

    try:
        res = chain.invoke({"query": request.question})
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
# 11) (optional) serve your UI if it exists
ui_path = "graceguide-ui/dist"
if os.path.isdir(ui_path):
    app.mount("/static", StaticFiles(directory=ui_path, html=False), name="static")

    from fastapi.responses import FileResponse

    @app.get("/", include_in_schema=False)
    def landing_page():
        return FileResponse(os.path.join(ui_path, "index.html"))

    @app.get("/app", include_in_schema=False)
    def qa_page():
        return FileResponse(os.path.join(ui_path, "index.html"))
else:
    # avoids startup crash when dist folder is missing
    print(f"Static UI not found at {ui_path}, skipping mount")

# To run locally:
# uvicorn app:app --reload --port 8000
