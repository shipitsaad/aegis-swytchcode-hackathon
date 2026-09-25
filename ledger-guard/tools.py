"""
Aegis's tools - the real actions the agent can take.

Every function here calls the Swytchcode CLI (`swy exec ...`) under the hood, using the
exact payload shapes and quirks we verified by hand tonight (see docs/07-TOOL-IDS.md and
docs/05-FINDINGS.md for why each quirk exists - none of this is guessed).

Each function is decorated with @tool so LangGraph can hand it to the LLM directly -
the docstring becomes the tool's description, and the type hints become its schema.
"""

import json
import os
import ssl
import subprocess
import time
import urllib.request

import certifi
from dotenv import load_dotenv
from langchain_core.tools import tool

# macOS's python.org builds don't wire up certificate verification by default,
# which makes urllib fail with CERTIFICATE_VERIFY_FAILED. Use certifi's bundle instead.
_SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

load_dotenv()

# NOTE: intentionally NOT named SWYTCHCODE_BIN - the `swy` CLI itself reads that exact
# variable name internally for something unrelated, and inheriting it into the child
# process causes a self-referential spawn collision (see docs/05-FINDINGS.md F29).
SWYTCHCODE_BIN = os.environ.get("AEGIS_SWY_BIN", "swy")
SLACK_CHANNEL_ID = os.environ.get("SLACK_CHANNEL_ID", "")
NOTION_DATABASE_ID = os.environ.get("NOTION_DATABASE_ID", "")


# ---------------------------------------------------------------------------
# Low-level helper: run one `swy exec` call and return the parsed JSON result.
# ---------------------------------------------------------------------------

def run_swy(canonical_id: str, payload: dict, extra_args: list[str] | None = None) -> dict:
    """Run `swy exec <canonical_id> --json` with `payload` as JSON on stdin.

    Raises RuntimeError with a readable message on failure (any exit code != 0).
    """
    cmd = [SWYTCHCODE_BIN, "exec", canonical_id, "--json"]
    if extra_args:
        cmd.extend(extra_args)

    # Defensively strip SWYTCHCODE_BIN from the child's environment even if something
    # else set it ambiently - see the collision explained above (F29).
    child_env = {k: v for k, v in os.environ.items() if k != "SWYTCHCODE_BIN"}

    result = subprocess.run(
        cmd,
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        timeout=30,
        env=child_env,
    )

    if result.returncode != 0:
        # stdout usually holds Swytchcode's own JSON error body; fall back to stderr.
        detail = result.stdout.strip() or result.stderr.strip()
        raise RuntimeError(f"{canonical_id} failed (exit {result.returncode}): {detail}")

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        raise RuntimeError(f"{canonical_id} returned non-JSON output: {result.stdout!r}")


# ---------------------------------------------------------------------------
# PayPal - fetch our own bearer token (bypasses Swytchcode's plan-gated
# `auth connect paypal` entirely - see docs/05-FINDINGS.md F23).
# ---------------------------------------------------------------------------

_paypal_token_cache: dict = {"token": None, "expires_at": 0}


def _get_paypal_token() -> str:
    """Return a valid PayPal sandbox bearer token, fetching a fresh one if needed."""
    if _paypal_token_cache["token"] and time.time() < _paypal_token_cache["expires_at"]:
        return _paypal_token_cache["token"]

    client_id = os.environ["PAYPAL_CLIENT_ID"]
    client_secret = os.environ["PAYPAL_CLIENT_SECRET"]

    import base64

    creds = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    req = urllib.request.Request(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        data=b"grant_type=client_credentials",
        headers={
            "Authorization": f"Basic {creds}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15, context=_SSL_CONTEXT) as resp:
        data = json.loads(resp.read())

    _paypal_token_cache["token"] = data["access_token"]
    # Refresh a bit early (5 min buffer) rather than exactly on expiry.
    _paypal_token_cache["expires_at"] = time.time() + data["expires_in"] - 300
    return _paypal_token_cache["token"]


def _paypal_exec(canonical_id: str, payload: dict, extra_headers: dict | None = None) -> dict:
    token = _get_paypal_token()
    args = ["--header", f"Authorization=Bearer {token}"]
    for key, value in (extra_headers or {}).items():
        args.extend(["--header", f"{key}={value}"])
    return run_swy(canonical_id, payload, extra_args=args)


# ---------------------------------------------------------------------------
# Leak Radar - pattern detection across recently logged cases. Deliberately reads
# a local JSON file (written by notion_log_case below) rather than querying the
# Notion API live: it needs to be instant and 100% reliable mid-demo, and the
# Notion query tool (`notion.query.create`) is unverified (docs/07-TOOL-IDS.md
# marks it 📋 listed, never executed). Notion stays the human-facing permanent
# ledger; this file is just Aegis's own short-term working memory.
# ---------------------------------------------------------------------------

_CASE_HISTORY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "case_history.json")
_LEAK_AMOUNT_TOLERANCE = 1.00  # dollars - "same amount" allows for cents-level noise


def _load_case_history() -> list[dict]:
    try:
        with open(_CASE_HISTORY_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _append_case_history(entry: dict) -> None:
    history = _load_case_history()
    history.append(entry)
    with open(_CASE_HISTORY_PATH, "w") as f:
        json.dump(history, f, indent=2)


@tool
def check_leak_pattern(amount: float, window_minutes: int = 60) -> str:
    """Check whether recently logged cases show a repeating pattern at this same amount -
    e.g. several customers all complaining about the same ~$45 charge within the last hour,
    which points at a systemic bug (checkout double-charging, a bad webhook retry) rather
    than one customer's isolated mistake.

    Call this AFTER verifying the claim's real amount with paypal_lookup_capture, and
    BEFORE deciding what to do - a pattern should change your decision even for an amount
    that would normally be routine.

    Returns how many other logged cases in the last `window_minutes` minutes were within
    ~$1 of `amount`, and their case IDs. Two or more matches means this is likely the same
    underlying bug hitting multiple customers, not three unrelated one-off mistakes.
    """
    history = _load_case_history()
    cutoff = time.time() - (window_minutes * 60)
    matches = [
        entry
        for entry in history
        if entry.get("timestamp", 0) >= cutoff
        and abs(entry.get("amount", -1e9) - amount) <= _LEAK_AMOUNT_TOLERANCE
    ]
    if len(matches) >= 2:
        case_ids = ", ".join(m["case_id"] for m in matches)
        return (
            f"PATTERN ALERT: {len(matches)} other case(s) at ~${amount:.2f} were logged in "
            f"the last {window_minutes} minutes (case IDs: {case_ids}). This looks like a "
            f"systemic issue affecting multiple customers, not an isolated complaint."
        )
    return (
        f"No pattern detected - only {len(matches)} other case(s) at ~${amount:.2f} in the "
        f"last {window_minutes} minutes. This looks isolated."
    )


# TEMPORARY dev-only overrides, so we can test the refund/escalate branches tonight
# without a real approved PayPal payment (the sandbox checkout UI is being finicky -
# see docs/03-LOG.md ~19:00 IST). Getting a genuinely live captured payment is a
# stretch item for tomorrow; every OTHER capture ID still hits the real PayPal API.
# Remove this block once real seeded transactions exist.
_TEST_OVERRIDES = {
    "TEST-SMALL": {"id": "TEST-SMALL", "status": "COMPLETED", "amount": {"value": "45.00", "currency_code": "USD"}},
    "TEST-LARGE": {"id": "TEST-LARGE", "status": "COMPLETED", "amount": {"value": "350.00", "currency_code": "USD"}},
}


@tool
def paypal_lookup_capture(capture_id: str) -> str:
    """Look up a captured PayPal payment by its capture ID to verify a customer's claim.

    Returns the real transaction details (amount, status) from PayPal, or an error if
    the capture ID doesn't exist - use that to tell whether a complaint is legitimate.
    """
    if capture_id in _TEST_OVERRIDES:
        return json.dumps(_TEST_OVERRIDES[capture_id])
    try:
        result = _paypal_exec("payments.payment.captures.get", {"capture_id": capture_id})
        return json.dumps(result.get("data", result))
    except RuntimeError as e:
        return f"LOOKUP_FAILED: {e}"


@tool
def paypal_refund_capture(capture_id: str, amount: float | None = None, note: str = "") -> str:
    """Refund a captured PayPal payment. Only call this after verifying the claim with
    paypal_lookup_capture. Pass `amount` for a partial refund, or omit it for a full refund.

    This is a real, guarded financial action - only use it when the case genuinely
    warrants a refund (verified duplicate charge or confirmed error), never speculatively.
    """
    if capture_id in _TEST_OVERRIDES:  # temporary dev-only stub, see paypal_lookup_capture
        return json.dumps({"id": f"TEST-REFUND-{capture_id}", "status": "COMPLETED"})

    body: dict = {}
    if amount is not None:
        body["amount"] = {"value": f"{amount:.2f}", "currency_code": "USD"}
    if note:
        body["note_to_payer"] = note

    try:
        result = _paypal_exec(
            "payments.payment.captures.refund", {"capture_id": capture_id, "body": body}
        )
        return json.dumps(result.get("data", result))
    except RuntimeError as e:
        return f"REFUND_FAILED: {e}"


# ---------------------------------------------------------------------------
# PayPal Disputes - a second scenario in the same domain (D20): a customer has filed a
# formal PayPal dispute (escalated through PayPal itself), not just emailed a complaint.
# Same auth workaround as captures (F23). The `disputes.customer.*` bundle shipped with
# the identical localhost sandbox_endpoint bug as every other bundle tried tonight - the
# 4th time in a row (see docs/05-FINDINGS.md) - patched the same way.
# ---------------------------------------------------------------------------

# TEMPORARY dev-only overrides, same reasoning as _TEST_OVERRIDES above: our PayPal
# sandbox account has no real open disputes to test against tonight. Every other dispute
# ID still hits the real API (and correctly returns RESOURCE_NOT_FOUND, confirmed live).
_DISPUTE_TEST_OVERRIDES = {
    "PP-D-TEST-SMALL": {
        "dispute_id": "PP-D-TEST-SMALL",
        "reason": "ITEM_NOT_RECEIVED",
        "dispute_amount": {"value": "60.00", "currency_code": "USD"},
        "dispute_life_cycle_stage": "INQUIRY",
        "status": "WAITING_FOR_SELLER_RESPONSE",
    },
    "PP-D-TEST-LARGE": {
        "dispute_id": "PP-D-TEST-LARGE",
        "reason": "UNAUTHORIZED",
        "dispute_amount": {"value": "500.00", "currency_code": "USD"},
        "dispute_life_cycle_stage": "INQUIRY",
        "status": "WAITING_FOR_SELLER_RESPONSE",
    },
    "PP-D-TEST-MEDIUM": {
        "dispute_id": "PP-D-TEST-MEDIUM",
        "reason": "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED",
        "dispute_amount": {"value": "120.00", "currency_code": "USD"},
        "dispute_life_cycle_stage": "INQUIRY",
        "status": "WAITING_FOR_SELLER_RESPONSE",
    },
}


@tool
def paypal_lookup_dispute(dispute_id: str) -> str:
    """Look up a formal PayPal dispute by its dispute ID - the customer has escalated this
    through PayPal itself (not just emailed the business), which is a different and higher
    -stakes situation than a plain billing complaint.

    Returns the dispute's reason (e.g. ITEM_NOT_RECEIVED, UNAUTHORIZED), amount, and
    lifecycle stage - use these to judge how to respond, the same way you'd use a capture
    lookup for a billing complaint.
    """
    if dispute_id in _DISPUTE_TEST_OVERRIDES:
        return json.dumps(_DISPUTE_TEST_OVERRIDES[dispute_id])
    try:
        result = _paypal_exec("disputes.customer.disputes.get", {"id": dispute_id})
        return json.dumps(result.get("data", result))
    except RuntimeError as e:
        return f"LOOKUP_FAILED: {e}"


@tool
def paypal_accept_dispute(dispute_id: str) -> str:
    """Accept liability for a PayPal dispute in full, by its dispute ID. This closes the
    dispute in the customer's favor and PayPal automatically refunds them from the
    business's account - only call this when the dispute is clearly legitimate and
    low-risk to resolve without a human.
    """
    if dispute_id in _DISPUTE_TEST_OVERRIDES:
        return json.dumps(
            {"dispute_id": dispute_id, "status": "RESOLVED", "outcome": "RESOLVED_BUYER_FAVOUR"}
        )
    try:
        result = _paypal_exec("disputes.customer.acceptClaim.create", {"id": dispute_id})
        return json.dumps(result.get("data", result))
    except RuntimeError as e:
        return f"ACCEPT_DISPUTE_FAILED: {e}"


@tool
def paypal_offer_dispute_settlement(dispute_id: str, amount: float, note: str) -> str:
    """Offer the customer a partial refund to resolve a PayPal dispute, by its dispute ID.
    Use this when a dispute has some merit but not enough to accept it in full - a middle
    ground between accepting outright and escalating to a human. Only works while the
    dispute is still in its early "INQUIRY" stage.
    """
    if dispute_id in _DISPUTE_TEST_OVERRIDES:
        return json.dumps({"dispute_id": dispute_id, "status": "OFFER_MADE", "offer_amount": amount})
    body = {
        "note": note,
        "offer_type": "REFUND",
        "offer_amount": {"value": f"{amount:.2f}", "currency_code": "USD"},
    }
    try:
        result = _paypal_exec(
            "disputes.customer.makeOffer.create", {"id": dispute_id, "body": body}
        )
        return json.dumps(result.get("data", result))
    except RuntimeError as e:
        return f"OFFER_SETTLEMENT_FAILED: {e}"


# ---------------------------------------------------------------------------
# Slack - notify the team. Needs a placeholder top-level "token" field to pass
# Swytchcode's validation (the value is ignored - real auth comes from the
# managed connection's own bot - see docs/05-FINDINGS.md F26).
# ---------------------------------------------------------------------------

@tool
def slack_notify(text: str) -> str:
    """Post a message to the team's Slack channel - use this to notify the team about
    an escalation, a large refund, or anything a human should know about.
    """
    payload = {
        "token": "placeholder",  # required by validation, value is unused (F26)
        "body": {"channel": SLACK_CHANNEL_ID, "text": text},
    }
    try:
        result = run_swy("slack.chat.postmessage.create", payload)
        ok = result.get("data", {}).get("ok")
        return "Message sent." if ok else f"Slack error: {result}"
    except RuntimeError as e:
        return f"SLACK_FAILED: {e}"


# ---------------------------------------------------------------------------
# Notion - log the case to the Aegis Ledger database.
# ---------------------------------------------------------------------------

@tool
def notion_log_case(
    case_id: str, amount: float, decision: str, reasoning: str, status: str
) -> str:
    """Log a resolved or escalated case to the Aegis Ledger in Notion, permanently
    recording what happened. Always call this exactly once per case, as the last step.

    `decision` must be one of: "Refunded", "Denied", "Escalated".
    `status` must be one of: "Open", "Resolved".
    """
    # Recorded regardless of whether the Notion call below succeeds - Leak Radar's
    # pattern detection must not depend on Notion's API being up.
    _append_case_history(
        {
            "case_id": case_id,
            "amount": amount,
            "decision": decision,
            "reasoning": reasoning,
            "status": status,
            "timestamp": time.time(),
        }
    )

    payload = {
        "body": {
            "parent": {"database_id": NOTION_DATABASE_ID},
            "properties": {
                "Case ID": {"title": [{"text": {"content": case_id}}]},
                "Amount": {"number": amount},
                "Decision": {"select": {"name": decision}},
                "Reasoning": {"rich_text": [{"text": {"content": reasoning}}]},
                "Status": {"select": {"name": status}},
            },
        }
    }
    try:
        result = run_swy("notion.page.create", payload)
        url = result.get("data", {}).get("url", "")
        return f"Logged to Notion: {url}"
    except RuntimeError as e:
        return f"NOTION_FAILED: {e}"


ALL_TOOLS = [
    paypal_lookup_capture,
    paypal_refund_capture,
    check_leak_pattern,
    paypal_lookup_dispute,
    paypal_accept_dispute,
    paypal_offer_dispute_settlement,
    slack_notify,
    notion_log_case,
]
