from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from enum import Enum
import os

from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_community.chat_models import ChatOpenAI
from templates import prompt_for_mode

# 1) Read API key
api_key = os.getenv("OPENAI_API_KEY")

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

# 5) Build the QA chain with default (both sources) prompt
db_qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    chain_type_kwargs={"prompt": prompt_for_mode("both")}
)

# 6) Create FastAPI app and enable CORS
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

# 7) Request and response models
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

# 8) /qa endpoint
@app.post("/qa", response_model=QAResponse)
def qa(request: QARequest):
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

    return QAResponse(
        answer=answer_text.strip(),
        sources=sources
    )

# 9) /subscribe endpoint to capture emails
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

# 10) (optional) serve your UI if it exists
ui_path = "graceguide-ui/dist"
if os.path.isdir(ui_path):
    app.mount("/static", StaticFiles(directory=ui_path, html=False), name="static")

    from fastapi.responses import FileResponse

    @app.get("/", include_in_schema=False)
    def landing_page():
        return FileResponse(os.path.join(ui_path, "src", "landing.html"))

    @app.get("/app", include_in_schema=False)
    def qa_page():
        return FileResponse(os.path.join(ui_path, "index.html"))
else:
    # avoids startup crash when dist folder is missing
    print(f"Static UI not found at {ui_path}, skipping mount")

# To run locally:
# uvicorn app:app --reload --port 8000
