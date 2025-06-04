from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from enum import Enum
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

    res = chain.invoke({"query": request.question})
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
    fname = "subscribers.csv"
    new_file = not os.path.isfile(fname)
    with open(fname, "a", newline="") as f:
        writer = csv.writer(f)
        if new_file:
            writer.writerow(["email"])
        writer.writerow([req.email])
    return {"status": "ok"}

# 9) (optional) serve your UI if it exists
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
