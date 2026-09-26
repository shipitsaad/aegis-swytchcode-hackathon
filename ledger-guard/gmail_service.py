"""
Standalone Gmail Live Service for Aegis.
Runs on port 5002 so it never touches or interferes with api_server.py (port 5001).
Uses the real Swytchcode CLI to read, inspect, process, and mark-as-read real emails.
"""

import html
import json
import os
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

# Add local path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agent import run_agent_structured
from gmail_intake import GMAIL_QUERY, get_email_summary, list_matching_emails, mark_as_read
from tools import run_swy

app = Flask(__name__)
CORS(app)

# Optional fallback Groq keys configured via environment variable (comma-separated), not hardcoded
_fallback_keys_raw = os.environ.get("FALLBACK_GROQ_KEYS", "")
FALLBACK_GROQ_KEYS = [k.strip() for k in _fallback_keys_raw.split(",") if k.strip()]

def safe_run_agent(complaint: str, dry_run: bool = False):
    try:
        return run_agent_structured(complaint, dry_run=dry_run)
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "rate_limit" in err_str.lower():
            for key in FALLBACK_GROQ_KEYS:
                if os.environ.get("GROQ_API_KEY") != key:
                    os.environ["GROQ_API_KEY"] = key
                    return run_agent_structured(complaint, dry_run=dry_run)
        raise e


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "aegis-gmail-live", "port": 5002})


@app.route("/profile", methods=["GET"])
def profile():
    """Returns the live connected Gmail profile from Swytchcode."""
    try:
        res = run_swy("gmail.user.profile.get", {"userId": "me"})
        data = res.get("data", res)
        return jsonify(
            {
                "status": "connected",
                "emailAddress": data.get("emailAddress", "saad.saad737@gmail.com"),
                "messagesTotal": data.get("messagesTotal"),
                "query": GMAIL_QUERY,
            }
        )
    except Exception as e:
        return jsonify(
            {
                "status": "error",
                "error": str(e),
                "emailAddress": "saad.saad737@gmail.com",
                "query": GMAIL_QUERY,
            }
        )


@app.route("/inbox", methods=["GET"])
def get_inbox():
    """Lists unread emails in the real mailbox that match the AEGIS TEST subject filter."""
    try:
        raw_msgs = list_matching_emails(max_results=5)
        emails = []
        for msg in raw_msgs:
            try:
                summary = get_email_summary(msg["id"])
                emails.append(summary)
            except Exception as ex:
                emails.append({"id": msg["id"], "error": str(ex)})
        return jsonify(
            {
                "count": len(emails),
                "emails": emails,
                "query": GMAIL_QUERY,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e), "emails": [], "count": 0}), 500


@app.route("/process", methods=["POST"])
def process_message():
    """Processes a specific email by ID, feeds into the real LangGraph agent, and marks read."""
    data = request.get_json(force=True, silent=True) or {}
    msg_id = data.get("id")
    dry_run = bool(data.get("dry_run", False))

    if not msg_id:
        return jsonify({"error": "id field is required"}), 400

    try:
        email = get_email_summary(msg_id)
        complaint = f"Subject: {email['subject']}\n\n{email['snippet']}"

        try:
            outcome = safe_run_agent(complaint, dry_run=dry_run)
        except Exception as e:
            if "429" in str(e) or "rate_limit" in str(e).lower():
                outcome = {
                    "case_id": f"AEGIS-QUEUED-{msg_id[:6]}",
                    "decision": "RATE_LIMIT_PAUSED",
                    "final_reasoning": "Real email successfully captured via Swytchcode (gmail.user.messages.get1). Groq free-tier token quota (200,000 TPD) reached. Rolling quota window resets shortly.",
                    "rate_limited": True,
                }
            else:
                raise e

        # Mark read in real mailbox if not dry-run
        if not dry_run:
            try:
                mark_as_read(msg_id)
                marked_read = True
            except Exception:
                marked_read = False
        else:
            marked_read = False

        return jsonify(
            {
                "status": "success",
                "email": email,
                "outcome": outcome,
                "marked_read": marked_read,
                "dry_run": dry_run,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/scan-and-process", methods=["POST"])
def scan_and_process():
    """Scans for the latest unread AEGIS TEST email, processes it through Aegis, and marks read."""
    data = request.get_json(force=True, silent=True) or {}
    dry_run = bool(data.get("dry_run", False))

    try:
        raw_msgs = list_matching_emails(max_results=1)
        if not raw_msgs:
            return jsonify(
                {
                    "found": False,
                    "message": f"No unread emails found matching {GMAIL_QUERY}",
                    "query": GMAIL_QUERY,
                }
            )

        msg_id = raw_msgs[0]["id"]
        email = get_email_summary(msg_id)
        complaint = f"Subject: {email['subject']}\n\n{email['snippet']}"

        try:
            outcome = safe_run_agent(complaint, dry_run=dry_run)
        except Exception as e:
            if "429" in str(e) or "rate_limit" in str(e).lower():
                outcome = {
                    "case_id": f"AEGIS-QUEUED-{msg_id[:6]}",
                    "decision": "RATE_LIMIT_PAUSED",
                    "final_reasoning": "Real email successfully captured via Swytchcode (gmail.user.messages.get1). Groq free-tier token quota (200,000 TPD) reached. Rolling quota window resets shortly.",
                    "rate_limited": True,
                }
            else:
                raise e

        if not dry_run:
            try:
                mark_as_read(msg_id)
                marked_read = True
            except Exception:
                marked_read = False
        else:
            marked_read = False

        return jsonify(
            {
                "found": True,
                "email": email,
                "outcome": outcome,
                "marked_read": marked_read,
                "dry_run": dry_run,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e), "found": False}), 500


if __name__ == "__main__":
    print(f"Starting Aegis Gmail Live Service on http://localhost:5002...")
    print(f"Monitoring query: {GMAIL_QUERY}")
    app.run(port=5002, debug=False)
