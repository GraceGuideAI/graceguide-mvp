"""Optional Postgres (Supabase) persistence layer.

When DATABASE_URL is set, users / subscribers / metrics / qa-cache are stored in
Postgres so they survive Render redeploys. When it is unset, `enabled` is False
and callers fall back to the legacy flat-file behavior — which makes this change
safe to deploy *before* the env vars are configured (nothing breaks; persistence
simply turns on once DATABASE_URL is present).

Use the Supabase Supavisor transaction pooler connection string (port 6543).
psycopg is imported lazily so importing this module never fails when the package
isn't installed (e.g. local runs without the DB).
"""
import os
import json
import logging

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
enabled = bool(DATABASE_URL)

_pool = None


def _get_pool():
    global _pool
    if _pool is None:
        from psycopg_pool import ConnectionPool
        # Small pool — Render dynos are ephemeral and may scale; the transaction
        # pooler multiplexes, so a handful of client connections is plenty.
        _pool = ConnectionPool(
            DATABASE_URL, min_size=0, max_size=5,
            kwargs={"autocommit": True}, open=True,
        )
    return _pool


def _exec(query, params=None, fetch=None):
    with _get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            if fetch == "one":
                return cur.fetchone()
            if fetch == "all":
                return cur.fetchall()
    return None


# --- Users ---------------------------------------------------------------
def get_user(email):
    row = _exec(
        "select email, password_hash from public.users where lower(email) = lower(%s)",
        (email,), fetch="one",
    )
    return {"email": row[0], "password_hash": row[1]} if row else None


def create_user(email, password_hash):
    _exec(
        "insert into public.users (email, password_hash) values (%s, %s)",
        (email, password_hash),
    )


# --- Subscribers ---------------------------------------------------------
def subscriber_exists(email):
    return _exec(
        "select 1 from public.subscribers where lower(email) = lower(%s)",
        (email,), fetch="one",
    ) is not None


def add_subscriber(email, source="web"):
    _exec(
        "insert into public.subscribers (email, source) values (%s, %s) "
        "on conflict (email) do nothing",
        (email, source),
    )


# --- Metrics -------------------------------------------------------------
def log_metric(event):
    _exec("insert into public.metrics (event) values (%s)", (event,))


def metric_counts():
    rows = _exec("select event, count(*) from public.metrics group by event", fetch="all")
    return {r[0]: int(r[1]) for r in (rows or [])}


# --- QA cache ------------------------------------------------------------
def qa_cache_get(key):
    row = _exec(
        "select answer, sources from public.qa_cache where cache_key = %s",
        (key,), fetch="one",
    )
    return {"answer": row[0], "sources": row[1]} if row else None


def qa_cache_set(key, answer, sources):
    _exec(
        "insert into public.qa_cache (cache_key, answer, sources) values (%s, %s, %s::jsonb) "
        "on conflict (cache_key) do update set answer = excluded.answer, sources = excluded.sources",
        (key, answer, json.dumps(sources)),
    )
