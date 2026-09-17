# GraceGuide deployment

## Verified September 16, 2026

The Render dashboard connects `GraceGuideAI/graceguide-mvp`, branch `main`, to the
Python web service `graceguide-mvp` (`srv-d0l2u6pr0fns7392rj8g`). The custom domain is
`graceguide.ai`. Auto-Deploy is **On Commit**.

At inspection, GitHub main/local were `75a1df4`, but Render's last successful live
commit was `dd95798`. Multiple attempts to deploy `75a1df4` failed. The latest
recorded attempt exited with status 1; its logs were outside Render's retention
period, so the exact historical error cannot be established from those logs.

The dashboard's actual build command was only `pip install -r requirements.txt`.
This skips Vite and can serve old checked-in `dist` files. It differed from the
repository's `render.yaml`; changes to that YAML do not by themselves prove a
manually configured service has adopted them.

The service-variable editor showed `OPENAI_API_KEY`, but did not list
`JWT_SECRET`, `ADMIN_PASSWORD`, `DATABASE_URL`, `SUPABASE_URL`, or
`SUPABASE_SERVICE_ROLE_KEY` among the checked names. Values were not opened.
Inherited environment-group values and the contents of any legacy vector index
were not verified. Since current code requires a non-default `JWT_SECRET` on
Render, confirm this before retrying a deploy.

## Intended pipeline

1. Develop/review a branch and pass tests.
2. Ensure the existing Render service's **Build Command** is `bash build.sh`.
3. Keep **Start Command** as `uvicorn app:app --host 0.0.0.0 --port $PORT`.
4. Set **Health Check Path** to `/health`.
5. Merge reviewed changes to `main`. On-commit auto-deploy should build Python
   dependencies and run `npm ci && npm run build` inside `graceguide-ui`.
6. Check the new deploy is Live and `/health` reports the merged commit.
7. Verify `graceguide.ai` in a fresh tab: direct question entry, daily verse,
   real QA and follow-ups in all three source modes, citations, signin/signup,
   chat persistence, and a mobile viewport.

Keep the previous successful deploy available for rollback. Do not deploy a
frontend-only build that expects the new history-aware API to an old backend.

## Configuration preflight

Confirm, without publishing secret values:

- `OPENAI_API_KEY` exists and the model is accessible.
- `JWT_SECRET` is strong and stable. Preserve an existing configured secret.
  Startup on Render rejects an unset/default secret; a Blueprint's `generateValue`
  only helps if the service is actually managed by that Blueprint.
- The reference library is present: either the existing Supabase configuration
  (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) with its document table/retrieval
  function, or a populated and persistent legacy Chroma index. An empty library
  now produces an honest retryable 503 instead of a fabricated answer.
- Optional durable application storage uses `DATABASE_URL`; it is independent
  of vector configuration. Flat-file fallback storage is ephemeral on Render.
- `ADMIN_PASSWORD` is configured before using metrics.
- Mailchimp variables are preserved if email subscription is in use.

Do not rebuild vectors or alter the database as part of this UI rollout. Do not
clear a JWT secret to fix a deployment. The user supplied fresh September 17 startup logs explicitly confirming
`RuntimeError: JWT_SECRET is unset/default in production`. This confirms the
current startup blocker; older expired deployments cannot be independently diagnosed.

## Local preview versus production

The redesign branch can be previewed with Vite. Browser interaction verification
can use a disposable test backend, but sample answers are not live OpenAI results.
Production model/retrieval checks must run against the actual deployed backend.
Conversations are browser-local; no cross-device history is implemented.

The service worker caches only app shell/assets, never account/API responses or
daily verses. After deployment, refresh an existing tab to load the new interface.
