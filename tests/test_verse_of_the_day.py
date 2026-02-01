import os
import sys

from fastapi.testclient import TestClient

os.environ.setdefault("OPENAI_API_KEY", "test")
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import app  # noqa: E402


def test_verse_of_the_day_no_not_found():
    app.BIBLE_DATA = {}
    app.verse_of_day_cache.clear()
    client = TestClient(app.app)
    response = client.get("/verse-of-the-day")
    assert response.status_code == 200
    assert response.json()["verse_text"] != "Verse not found"
