# GraceGuide MVP

This project provides a small FastAPI service powered by LangChain with a Vite/Vanilla JS frontend. The service exposes a `/qa` endpoint for question answering and a `/subscribe` endpoint for email sign‑ups.

## Prerequisites

- **Python**: 3.11 or newer
- **Node.js**: 18 or newer (for the frontend build)
- **npm**: comes with Node and is used to run Vite

## Installation

Install Python packages:

```bash
python3 -m pip install -r requirements.txt
```

Install frontend dependencies:

```bash
cd graceguide-ui
npm install
```

## Environment variables

Set your OpenAI key so both the database script and the API can embed and query text:

```bash
export OPENAI_API_KEY=your-openai-key
```

The `/subscribe` endpoint uses a mailing‑list provider. Define the following variables so the endpoint can add emails to your list (values depend on your provider):

```bash
export MAILCHIMP_API_KEY=your-mailchimp-api-key
export MAILCHIMP_SERVER_PREFIX=us1        # e.g. 'us1'
export MAILCHIMP_LIST_ID=abc123456
```

## Building the Chroma database

Run the build script once after setting `OPENAI_API_KEY`:

```bash
python3 build_db.py
```

This creates the `veritas_ai_chroma_db/` directory used by the API.

## Starting the FastAPI server

After the database exists you can start the server. Ensure the UI is built first
using the helper script:

```bash
./scripts/build_frontend.sh
uvicorn app:app --reload --port 8000
```

The UI in `graceguide-ui/dist` will be served automatically once built.

## Building the frontend

To build the static frontend with Vite use the provided script:

```bash
./scripts/build_frontend.sh
```

The output appears in `graceguide-ui/dist/`. When the API is running these files are served as the root website so you can navigate to `http://localhost:8000/` to use the app.

## Deployment

Before deploying the API make sure the UI has been built:

```bash
./scripts/build_frontend.sh
```

The contents of `graceguide-ui/dist/` are what get served in production.

## Feedback log

If you keep notes while using the app, you can write them to `feedback.log`. The file is ignored by Git so your personal feedback stays local.
