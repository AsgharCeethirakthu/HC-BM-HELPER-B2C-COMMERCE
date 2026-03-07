from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

from .config import settings


def _db_path() -> Path:
    raw = settings.thread_db_path.strip() or "./data/workspace.db"
    return Path(raw)


def _connect() -> sqlite3.Connection:
    db_path = _db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_workspace_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS workspace_state_user (
                user_email TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )


def _normalize_user_email(user_email: str) -> str:
    return user_email.strip().lower()


def load_workspace_state(user_email: str) -> dict[str, Any]:
    normalized_email = _normalize_user_email(user_email)
    init_workspace_db()
    with _connect() as conn:
        row = conn.execute(
            "SELECT payload_json FROM workspace_state_user WHERE user_email = ?",
            (normalized_email,),
        ).fetchone()
        if not row:
            return {"projects": [], "threads": []}
        try:
            payload = json.loads(str(row["payload_json"]))
        except Exception:
            return {"projects": [], "threads": []}
    if not isinstance(payload, dict):
        return {"projects": [], "threads": []}
    projects = payload.get("projects")
    if not isinstance(projects, list):
        projects = []
    projects = [str(item).strip() for item in projects if isinstance(item, str) and str(item).strip()]
    threads = payload.get("threads")
    if not isinstance(threads, list):
        return {"projects": projects, "threads": []}
    return {"projects": projects, "threads": threads}


def save_workspace_state(user_email: str, state: dict[str, Any], updated_at: str) -> dict[str, Any]:
    normalized_email = _normalize_user_email(user_email)
    raw_projects = state.get("projects", [])
    projects: list[str] = []
    if isinstance(raw_projects, list):
        seen: set[str] = set()
        for item in raw_projects:
            if not isinstance(item, str):
                continue
            cleaned = item.strip()
            if not cleaned:
                continue
            key = cleaned.lower()
            if key in seen:
                continue
            seen.add(key)
            projects.append(cleaned)
    payload = {"projects": projects, "threads": state.get("threads", [])}
    serialized = json.dumps(payload, ensure_ascii=True)
    init_workspace_db()
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO workspace_state_user (user_email, payload_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_email) DO UPDATE SET
                payload_json = excluded.payload_json,
                updated_at = excluded.updated_at
            """,
            (normalized_email, serialized, updated_at),
        )
    return payload
