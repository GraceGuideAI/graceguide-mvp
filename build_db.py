# build_db.py
#
# One-time (or rare) job: embed the Bible + Catechism corpus and store the
# vectors in Supabase pgvector (the `documents` table queried by app.py at
# runtime). Run locally with OPENAI_API_KEY, SUPABASE_URL and
# SUPABASE_SERVICE_ROLE_KEY set:
#
#     OPENAI_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python build_db.py
#
import os
import json
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings

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

# 7) Embed & store in Supabase pgvector (durable; queried by the app at runtime)
from supabase import create_client
from langchain_community.vectorstores import SupabaseVectorStore

api_key = os.getenv("OPENAI_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not (api_key and supabase_url and supabase_key):
    raise SystemExit(
        "Set OPENAI_API_KEY, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running."
    )

client = create_client(supabase_url, supabase_key)

# Idempotent: clear any existing rows so re-running doesn't duplicate the corpus.
try:
    client.table("documents").delete().neq(
        "id", "00000000-0000-0000-0000-000000000000"
    ).execute()
except Exception as e:
    print(f"⚠️  Could not pre-clear documents table ({e}); continuing.")

embeddings = OpenAIEmbeddings(openai_api_key=api_key)
SupabaseVectorStore.from_texts(
    texts=docs,
    embedding=embeddings,
    metadatas=metadatas,
    client=client,
    table_name="documents",
    query_name="match_documents",
    chunk_size=500,
)

print(f"✅ Embedded {len(docs)} chunks into Supabase pgvector (documents table)")
