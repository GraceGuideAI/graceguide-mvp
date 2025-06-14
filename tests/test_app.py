import os
import importlib
import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pytest

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test")
    monkeypatch.setenv("ADMIN_PASSWORD", "secret")
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    import app as app_module
    importlib.reload(app_module)
    monkeypatch.setattr(app_module, "CACHE_FILE", tmp_path/"cache.json", raising=False)
    app_module.cache = {}
    monkeypatch.setattr(app_module.metrics, "METRICS_FILE", tmp_path/"metrics.csv", raising=False)

    call_count = {"n": 0}
    def fake_from_chain_type(*args, **kwargs):
        class Dummy:
            def invoke(self, params):
                call_count["n"] += 1
                return {"result": "Ans\n=== Sources ===\n- Foo"}
        return Dummy()
    monkeypatch.setattr(app_module.RetrievalQA, "from_chain_type", staticmethod(fake_from_chain_type))

    return TestClient(app_module.app), app_module, call_count

def test_qa_caching(client):
    c, app_module, count = client
    payload = {"question": "Hi", "mode": "both"}
    r1 = c.post("/qa", json=payload)
    assert r1.status_code == 200
    assert r1.json()["answer"] == "Ans"
    r2 = c.post("/qa", json=payload)
    assert r2.status_code == 200
    assert count["n"] == 1
    assert app_module.cache

def test_subscribe_local_csv(client, tmp_path, monkeypatch):
    c, app_module, _ = client
    monkeypatch.chdir(tmp_path)
    r = c.post("/subscribe", json={"email": "test@example.com"})
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    assert (tmp_path/"subscribers.csv").exists()

def test_log_event_and_metrics(client):
    c, app_module, _ = client
    r = c.post("/log_event", json={"event": "modal_shown"})
    assert r.status_code == 200
    r2 = c.get("/metrics", auth=("admin", "secret"))
    assert r2.status_code == 200
    assert r2.json() == {"modal_shown": 1}
