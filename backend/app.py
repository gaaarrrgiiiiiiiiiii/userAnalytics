"""
app.py — Flask application entry point.
Runs the User Analytics API for the CausalFunnel assignment.
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from db import ensure_indexes
from routes.events import events_bp

load_dotenv()

app = Flask(__name__)

# ── CORS ────────────────────────────────────────────────────────────────────── #
# Allow the tracker to POST from any origin (it's embeddable on 3rd-party sites)
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGIN}})

# ── Blueprints ──────────────────────────────────────────────────────────────── #
app.register_blueprint(events_bp)

# ── Health check ────────────────────────────────────────────────────────────── #
@app.get("/")
def health():
    return jsonify({"status": "ok", "service": "UserAnalytics API"}), 200

# ── Init ────────────────────────────────────────────────────────────────────── #
with app.app_context():
    ensure_indexes()
    print("[App] UserAnalytics API ready.")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
