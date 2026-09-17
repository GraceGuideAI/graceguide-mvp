# GraceGuide

GraceGuide is a Catholic chat application grounded in Scripture and the Catechism.
The first screen opens directly to a question composer. A sidebar contains past
conversations, the prayer library, daily inspiration, and preferences.

## Architecture

- React 18 + Vite frontend in `graceguide-ui/`; CSS ships in the build (no Tailwind CDN).
- FastAPI in `app.py`, serving both `/qa` and the compiled frontend on one origin.
- LangChain/OpenAI for retrieval and structured answer generation. `templates.py`
  controls tone; `qa_logic.py` filters evidence and validates numbered references.
- Browser-local conversations and favorites. Signing in grants the existing unlimited
  question allowance; it does **not** provide cloud conversation syncing.
- PostgreSQL persistence and Supabase vector retrieval are optional existing integrations.

## Local development

Use Python 3.11+ and Node 20+.

```sh
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Supply environment variables through your shell; do not commit secrets.
uvicorn app:app --reload --port 8000
```

In another terminal:

```sh
cd graceguide-ui
npm ci
npm run dev
```

Vite proxies the API to port 8000. Production uses relative API URLs on the same
origin. If intentionally splitting deployments, set `VITE_API_URL` for the frontend
and the matching CORS origins for the backend.

## Configuration

`OPENAI_API_KEY` is required at backend startup. Set a strong, stable `JWT_SECRET`;
Render startup rejects the known insecure default. Keep an existing secret stable
so deployed accounts stay signed in. `ADMIN_PASSWORD` protects administrative metrics.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` select the existing Supabase vector
library. Without them the app expects a prebuilt local Chroma library at
`veritas_ai_chroma_db/`. `DATABASE_URL` independently enables durable storage of
accounts, subscribers, and metrics. The new chat path does not use the old shared
QA cache, so personal conversation context cannot collide with cached answers.

`build_db.py` is a destructive ingestion operation: it attempts to clear the
existing vector document table before re-embedding. Do not run it to diagnose a
missing connection or as part of an ordinary deployment.

## Answer contract

`POST /qa` accepts `question`, `mode` (`both`, `bible`, `catechism`), and an optional
`history` array of up to 10 `{role, content}` turns. Responses remain
`{answer, sources}`. The answer is Markdown with numbered citations; the source
list uses actual retrieved metadata and excerpts. Unknown evidence numbers are
rejected. This validates reference provenance, not every theological interpretation
or pre-existing error in the source corpus.

Retrieval in `both` mode queries both source types. Follow-up context includes recent
user turns for retrieval and recent user/assistant turns for generation. Requests
are bounded, errors are retryable, and failures do not consume the UI allowance.
The inherited anonymous limit remains browser-enforced, not an abuse-control system.

`GET /verse-of-the-day` returns only `verse_text` and `verse_reference`.
`GET /health` includes `commit` from Render for deployment verification.

## Checks

```sh
pip install pytest httpx
python -m pytest -q
python scripts/verify_daily_verses.py
cd graceguide-ui
npm run test
npm run build
```

Backend tests use mocked retrieval/model responses, without paid API calls. Live
model quality and production authentication/retrieval still require a configured
service smoke test. See `DEPLOYMENT.md` for the verified Render setup and rollout.
