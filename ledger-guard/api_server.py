"""
Tiny local API so the web UI (../web/) can call the real Aegis agent. No mocking, no
canned scripts - every request here runs the actual LangGraph + Groq agent against the
real Swytchcode tool calls in tools.py, exactly like `python agent.py "..."` does on the
command line, just returned as JSON instead of printed.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

from agent import run_agent_structured

app = Flask(__name__)
CORS(app)  # local dev only - the web UI runs on a different port (3000 vs 5001)


@app.route("/run", methods=["POST"])
def run():
    data = request.get_json(force=True, silent=True) or {}
    complaint = (data.get("prompt") or "").strip()
    if not complaint:
        return jsonify({"error": "prompt is required"}), 400
    try:
        return jsonify(run_agent_structured(complaint))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=False)
