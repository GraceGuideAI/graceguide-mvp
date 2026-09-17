"""Small, testable helpers for source-grounded conversational answers."""
from collections import defaultdict
from dataclasses import dataclass
import json
import math
import re
from pathlib import Path

CITATION = re.compile(r"\[(\d+)\]")
WORD = re.compile(r"[a-z0-9']+")

STOP_WORDS = {
    "a", "about", "an", "and", "are", "as", "at", "be", "by", "can",
    "catholic", "church", "do", "does", "for", "from", "how", "i", "in",
    "is", "it", "me", "my", "of", "on", "or", "our", "should", "teach",
    "that", "the", "their", "them", "this", "to", "us", "was", "what",
    "when", "where", "which", "who", "why", "with", "would", "you", "your",
}


def _stem(word):
    aliases = {
        "forgiven": "forgive", "forgiving": "forgive", "forgiveness": "forgive",
        "prayed": "pray", "prayer": "pray", "prayers": "pray",
    }
    if word in aliases:
        return aliases[word]
    for suffix in ("ments", "ment", "ness", "ingly", "edly", "ing", "ed", "es", "s"):
        if word.endswith(suffix) and len(word) - len(suffix) >= 4:
            return word[:-len(suffix)]
    return word


def _terms(text):
    return {
        _stem(word) for word in WORD.findall(text.lower())
        if word not in STOP_WORDS and len(word) > 2
    }


@dataclass
class _LocalDocument:
    page_content: str
    metadata: dict


class _LocalRetriever:
    def __init__(self, store, kind, k):
        self.store = store
        self.kind = kind
        self.k = k

    def invoke(self, query):
        return self.store.search(query, self.kind, self.k)


class LocalReferenceStore:
    """Small lexical fallback built from the checked-in Bible and Catechism.

    Render deployments can answer from authoritative local source files even
    when no external vector database has been configured.
    """

    def __init__(self, bible_data, catechism_data):
        self.documents = {"Bible": [], "CCC": []}
        self.index = {"Bible": defaultdict(list), "CCC": defaultdict(list)}
        for book, chapters in bible_data.items():
            for chapter, verses in chapters.items():
                for verse, text in verses.items():
                    self._add("Bible", f"{book} {chapter}:{verse}", str(text))

        for node in catechism_data.get("page_nodes", {}).values():
            for paragraph in node.get("paragraphs", []):
                numbers = [
                    element.get("ref_number")
                    for element in paragraph.get("elements", [])
                    if element.get("type") == "ref-ccc" and element.get("ref_number")
                ]
                text = " ".join(
                    str(element.get("text", "")).strip()
                    for element in paragraph.get("elements", [])
                    if element.get("type") == "text" and element.get("text")
                ).strip()
                if numbers and text:
                    self._add("CCC", f"CCC {numbers[0]}", text)

    @classmethod
    def from_files(cls, bible_path="EntireBible-DR.json", catechism_path="ccc.json"):
        with Path(bible_path).open(encoding="utf-8") as source:
            bible_data = json.load(source)
        with Path(catechism_path).open(encoding="utf-8") as source:
            catechism_data = json.load(source)
        return cls(bible_data, catechism_data)

    def _add(self, kind, reference, text):
        doc_id = len(self.documents[kind])
        self.documents[kind].append(_LocalDocument(
            page_content=text.strip(),
            metadata={"source": kind, "reference": reference},
        ))
        for term in _terms(text):
            self.index[kind][term].append(doc_id)

    def as_retriever(self, search_kwargs):
        return _LocalRetriever(
            self,
            search_kwargs.get("filter", {}).get("source", "Bible"),
            int(search_kwargs.get("k", 6)),
        )

    def search(self, query, kind, k=6):
        documents = self.documents.get(kind, [])
        inverted = self.index.get(kind, {})
        scores = defaultdict(float)
        for term in _terms(query):
            matches = inverted.get(term, [])
            if not matches:
                continue
            weight = math.log(1 + len(documents) / len(matches))
            for doc_id in matches:
                scores[doc_id] += weight
        ranked = sorted(scores, key=lambda doc_id: (-scores[doc_id], doc_id))[:k]
        return [documents[doc_id] for doc_id in ranked]


def retrieve_sources(store, question, mode, history):
    # Include the latest user context so pronouns in follow-ups still retrieve
    # passages about the subject. Never use assistant prose as source evidence.
    previous = [m.content for m in history if m.role == "user"][-2:]
    query = "\n".join(previous + [question])
    kinds = ["Bible", "CCC"] if mode == "both" else ["Bible" if mode == "bible" else "CCC"]
    records = []
    seen = set()
    for kind in kinds:
        docs = store.as_retriever(search_kwargs={"k": 6, "filter": {"source": kind}}).invoke(query)
        for doc in docs:
            metadata = doc.metadata or {}
            reference = str(metadata.get("reference", "")).strip()
            text = doc.page_content.strip()
            # Reject unlabelled evidence or a store that ignored our filter.
            if metadata.get("source") != kind or not reference or not text:
                continue
            key = (kind, reference)
            if key in seen:
                continue
            seen.add(key)
            records.append({"source": kind, "reference": reference, "text": text[:1800]})
            if sum(r["source"] == kind for r in records) >= 3:
                break
    return records


def source_context(records):
    return "\n\n".join(
        f"[{i}] {record['source']} | {record['reference']}\n{record['text']}"
        for i, record in enumerate(records, 1)
    )


def normalize_answer(raw, records):
    """Only emit reference labels/excerpts from retrieved records, never the LLM.

    Validate numbered citations and renumber by first appearance. This proves
    provenance, not whether the model's interpretation is theologically correct.
    """
    answer = raw.strip()
    if not answer or "=== Answer ===" in answer or "=== Sources ===" in answer:
        raise ValueError("Malformed answer")
    ids = list(dict.fromkeys(int(match) for match in CITATION.findall(answer)))
    if not ids or any(i < 1 or i > len(records) for i in ids):
        raise ValueError("Missing or unknown source citation")
    numbering = {old: new for new, old in enumerate(ids, 1)}
    answer = CITATION.sub(lambda match: f"[{numbering[int(match.group(1))]}]", answer)
    sources = [f"{records[i-1]['reference']} — {records[i-1]['text']}" for i in ids]
    return {"answer": answer, "sources": sources}
