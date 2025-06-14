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
The `requirements.txt` file pins the exact package versions used by the
project so your environment matches the tested configuration.

Install frontend dependencies:

```bash
cd graceguide-ui
npm install
# Installs Vite and other packages so the build script can run successfully
```

`npm run build` now runs `npm ci` automatically via a `prebuild` script, so packages
will be installed if they're missing.

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

If these variables are not set or Mailchimp returns an error, emails are stored
locally in `subscribers.csv`. The endpoint checks both your Mailchimp list and
the CSV file to avoid duplicates.

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

You can also run `npm run build` directly; it will install dependencies first
thanks to the new `prebuild` step.

The output appears in `graceguide-ui/dist/`. When the API is running these files are served as the root website so you can navigate to `http://localhost:8000/` to use the app.

## Deployment

Before deploying the API make sure the UI has been built:

```bash
./scripts/build_frontend.sh
```

The contents of `graceguide-ui/dist/` are what get served in production.

## Testing share image generation

After building the frontend you can verify the `generateShareImage()` helper
using a small Node script. Install the Node dependencies once and run:

```bash
npm install
node scripts/test_share_image.js
```

The script launches Puppeteer, loads the built `index.html` file and checks that
the returned PNG is 540×960 pixels.

## Metrics

The API records simple user interaction events to `metrics.csv`. You can fetch
aggregated counts from the authenticated `/metrics` endpoint:

```bash
curl -u admin:YOUR_ADMIN_PASSWORD http://localhost:8000/metrics
```

Events are logged via the `/log_event` endpoint which the frontend calls when
the popup is shown, an email submission succeeds or fails, and when a user
clicks **Maybe Later**.

## Feedback log

If you keep notes while using the app, you can write them to `feedback.log`. The file is ignored by Git so your personal feedback stays local.
