"""Small, testable helpers for source-grounded conversational answers."""
import re

CITATION = re.compile(r"\[(\d+)\]")


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
