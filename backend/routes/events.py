"""
routes/events.py — All API endpoints as a Flask Blueprint.

Endpoints:
  POST /api/events               ← ingest a tracker event
  GET  /api/sessions             ← list sessions with event counts
  GET  /api/sessions/<id>        ← ordered events for one session
  GET  /api/heatmap?page_url=... ← click coords for heatmap
  GET  /api/pages                ← unique pages with click data
  GET  /api/stats                ← aggregate KPI stats for overview
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from db import events_col
from pymongo import ASCENDING, DESCENDING

events_bp = Blueprint("events", __name__, url_prefix="/api")

# ── Required fields for each event type ────────────────────────────────────── #
REQUIRED_FIELDS = {"session_id", "event_type", "page_url", "timestamp"}
VALID_EVENT_TYPES = {"page_view", "click", "scroll_depth", "form_submit"}


# ═══════════════════════════════════════════════════════════════════════════════
# POST /api/events
# ═══════════════════════════════════════════════════════════════════════════════
@events_bp.route("/events", methods=["POST"])
def ingest_event():
    """
    Accept a single event payload from tracker.js.

    Expected JSON body:
    {
        "session_id":       "uuid-string",
        "event_type":       "page_view" | "click",
        "page_url":         "https://example.com/path",
        "timestamp":        "2024-01-01T12:00:00.000Z",
        "x":                123,          // click only
        "y":                456,          // click only
        "viewport_width":   1440,
        "viewport_height":  900
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body."}), 400

    # ── Validate required fields ─────────────────────────────────────────── #
    missing = REQUIRED_FIELDS - set(data.keys())
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if data["event_type"] not in VALID_EVENT_TYPES:
        return jsonify({"error": f"Invalid event_type. Must be one of: {VALID_EVENT_TYPES}"}), 400

    # ── Build document ───────────────────────────────────────────────────── #
    doc = {
        "session_id":      str(data["session_id"]).strip(),
        "event_type":      data["event_type"],
        "page_url":        str(data["page_url"]).strip(),
        "timestamp":       data["timestamp"],          # stored as string (ISO-8601)
        "viewport_width":  data.get("viewport_width"),
        "viewport_height": data.get("viewport_height"),
        "x":               data.get("x") if data["event_type"] == "click" else None,
        "y":               data.get("y") if data["event_type"] == "click" else None,
        "received_at":     datetime.now(timezone.utc).isoformat(),
    }

    events_col.insert_one(doc)
    return jsonify({"ok": True}), 201


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/sessions
# ═══════════════════════════════════════════════════════════════════════════════
@events_bp.route("/sessions", methods=["GET"])
def list_sessions():
    """
    Return all sessions with aggregate stats.
    Uses MongoDB aggregation to group by session_id.

    Response:
    [
        {
            "session_id":   "uuid",
            "event_count":  12,
            "first_seen":   "ISO timestamp",
            "last_seen":    "ISO timestamp"
        },
        ...
    ]
    """
    pipeline = [
        {
            "$group": {
                "_id":        "$session_id",
                "event_count": {"$sum": 1},
                "first_seen":  {"$min": "$timestamp"},
                "last_seen":   {"$max": "$timestamp"},
            }
        },
        {"$sort": {"last_seen": -1}},   # most recently active first
        {
            "$project": {
                "_id":         0,
                "session_id":  "$_id",
                "event_count": 1,
                "first_seen":  1,
                "last_seen":   1,
            }
        },
    ]

    sessions = list(events_col.aggregate(pipeline))
    return jsonify(sessions), 200


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/sessions/<session_id>
# ═══════════════════════════════════════════════════════════════════════════════
@events_bp.route("/sessions/<session_id>", methods=["GET"])
def get_session_events(session_id):
    """
    Return all events for a single session, ordered by timestamp (user journey).

    Response:
    {
        "session_id": "uuid",
        "events": [
            { "event_type": "page_view", "page_url": "...", "timestamp": "...", "x": null, "y": null },
            { "event_type": "click",     "page_url": "...", "timestamp": "...", "x": 200, "y": 350 },
            ...
        ]
    }
    """
    docs = list(
        events_col.find(
            {"session_id": session_id},
            {"_id": 0, "session_id": 0, "received_at": 0}
        ).sort("timestamp", ASCENDING)
    )

    if not docs:
        return jsonify({"error": f"Session '{session_id}' not found."}), 404

    return jsonify({"session_id": session_id, "events": docs}), 200


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/heatmap?page_url=<url>
# ═══════════════════════════════════════════════════════════════════════════════
@events_bp.route("/heatmap", methods=["GET"])
def get_heatmap():
    """
    Return all click events for a specific page URL.
    Used by the dashboard HeatmapCanvas to plot dots.

    Query param: page_url (required)

    Response:
    {
        "page_url": "https://...",
        "click_count": 42,
        "clicks": [
            { "x": 120, "y": 340, "viewport_width": 1440, "viewport_height": 900 },
            ...
        ]
    }
    """
    page_url = request.args.get("page_url", "").strip()
    if not page_url:
        return jsonify({"error": "Query param 'page_url' is required."}), 400

    docs = list(
        events_col.find(
            {"event_type": "click", "page_url": page_url},
            {"_id": 0, "x": 1, "y": 1, "viewport_width": 1, "viewport_height": 1}
        )
    )

    # Filter out clicks without coordinates
    clicks = [d for d in docs if d.get("x") is not None and d.get("y") is not None]

    return jsonify({
        "page_url":    page_url,
        "click_count": len(clicks),
        "clicks":      clicks,
    }), 200


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/pages  — helper: list all unique page URLs that have click data
# ═══════════════════════════════════════════════════════════════════════════════
@events_bp.route("/pages", methods=["GET"])
def list_pages():
    """
    Return all unique page URLs that have been tracked (any event type).
    Used by the heatmap page dropdown — previously only returned pages
    with click events, leaving the dropdown empty until a click occurred.
    """
    pages = events_col.distinct("page_url")
    return jsonify({"pages": sorted(pages)}), 200


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/stats  — aggregate KPI stats for the dashboard overview
# ═══════════════════════════════════════════════════════════════════════════════
@events_bp.route("/stats", methods=["GET"])
def get_stats():
    """
    Return high-level aggregate stats for the dashboard overview page.

    Response:
    {
        "total_sessions": 42,
        "total_events":   310,
        "page_views":     120,
        "clicks":         150,
        "top_pages": [
            { "page_url": "https://...", "views": 30 },
            ...
        ]
    }
    """
    total_events   = events_col.count_documents({})
    total_sessions = len(events_col.distinct("session_id"))
    page_views     = events_col.count_documents({"event_type": "page_view"})
    clicks         = events_col.count_documents({"event_type": "click"})

    # Top 5 most-visited pages
    pipeline = [
        {"$match": {"event_type": "page_view"}},
        {"$group": {"_id": "$page_url", "views": {"$sum": 1}}},
        {"$sort":  {"views": -1}},
        {"$limit": 5},
        {"$project": {"_id": 0, "page_url": "$_id", "views": 1}},
    ]
    top_pages = list(events_col.aggregate(pipeline))

    return jsonify({
        "total_sessions": total_sessions,
        "total_events":   total_events,
        "page_views":     page_views,
        "clicks":         clicks,
        "top_pages":      top_pages,
    }), 200
