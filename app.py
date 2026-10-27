from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, render_template, request, send_file

BASE_DIR = Path(__file__).resolve().parent
DATABASE = Path(os.environ.get("LIFEOS_DATABASE", BASE_DIR / "lifeos_x.db"))
app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


def connect_db() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    DATABASE.parent.mkdir(parents=True, exist_ok=True)
    with connect_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS app_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                state_json TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS activity_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                details_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        db.execute("INSERT OR IGNORE INTO app_state (id, state_json) VALUES (1, '{}')")


@app.get("/")
def home():
    return send_file(BASE_DIR / "templates" / "index.html")


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "service": "LIFEOS X API", "database": "SQLite", "version": "1.0"})


@app.get("/api/state")
def get_state():
    with connect_db() as db:
        row = db.execute("SELECT state_json, updated_at FROM app_state WHERE id = 1").fetchone()
    return jsonify({"state": json.loads(row["state_json"]), "updated_at": row["updated_at"]})


@app.put("/api/state")
def put_state():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or not isinstance(payload.get("state"), dict):
        return jsonify({"error": "Expected JSON object with a 'state' object."}), 400
    state: dict[str, Any] = payload["state"]
    # Bound payload size and only accept simple scalar values from form fields.
    if len(json.dumps(state, ensure_ascii=False)) > 100_000:
        return jsonify({"error": "State payload is too large."}), 413
    if len(state) > 300 or any(not isinstance(k, str) or len(k) > 100 for k in state):
        return jsonify({"error": "Invalid state keys."}), 400
    if any(not isinstance(v, (str, int, float, bool, type(None))) for v in state.values()):
        return jsonify({"error": "State values must be simple values."}), 400
    with connect_db() as db:
        db.execute("UPDATE app_state SET state_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
                   (json.dumps(state, ensure_ascii=False),))
        db.execute("INSERT INTO activity_log (event_type, details_json) VALUES (?, ?)",
                   ("state_saved", json.dumps({"field_count": len(state)})))
    return jsonify({"ok": True, "saved_fields": len(state)})


@app.get("/api/dashboard")
def dashboard():
    with connect_db() as db:
        row = db.execute("SELECT state_json FROM app_state WHERE id = 1").fetchone()
    state = json.loads(row["state_json"])
    def number(key: str) -> float:
        try:
            return float(state.get(key, 0) or 0)
        except (TypeError, ValueError):
            return 0.0
    return jsonify({
        "net_worth": number("savings") - number("totalDebt"),
        "monthly_cash_flow": number("income") - number("expense"),
        "currency": "INR",
        "updated_fields": len(state),
    })


@app.errorhandler(404)
def not_found(_error):
    if request.path.startswith("/api/"):
        return jsonify({"error": "API endpoint not found."}), 404
    return "Page not found", 404


init_db()

if __name__ == "__main__":
    # Local development only. Do not expose the debug server to the public internet.
    app.run(host="127.0.0.1", port=5000, debug=False)
