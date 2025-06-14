import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))
import os
os.environ.setdefault("OPENAI_API_KEY", "test")

import pytest
from fastapi.testclient import TestClient
from app import app
from unittest.mock import AsyncMock
import httpx

def test_liturgical_cache(monkeypatch):
    sample = {
        "date": "2025-06-15",
        "season": "ordinary",
        "weekday": "Sunday",
        "celebrations": [{"title": "Sample Feast", "colour": "white", "rank": "Solemnity"}]
    }

    async def fake_get(url, timeout=10):
        request = httpx.Request("GET", url)
        return httpx.Response(200, json=sample, request=request)

    mock = AsyncMock(side_effect=fake_get)
    monkeypatch.setattr(httpx.AsyncClient, "get", mock)

    with TestClient(app) as client:
        resp1 = client.get("/liturgical-day?date=2025-06-15")
        assert resp1.status_code == 200
        assert resp1.json()["celebrations"][0]["title"] == "Sample Feast"

        # second call should hit cache
        resp2 = client.get("/liturgical-day?date=2025-06-15")
        assert resp2.json() == resp1.json()
        assert mock.call_count == 1
