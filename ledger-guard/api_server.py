"""
Tiny local API so the web UI (../web/) can call the real Aegis agent. No mocking, no
canned scripts - every request here runs the actual LangGraph + Groq agent against the
real Swytchcode tool calls in tools.py, exactly like `python agent.py "..."` does on the
command line, just returned as JSON instead of printed.
"""

import json
import os
import subprocess

from flask import Flask, jsonify, request
from flask_cors import CORS

from agent import run_agent_structured
from tools import (
    ALL_TOOLS,
    SWYTCHCODE_BIN,
    _DISPUTE_TEST_OVERRIDES,
    _ORDER_STATUS_PATH,
    _TEST_OVERRIDES,
)

app = Flask(__name__)
CORS(app)  # local dev only - the web UI runs on a different port (3000 vs 5001)

TOOLS_BY_NAME = {t.name: t for t in ALL_TOOLS}

# Co-pilot mode: a dry-run gives back a decision the agent has already made but not yet
# acted on ("pending_actions" - the exact mutating tool calls it would make, with their
# real args, captured by run_agent_structured). Held here in memory, keyed by case_id,
# until a human calls /approve (replays those exact calls for real, no second LLM call)
# or /reject (discards them, only the Notion ledger entry gets written, marked as
# human-declined, so there's still an audit trail of what was proposed).
# Single dev-server process, in-memory is fine - doesn't need to survive a restart.
PENDING_CASES: dict[str, list[dict]] = {}


@app.route("/health", methods=["GET"])
def health():
    """Cheap liveness check for the web UI - never touches the agent or Groq's API,
    so refreshing the page doesn't burn tokens just to check the server is up."""
    return jsonify({"status": "ok"})


@app.route("/test-data", methods=["GET"])
def test_data():
    """Exposes the real test fixtures Aegis verifies every demo case against - read directly
    from the same dicts/files `tools.py` actually uses, not re-typed here, so this can never
    drift from what the agent really sees. This is what proves the test IDs aren't invented
    on the spot - they're a real, fixed, inspectable data source, same as a merchant's real
    order database would be in production.
    """
    try:
        with open(_ORDER_STATUS_PATH, "r") as f:
            order_status = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        order_status = {}

    return jsonify(
        {
            "captures": _TEST_OVERRIDES,
            "disputes": _DISPUTE_TEST_OVERRIDES,
            "order_status": order_status,
        }
    )


@app.route("/audit", methods=["GET"])
def audit():
    """Real audit trail from Swytchcode's own local log (~/.swytchcode/audit/) - every
    outbound network call our tools actually made, with real host/status/duration. This
    is Swytchcode's own guardrail feature, not something we built ourselves; we just
    surface it in the UI. Read-only, makes no Groq or Swytchcode calls itself.
    """
    try:
        result = subprocess.run(
            [SWYTCHCODE_BIN, "audit", "network", "--json", "-n", "30"],
            capture_output=True,
            text=True,
            timeout=10,
            env={k: v for k, v in os.environ.items() if k != "SWYTCHCODE_BIN"},
        )
        calls = []
        for line in result.stdout.splitlines():
            line = line.strip()
            if line:
                calls.append(json.loads(line))

        total = len(calls)
        successes = sum(1 for c in calls if 200 <= c.get("status", 0) < 300)
        return jsonify(
            {
                "calls": calls,
                "total": total,
                "successes": successes,
                "success_rate": round(100 * successes / total) if total else None,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e), "calls": [], "total": 0, "successes": 0, "success_rate": None}), 500


@app.route("/run", methods=["POST"])
def run():
    data = request.get_json(force=True, silent=True) or {}
    complaint = (data.get("prompt") or "").strip()
    dry_run = bool(data.get("dry_run", False))
    if not complaint:
        return jsonify({"error": "prompt is required"}), 400
    try:
        result = run_agent_structured(complaint, dry_run=dry_run)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Co-pilot mode: hold the drafted actions until a human approves or rejects them,
    # instead of them just having been simulated and discarded.
    case_id = result.get("case_id")
    if dry_run and case_id and result.get("pending_actions"):
        PENDING_CASES[case_id] = result["pending_actions"]
        result["pending"] = True
    return jsonify(result)


@app.route("/approve", methods=["POST"])
def approve():
    """Replay a co-pilot draft's exact tool calls for real - no second LLM call, so the
    decision that gets executed is exactly the one the human reviewed, not a fresh guess.
    """
    data = request.get_json(force=True, silent=True) or {}
    case_id = (data.get("case_id") or "").strip()
    actions = PENDING_CASES.pop(case_id, None)
    if actions is None:
        return jsonify({"error": f"no pending case '{case_id}' (already actioned, or never existed)"}), 404

    executed = []
    for action in actions:
        tool = TOOLS_BY_NAME.get(action["tool"])
        if tool is None:
            executed.append({"tool": action["tool"], "result": f"UNKNOWN_TOOL: {action['tool']}"})
            continue
        result = tool.invoke(action["args"])
        executed.append({"tool": action["tool"], "result": result})
    return jsonify({"case_id": case_id, "status": "approved", "executed": executed})


@app.route("/reject", methods=["POST"])
def reject():
    """Discard a co-pilot draft's money-moving/messaging actions, but still write the
    Notion ledger entry (marked as human-declined) so the case leaves an audit trail
    instead of vanishing with no record of what was proposed and why it was turned down.
    """
    data = request.get_json(force=True, silent=True) or {}
    case_id = (data.get("case_id") or "").strip()
    actions = PENDING_CASES.pop(case_id, None)
    if actions is None:
        return jsonify({"error": f"no pending case '{case_id}' (already actioned, or never existed)"}), 404

    log_action = next((a for a in actions if a["tool"] == "notion_log_case"), None)
    if log_action is None:
        return jsonify({"case_id": case_id, "status": "rejected", "logged": False})

    args = dict(log_action["args"])
    args["reasoning"] = f"[Human rejected the drafted action] {args.get('reasoning', '')}"
    result = TOOLS_BY_NAME["notion_log_case"].invoke(args)
    return jsonify({"case_id": case_id, "status": "rejected", "logged": True, "notion_result": result})


if __name__ == "__main__":
    app.run(port=5001, debug=False)
