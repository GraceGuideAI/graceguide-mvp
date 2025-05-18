from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os

from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_community.chat_models import ChatOpenAI

from templates import veritas_prompt

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

# 5) Build the QA chain
db_qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    chain_type_kwargs={"prompt": veritas_prompt}
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
class QARequest(BaseModel):
    question: str

class QAResponse(BaseModel):
    answer: str
    sources: list[str]

# 8) /qa endpoint
@app.post("/qa", response_model=QAResponse)
def qa(request: QARequest):
    # Invoke the QA chain
    res = db_qa.invoke({"query": request.question})
    raw = res["result"].strip()

    # Separate answer from sources block
    if "=== Sources ===" in raw:
        answer_text, sources_block = raw.split("=== Sources ===", 1)
    else:
        answer_text, sources_block = raw, ""

    # Extract bullet lines as source list
    sources = [
        line[2:].strip()
        for line in sources_block.splitlines()
        if line.strip().startswith("- ")
    ]

    return QAResponse(
        answer=answer_text.strip(),
        sources=sources
    )

# 9) Serve your production UI build
app.mount(
    "/",
    StaticFiles(directory="graceguide-ui/dist", html=True),
    name="static",
)

# To run locally:
# uvicorn app:app --reload --port 8000
