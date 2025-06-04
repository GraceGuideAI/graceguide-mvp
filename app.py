from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from enum import Enum
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import os
import json
from pathlib import Path

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
        "https://yourdomain.com",
        "https://ef5c-198-232-127-236.ngrok-free.app"
    ],
    allow_methods=["POST"],
    allow_headers=["*"],
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
