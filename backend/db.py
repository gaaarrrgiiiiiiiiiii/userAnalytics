"""
db.py — PyMongo connection to MongoDB Atlas
Reads MONGODB_URI from .env and exposes a `db` object used by routes.
"""

import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set. Check your .env file.")

client = MongoClient(MONGODB_URI)
# Use DB name from URI if present, otherwise fall back to "useranalytics"
try:
    db = client.get_database()
except Exception:
    db = client["useranalytics"]
events_col = db["events"]

# ── Indexes (idempotent — safe to call multiple times) ──────────────────── #
def ensure_indexes():
    events_col.create_index([("session_id", ASCENDING)])
    events_col.create_index([("event_type", ASCENDING)])
    events_col.create_index([("timestamp", DESCENDING)])
    events_col.create_index([("page_url", ASCENDING), ("event_type", ASCENDING)])
    print("[DB] Indexes ensured.")
