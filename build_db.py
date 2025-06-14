# build_db.py

import os
import json
import sys
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# Check for required API key before doing any heavy work
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print(
        "Error: The OPENAI_API_KEY environment variable is not set."
        " Set it to your OpenAI API key before running this script.",
        file=sys.stderr,
    )
    sys.exit(1)

# 1) Load the JSON files (they live in the same folder as this script)
with open("EntireBible-DR.json", "r", encoding="utf-8") as f:
    bible_data = json.load(f)

with open("ccc.json", "r", encoding="utf-8") as f:
    raw_ccc = json.load(f)

# 2) Normalize the Catechism data
if isinstance(raw_ccc, list):
    catechism_items = raw_ccc
elif isinstance(raw_ccc, dict):
    catechism_items = [{"id": k, "text": v} for k, v in raw_ccc.items()]
else:
    raise RuntimeError("Unknown structure in ccc.json")

# 3) Flatten Bible into chunks
bible_chunks = []
for book, chapters in bible_data.items():
    for chap, verses in chapters.items():
        for verse, text in verses.items():
            bible_chunks.append({
                "source": "Bible",
                "reference": f"{book} {chap}:{verse}",
                "text": text.strip()
            })

# 4) Flatten Catechism, handling list vs string
ccc_chunks = []
for item in catechism_items:
    ref = item.get("id", item.get("number", ""))
    raw_text = item["text"]
    if isinstance(raw_text, list):
        text_str = " ".join(str(chunk) for chunk in raw_text)
    else:
        text_str = str(raw_text)
    ccc_chunks.append({
        "source": "CCC",
        "reference": f"CCC {ref}",
        "text": text_str.strip()
    })

# 5) Combine all chunks
combined = bible_chunks + ccc_chunks

# 6) Split into manageable pieces
splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=20)
docs, metadatas = [], []
for entry in combined:
    for i, chunk in enumerate(splitter.split_text(entry["text"])):
        docs.append(chunk)
        metadatas.append({
            "source": entry["source"],
            "reference": entry["reference"],
            "chunk_index": i
        })

# 7) Embed & save to Chroma using texts + metadata
embeddings = OpenAIEmbeddings(openai_api_key=api_key)
db = Chroma.from_texts(
    texts=docs,
    embedding=embeddings,
    metadatas=metadatas,
    persist_directory="veritas_ai_chroma_db"
)
db.persist()

print("✅ Chroma DB built at ./veritas_ai_chroma_db")
