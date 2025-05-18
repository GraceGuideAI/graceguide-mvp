import os
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_community.chat_models import ChatOpenAI
from templates import veritas_prompt

# 1) Read API key
api_key = os.getenv("OPENAI_API_KEY")

# 2) Load your Chroma vector store
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

# 5) Build the RetrievalQA chain with custom prompt
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": veritas_prompt}
)

def answer_query(query: str):
    # Fetch answer
    res = qa_chain.invoke({"query": query})
    # Print Answer header with spacing
    print("=== Answer ===\n")
    # Print the generated answer
    print(res["result"].strip())
    # Print each source bullet
    for line in res["result"].splitlines():
        if line.strip().startswith("-"):
            print(line)

if __name__ == "__main__":
    print("Veritas AI QA Agent. Ask away!\n")
    while True:
        q = input("Question: ")
        if q.lower() in ("exit", "quit"):
            break
        answer_query(q)
