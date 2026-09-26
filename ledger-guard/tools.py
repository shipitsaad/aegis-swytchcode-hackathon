"""
Aegis's tools - the real actions the agent can take.

Every function here calls the Swytchcode CLI (`swy exec ...`) under the hood, using the
exact payload shapes and quirks we verified by hand tonight (see docs/07-TOOL-IDS.md and
docs/05-FINDINGS.md for why each quirk exists - none of this is guessed).

Each function is decorated with @tool so LangGraph can hand it to the LLM directly -
the docstring becomes the tool's description, and the type hints become its schema.
"""

import contextvars
import json
import os
import ssl
import subprocess
import time
import urllib.request

import certifi
from dotenv import load_dotenv
from langchain_core.tools import tool

# Dry-run guardrail: set for the duration of one agent run (see agent.py's
# run_agent_structured) so every `swy exec` call in that run passes Swytchcode's own
# real `--dry-run` flag ("show what would be executed without making the HTTP call") -
# not something we invented client-side. A contextvar (not a plain global) so concurrent
# Flask requests in different threads never leak dry-run state into each other.
_DRY_RUN = contextvars.ContextVar("aegis_dry_run", default=False)

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
JIRA_PROJECT_KEY = os.environ.get("JIRA_PROJECT_KEY", "SCRUM")
JIRA_TASK_ISSUE_TYPE_ID = os.environ.get("JIRA_TASK_ISSUE_TYPE_ID", "10003")


# ---------------------------------------------------------------------------
# Low-level helper: run one `swy exec` call and return the parsed JSON result.
# ---------------------------------------------------------------------------

def run_swy(canonical_id: str, payload: dict, extra_args: list[str] | None = None) -> dict:
    """Run `swy exec <canonical_id> --json` with `payload` as JSON on stdin.

    Raises RuntimeError with a readable message on failure (any exit code != 0).
    """
    cmd = [SWYTCHCODE_BIN, "exec", canonical_id, "--json"]
    if _DRY_RUN.get():
        cmd.append("--dry-run")
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


@tool
def check_customer_pattern(customer_id: str, window_days: int = 30) -> str:
    """Check whether this SAME customer has filed multiple refund/return/dispute cases
    recently - the "serial returner" pattern a real business analyst watches for (someone
    who orders, uses, and returns repeatedly), as opposed to check_leak_pattern's "same
    amount, different customers" systemic-bug pattern. A customer with a long recent history
    of claims may need a human/business policy decision, not another automatic resolution -
    even if this specific case looks perfectly legitimate on its own.

    Call this AFTER identifying the customer (their email if given, else their name) and
    BEFORE deciding what to do, right alongside check_leak_pattern.

    Pass "unknown" for customer_id if the complaint gives you no name or email to identify
    them by - that's expected sometimes, and this check will just report nothing found.

    Returns how many other logged cases in the last `window_days` days belong to this same
    customer, and what happened in each. Two or more prior cases (this would be the 3rd+)
    means a repeat pattern worth flagging, not three unrelated coincidences.
    """
    if not customer_id or customer_id.strip().lower() == "unknown":
        return "No customer identifier given - can't check for a repeat-customer pattern."

    history = _load_case_history()
    cutoff = time.time() - (window_days * 86400)
    needle = customer_id.strip().lower()
    matches = [
        entry
        for entry in history
        if entry.get("timestamp", 0) >= cutoff
        and entry.get("customer_id", "").strip().lower() == needle
    ]
    if len(matches) >= 2:
        summary = ", ".join(f"{m['case_id']} ({m.get('decision', '?')})" for m in matches)
        return (
            f"CUSTOMER PATTERN ALERT: {customer_id} has {len(matches)} other logged case(s) "
            f"in the last {window_days} days: {summary}. This looks like a repeat pattern "
            f"worth flagging to the business, not something to just quietly resolve again."
        )
    return (
        f"No repeat-customer pattern - only {len(matches)} other case(s) for {customer_id} "
        f"in the last {window_days} days."
    )


# ---------------------------------------------------------------------------
# Delivery status - closes a real gap: paypal_lookup_capture only verifies the PAYMENT
# side (does the capture exist, right amount/status). It has no idea whether the product
# itself was actually delivered, so a customer claiming "I never received it" couldn't be
# checked against anything - only judged on plausibility. This tool gives that a real,
# independent signal to weigh, same status Aegis would ask the merchant's own order-
# management/shipping system for.
#
# TEST DATA for the hackathon demo (`order_status.json`, same transparent pattern as
# `_TEST_OVERRIDES` above) - checked whether Swytchcode has a real order/shipping provider
# first (it has `PayPal.shipping_shipment_tracking_v1`, but our sandbox app's OAuth token
# lacks the tracking scope - a real PayPal-side permission gate, not a Swytchcode bug, see
# docs/05-FINDINGS.md F46). In a real deployment, `_lookup_order_status` below is the only
# function that would change - swapped for a real query to the merchant's own order
# database (Shopify, a courier tracking API, a plain SQL/Mongo order table, whatever they
# already run) - every caller of check_delivery_status stays exactly the same.
# ---------------------------------------------------------------------------

_ORDER_STATUS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "order_status.json")


def _lookup_order_status(order_id: str) -> dict | None:
    """The one function a real deployment would replace - reads a local test file here,
    would query the merchant's real order/shipping system there. Everything that calls
    this (just check_delivery_status below) is unaffected by that swap."""
    try:
        with open(_ORDER_STATUS_PATH, "r") as f:
            records = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None
    return records.get(order_id)


@tool
def check_delivery_status(order_id: str) -> str:
    """Check whether an order/capture was actually delivered - use this ONLY when the
    complaint is specifically about the product never arriving or not being delivered
    (not a plain billing/amount dispute, which paypal_lookup_capture already covers).

    This is a second, independent signal beyond payment verification: paypal_lookup_capture
    can only confirm money moved correctly, not whether the item itself showed up. If this
    reports delivered=true but the customer claims non-receipt, treat that as a real
    contradiction, the same way you'd treat mismatched payment data. If delivered=false,
    that supports the customer's claim. If there's no record at all, treat it as
    inconclusive - one more signal to weigh, not a final answer either way.
    """
    record = _lookup_order_status(order_id)
    if record is None:
        return f"NO DELIVERY RECORD found for {order_id} - can't confirm or deny delivery from this alone."
    if record.get("delivered"):
        return (
            f"DELIVERED - {order_id} was marked delivered on {record.get('delivered_at', 'an earlier date')} "
            f"via {record.get('carrier', 'the carrier')}. This contradicts a non-receipt claim."
        )
    status = record.get("status", "not yet delivered")
    return f"NOT DELIVERED - {order_id} status: {status}. This supports a non-receipt claim."


# TEMPORARY dev-only overrides, so we can test the refund/escalate branches tonight
# without a real approved PayPal payment (the sandbox checkout UI is being finicky -
# see docs/03-LOG.md ~19:00 IST). Getting a genuinely live captured payment is a
# stretch item for tomorrow; every OTHER capture ID still hits the real PayPal API.
# Remove this block once real seeded transactions exist.
_TEST_OVERRIDES = {
    "TEST-SMALL": {"id": "TEST-SMALL", "status": "COMPLETED", "amount": {"value": "45.00", "currency_code": "USD"}},
    "TEST-LARGE": {"id": "TEST-LARGE", "status": "COMPLETED", "amount": {"value": "350.00", "currency_code": "USD"}},
    "TEST-DELIVERED": {"id": "TEST-DELIVERED", "status": "COMPLETED", "amount": {"value": "60.00", "currency_code": "USD"}},
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
    if _DRY_RUN.get():
        return json.dumps(
            {
                "dry_run": True,
                "would_execute": "payments.payment.captures.refund",
                "capture_id": capture_id,
                "amount": amount,
                "note": "No real refund issued - dry-run mode. This is what would happen.",
            }
        )
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
    if _DRY_RUN.get():
        return json.dumps(
            {
                "dry_run": True,
                "would_execute": "disputes.customer.acceptClaim.create",
                "dispute_id": dispute_id,
                "note": "No dispute actually accepted - dry-run mode. This is what would happen.",
            }
        )
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
    if _DRY_RUN.get():
        return json.dumps(
            {
                "dry_run": True,
                "would_execute": "disputes.customer.makeOffer.create",
                "dispute_id": dispute_id,
                "offer_amount": amount,
                "note": "No offer actually sent - dry-run mode. This is what would happen.",
            }
        )
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

# Icon + color per message category, using Slack's real legacy `attachments` color bar
# (confirmed live: Slack accepts a JSON-encoded attachments string with a hex `color` and
# renders both the color bar and the emoji for real - not just cosmetic text prefixing).
_SLACK_CATEGORY_STYLE = {
    "refunded": {"emoji": "✅", "color": "#2eb886"},        # green
    "denied": {"emoji": "🚫", "color": "#e01e5a"},          # red
    "settled": {"emoji": "🤝", "color": "#ecb22e"},         # amber
    "escalated": {"emoji": "🔺", "color": "#ecb22e"},       # amber - routine human review
    "systemic_alert": {"emoji": "🚨", "color": "#e01e5a"},  # red - Leak Radar, urgent
    "customer_alert": {"emoji": "🔁", "color": "#ecb22e"},  # amber - repeat-customer pattern
    "info": {"emoji": "ℹ️", "color": "#5E6AD2"},            # default, no strong signal
}


@tool
def slack_notify(text: str, category: str = "info") -> str:
    """Post a message to the team's Slack channel - use this to notify the team about
    an escalation, a large refund, or anything a human should know about.

    `category` picks the icon and color bar so the channel is easy to scan at a glance -
    must be one of: "refunded", "denied", "settled", "escalated" (routine human review),
    "systemic_alert" (Leak Radar - same amount, many customers, urgent), "customer_alert"
    (same customer, repeat pattern), or "info" if none of those fit. Match it to the
    decision you're about to log with notion_log_case.
    """
    style = _SLACK_CATEGORY_STYLE.get(category, _SLACK_CATEGORY_STYLE["info"])
    formatted_text = f"{style['emoji']} {text}"

    if _DRY_RUN.get():
        return json.dumps(
            {
                "dry_run": True,
                "would_execute": "slack.chat.postmessage.create",
                "text": formatted_text,
                "category": category,
                "note": "No real Slack message sent - dry-run mode.",
            }
        )
    payload = {
        "token": "placeholder",  # required by validation, value is unused (F26)
        "body": {
            "channel": SLACK_CHANNEL_ID,
            "text": formatted_text,  # fallback for clients/notifications that skip attachments
            "attachments": json.dumps(
                [{"color": style["color"], "text": formatted_text, "fallback": formatted_text}]
            ),
        },
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
    case_id: str,
    amount: float,
    decision: str,
    reasoning: str,
    status: str,
    customer_id: str = "unknown",
) -> str:
    """Log a resolved or escalated case to the Aegis Ledger in Notion, permanently
    recording what happened. Always call this exactly once per case, as the last step.

    `decision` must be one of: "Refunded", "Denied", "Escalated".
    `status` must be one of: "Open", "Resolved".
    `customer_id` should be the customer's email if the complaint gave one, else their
    name, else "unknown" - this is what check_customer_pattern uses to spot a repeat
    customer across cases, so use the exact same identifier for the same person every time.
    """
    if _DRY_RUN.get():
        return json.dumps(
            {
                "dry_run": True,
                "would_execute": "notion.page.create",
                "case_id": case_id,
                "amount": amount,
                "decision": decision,
                "reasoning": reasoning,
                "status": status,
                "customer_id": customer_id,
                "note": (
                    "No real Notion row created, and nothing was added to Leak Radar's "
                    "history - dry-run mode."
                ),
            }
        )
    # Recorded regardless of whether the Notion call below succeeds - Leak Radar's and
    # check_customer_pattern's pattern detection must not depend on Notion's API being up.
    _append_case_history(
        {
            "case_id": case_id,
            "amount": amount,
            "decision": decision,
            "reasoning": reasoning,
            "status": status,
            "customer_id": customer_id,
            "timestamp": time.time(),
        }
    )

    # Notion's own database schema was created by hand in the UI (F28) with a fixed set of
    # columns - rather than guess it has (or add) a "Customer" property and risk the write
    # failing, fold the identifier into the existing free-text Reasoning field instead.
    reasoning_for_notion = (
        f"[Customer: {customer_id}] {reasoning}" if customer_id and customer_id != "unknown" else reasoning
    )
    payload = {
        "body": {
            "parent": {"database_id": NOTION_DATABASE_ID},
            "properties": {
                "Case ID": {"title": [{"text": {"content": case_id}}]},
                "Amount": {"number": amount},
                "Decision": {"select": {"name": decision}},
                "Reasoning": {"rich_text": [{"text": {"content": reasoning_for_notion}}]},
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


# ---------------------------------------------------------------------------
# Jira - auto-file a real engineering ticket when Leak Radar detects a systemic
# pattern, so it becomes actual tracked work, not just a chat message. Jira Cloud
# is multi-tenant, so unlike every other integration the endpoint isn't a simple
# localhost-bug patch - it needs the account's real cloudId (F44).
# ---------------------------------------------------------------------------

@tool
def jira_file_bug(summary: str, description: str) -> str:
    """File a real Jira ticket - use this ONLY when check_leak_pattern reports a
    PATTERN ALERT (a systemic issue affecting multiple customers), never for a single
    isolated case. This turns a detected pattern into actual tracked engineering work,
    not just a notification.

    `summary` should be a short one-line title (e.g. "Systemic $45 overcharge pattern
    at checkout"). `description` should explain the pattern and cite the case IDs
    check_leak_pattern returned.
    """
    if _DRY_RUN.get():
        return json.dumps(
            {
                "dry_run": True,
                "would_execute": "jira.api.issue.create",
                "summary": summary,
                "note": "No real Jira ticket created - dry-run mode. This is what would happen.",
            }
        )
    payload = {
        "body": {
            "fields": {
                "project": {"key": JIRA_PROJECT_KEY},
                "summary": summary,
                "issuetype": {"id": JIRA_TASK_ISSUE_TYPE_ID},
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {"type": "paragraph", "content": [{"type": "text", "text": description}]}
                    ],
                },
            }
        }
    }
    try:
        result = run_swy("jira.api.issue.create", payload)
        data = result.get("data", {})
        key = data.get("key", "")
        return f"Filed Jira ticket {key}: {data.get('self', '')}"
    except RuntimeError as e:
        return f"JIRA_FAILED: {e}"


ALL_TOOLS = [
    paypal_lookup_capture,
    paypal_refund_capture,
    check_leak_pattern,
    check_customer_pattern,
    check_delivery_status,
    paypal_lookup_dispute,
    paypal_accept_dispute,
    paypal_offer_dispute_settlement,
    slack_notify,
    notion_log_case,
    jira_file_bug,
]
