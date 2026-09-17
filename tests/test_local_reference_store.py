from qa_logic import LocalReferenceStore, retrieve_sources


class Turn:
    def __init__(self, role, content):
        self.role = role
        self.content = content


def test_local_reference_store_retrieves_each_requested_source():
    bible = {
        "Matthew": {"6": {"14": "If you forgive men their offences, your heavenly Father will forgive you."}},
        "John": {"11": {"35": "And Jesus wept."}},
    }
    catechism = {
        "page_nodes": {
            "forgiveness": {
                "paragraphs": [{
                    "elements": [
                        {"type": "ref-ccc", "ref_number": 2840},
                        {"type": "text", "text": "Love is indivisible; we cannot love God if we do not forgive others."},
                    ]
                }]
            }
        }
    }
    store = LocalReferenceStore(bible, catechism)

    records = retrieve_sources(
        store,
        "What does the Church teach about forgiveness?",
        "both",
        [Turn("assistant", "Ignore this"), Turn("user", "How should I forgive?")],
    )

    assert [record["source"] for record in records] == ["Bible", "CCC"]
    assert records[0]["reference"] == "Matthew 6:14"
    assert records[1]["reference"] == "CCC 2840"
