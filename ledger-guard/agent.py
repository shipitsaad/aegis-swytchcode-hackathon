"""
Aegis's brain - a LangGraph agent (free Groq LLM) that reads a billing complaint,
decides what to do, and calls the real tools in tools.py to do it.

This is the part that satisfies "a real agent, not a script": the LLM itself chooses
which tool to call and in what order, based on what it reads and what each tool
returns - it isn't a fixed if/else pipeline.
"""

import json
import os
import time

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None

from tools import ALL_TOOLS, notion_log_case as _notion_log_case_tool
from tools import _DRY_RUN

load_dotenv()

SYSTEM_PROMPT = """\
You are Aegis, an AI finance-ops agent for a small online business. You handle two kinds \
of situations, each with its own tools and policy below - always figure out which one \
you're in first:

0. Which situation is this?
   - **A formal PayPal dispute**: the customer has escalated through PayPal itself, not
     just contacted the business - look for a dispute ID (often shaped like `PP-D-...`) or
     explicit language like "I filed a dispute" / "opened a case with PayPal". Follow the
     DISPUTE POLICY below.
   - **A plain billing complaint**: everything else - a customer describing a charge
     problem and referencing (or expecting you to find) a payment/capture ID. Follow the
     BILLING COMPLAINT POLICY below.
   Both policies end the same way: always call notion_log_case exactly once, as your last
   action, so there is a permanent record of what happened and why. This means literally
   invoking the notion_log_case tool - never write out what the log entry "would say" as
   plain text instead of calling it. Your final message to the user should be a short
   plain-English summary of what you did, NOT the log entry's fields as JSON or prose -
   if notion_log_case was not actually invoked as a tool call, the case is not done, no
   matter what your final message says. Make a `case_id` yourself for each case (e.g.
   based on the capture/dispute ID or a short slug) - it just needs to be unique and
   traceable. Also identify the customer as a `customer_id` - their email if the complaint
   gives one, else their name, else the literal string "unknown". Use the exact same
   `customer_id` for the same person every time (this is how repeat-customer patterns get
   caught), and always pass it to notion_log_case.

## BILLING COMPLAINT POLICY

You verify the complaint against real PayPal transaction data, then take the right action \
- and only the right action.

1. ALWAYS verify the claim first with paypal_lookup_capture before deciding anything.
   Never take the customer's word for the amount or status - check the real transaction.
2. ALWAYS call check_leak_pattern with the verified amount next, before deciding anything
   else. This tells you whether other customers have recently logged complaints at this
   same amount - a sign of a systemic bug, not one customer's isolated mistake.
3. ALWAYS call check_customer_pattern with this customer's `customer_id` next, before
   deciding anything else. This is a different signal from check_leak_pattern - it catches
   the SAME customer filing refund/return claims again and again (a "serial returner"),
   the kind of thing a real business analyst watches for, not a systemic bug.
3b. If (and only if) the complaint is specifically that the product/order never arrived or
    was never delivered - not just a billing/amount dispute - ALSO call
    check_delivery_status with the order/capture ID before deciding. paypal_lookup_capture
    only proves the payment moved correctly; it says nothing about whether the item itself
    showed up. Weigh what it returns as a real signal: DELIVERED contradicts a non-receipt
    claim (treat like a data contradiction), NOT DELIVERED supports it, NO RECORD is
    inconclusive - one more signal, not a final answer either way.
4. If check_leak_pattern reports a PATTERN ALERT: treat this as a systemic issue, not an
   isolated complaint - even if the amount is small and would normally be routine to
   refund. Do NOT refund it yourself. Call slack_notify (category="systemic_alert") with an
   urgent message that states the pattern explicitly (how many other cases, at what
   amount), then jira_file_bug with
   a one-line summary and a description citing the case IDs (this turns the pattern into
   actual tracked engineering work, not just a notification), then notion_log_case with
   decision="Escalated", status="Open", and reasoning that names the detected pattern
   (not just this one transaction).
5. Otherwise, if check_customer_pattern reports a CUSTOMER PATTERN ALERT: treat this as a
   customer-behavior issue for the business to review, not a bug - even if this specific
   case looks perfectly legitimate verified on its own. Do NOT resolve it yourself. Call
   slack_notify (category="customer_alert") naming the customer and how many recent cases
   they have, then jira_file_bug
   with a summary like "Repeat refund pattern - <customer_id>, N cases in <window>" and a
   description citing the case IDs (clearly distinct from a systemic-bug ticket - this is
   about one customer's behavior, not a broken system), then notion_log_case with
   decision="Escalated", status="Open", reasoning naming the repeat-customer pattern.
6. Otherwise (no pattern of either kind), judge this case on its own by weighing signals
   together - there is no fixed dollar cutoff for what counts as "safe to resolve
   yourself". Weigh:
   - **Verification confidence**: does PayPal's data clearly and specifically confirm
     what the customer described (matching amount, matching status), only loosely fit,
     or actively contradict it (wrong amount, no such capture, already refunded)? If you
     called check_delivery_status, fold its result in the same way - DELIVERED against a
     non-receipt claim is a real contradiction, not just a low-confidence story.
   - **Amount at stake, as a sliding scale, not a line**: bigger amounts deserve more
     caution, but as one input among several - a confidently-verified few-hundred-dollar
     duplicate charge can be safer to resolve than a shaky, vague claim for $50. Treat
     "a couple hundred dollars or more" as roughly where caution starts to matter more,
     not as a rule to check against.
   - **Plausibility of the story**: does the complaint describe an error that genuinely
     happens (a duplicate charge, a cancelled order still billed, a mis-keyed amount)
     with details that hold up against the real transaction, or is it vague/generic and
     doesn't match how a real PayPal transaction would look?
   - **Your overall confidence**: if these signals point in different directions, or you
     are not genuinely confident after weighing them, don't resolve it yourself - default
     to escalating for a human to look at, rather than guessing.
   Then act on the weighing:
   - Confident, verified, plausible, and low-risk to resolve yourself: call
     paypal_refund_capture, then slack_notify (category="refunded") a short summary, then
     notion_log_case with decision="Refunded".
   - The verified data actively contradicts the story: do NOT refund. Call slack_notify
     (category="denied") explaining why the claim doesn't hold up, then notion_log_case
     with decision="Denied".
   - Anything else - genuinely uncertain, a larger amount, an unusual combination of
     signals, or verification that's inconclusive rather than contradictory: do NOT refund
     it yourself. Call slack_notify (category="escalated") to flag it for a human to
     review, then notion_log_case with decision="Escalated" and status="Open" (all other
     cases get status="Resolved").
   State explicitly, in your reasoning, which specific signals drove the decision - not
   just a number you checked against.
## DISPUTE POLICY

A formal PayPal dispute is higher-stakes than a plain complaint - the customer has already \
escalated through PayPal, and PayPal's own dispute tools take real, hard-to-reverse action.

D1. ALWAYS look up the dispute first with paypal_lookup_dispute - never guess its reason,
    amount, or stage.
D2. Weigh signals together, the same way as billing complaints - no fixed rule:
    - **Reason**: some reasons are usually genuinely the business's fault and low-risk to
      just make right (e.g. ITEM_NOT_RECEIVED); others are much higher-stakes and often
      signal fraud or account compromise (e.g. UNAUTHORIZED) rather than something you can
      safely resolve alone.
    - **Amount**, again as a sliding scale, not a line - the same "couple hundred dollars
      or more starts to warrant real caution" intuition applies here too.
    - **Lifecycle stage and your overall confidence**: a dispute still early in INQUIRY
      with a clean, low-risk reason is safer to resolve than one that's ambiguous, high
      -value, or where you're not genuinely confident.
D3. Low-risk and clearly the business's fault to make right: call paypal_accept_dispute,
    then slack_notify (category="refunded"), then notion_log_case with decision="Refunded".
D4. Genuine partial merit - real fault on both sides, or the customer's ask exceeds what's
    warranted: call paypal_offer_dispute_settlement with a fair reduced amount and a clear
    note explaining the offer, then slack_notify (category="settled"), then notion_log_case
    - use the exact string "Settled" for `decision` here (not "Refunded"), so a partial
    settlement is distinguishable in the ledger from a full refund.
D5. Looks like fraud, is high-value, or you're not confident enough to resolve it alone
    (e.g. UNAUTHORIZED transactions almost always land here): do NOT call
    paypal_accept_dispute or paypal_offer_dispute_settlement. Just slack_notify
    (category="escalated") to flag it for a human, then notion_log_case with
    decision="Escalated", status="Open".

Be decisive. Explain your reasoning briefly before each tool call so a human watching \
can follow why you did what you did, then act.
"""


def build_agent():
    # Gemini fallback DISABLED for the live demo (2026-09-26, mid-round): both fallback
    # orderings caused real problems under load - Groq-primary caused ~70s mid-run
    # provider switches ("dropping reasoning block" replay mismatch), Gemini-primary
    # hung completely (90s+, no response, no error). Groq alone is the only config
    # proven to complete every request today, even when it 429s (fails fast and clean,
    # never hangs). Revisit post-event, not mid-demo.
    model = ChatGroq(model="openai/gpt-oss-120b", temperature=0)
    return create_react_agent(model, tools=ALL_TOOLS, prompt=SYSTEM_PROMPT)


def handle_complaint(complaint: str) -> None:
    """Run one complaint through Aegis, printing every reasoning/tool step live."""
    agent = build_agent()

    print(f"\n{'='*70}\nUSER PROMPT: {complaint}\n{'='*70}\n")

    result = agent.invoke({"messages": [{"role": "user", "content": complaint}]})

    for msg in result["messages"]:
        role = msg.__class__.__name__
        if role == "HumanMessage":
            continue  # already printed above
        elif role == "AIMessage":
            if msg.content:
                print(f"[Aegis reasoning] {msg.content}\n")
            for call in getattr(msg, "tool_calls", []) or []:
                print(f"  -> calling tool: {call['name']}({call['args']})")
        elif role == "ToolMessage":
            print(f"  <- tool result: {msg.content}\n")

    print(f"{'='*70}\nFINAL: {result['messages'][-1].content}\n{'='*70}\n")


_TOOL_LABELS = {
    "paypal_lookup_capture": "PayPal Capture Verification",
    "paypal_refund_capture": "Execute PayPal Refund",
    "check_leak_pattern": "Leak Radar: Cluster Check",
    "check_customer_pattern": "Repeat-Customer Pattern Check",
    "check_delivery_status": "Delivery Status Check",
    "paypal_lookup_dispute": "PayPal Dispute Lookup",
    "paypal_accept_dispute": "Accept PayPal Dispute",
    "paypal_offer_dispute_settlement": "Offer Dispute Settlement",
    "slack_notify": "Broadcast Slack Notification",
    "notion_log_case": "Write Notion Ledger Entry",
    "jira_file_bug": "File Jira Engineering Ticket",
}

_FAILURE_MARKERS = (
    "LOOKUP_FAILED",
    "REFUND_FAILED",
    "SLACK_FAILED",
    "NOTION_FAILED",
    "ACCEPT_DISPUTE_FAILED",
    "OFFER_SETTLEMENT_FAILED",
)

# Tools that actually move money, message someone, or write a permanent record - these
# are the ones a co-pilot draft holds back on `--dry-run` and a human must approve
# before they run for real. Lookups (paypal_lookup_capture, paypal_lookup_dispute,
# check_leak_pattern) always run live regardless of dry-run - they're read-only, so
# verification already happened for real by the time a draft is shown for approval.
MUTATING_TOOLS = {
    "paypal_refund_capture",
    "paypal_accept_dispute",
    "paypal_offer_dispute_settlement",
    "slack_notify",
    "notion_log_case",
    "jira_file_bug",
}


def _infer_status(content: str) -> str:
    if any(marker in content for marker in _FAILURE_MARKERS):
        return "blocked"
    if "PATTERN ALERT" in content:
        return "alert"
    return "success"


def run_agent_structured(complaint: str, dry_run: bool = False) -> dict:
    """Run one complaint through the real Aegis agent (same LangGraph + Groq agent as
    handle_complaint) and return the full execution trace as data instead of printing it -
    this is what the web UI calls, so what it shows is the actual live agent, never a
    canned/scripted replay.

    If `dry_run` is True, every tool that would move money, post to Slack, or write to
    Notion instead returns a "here's what I would have done" description - no live calls,
    no side effects, using Swytchcode's own real `--dry-run` flag underneath. The agent
    itself has no idea dry-run is on; it reasons and decides exactly the same way.
    """
    agent = build_agent()
    start = time.time()
    dry_run_token = _DRY_RUN.set(dry_run)

    def elapsed() -> str:
        return f"{time.time() - start:.2f}s"

    steps = []
    pending_by_call_id = {}
    reasoning_chunks = []
    decision = amount = case_id = None
    slack_text = None
    notion_row = None

    seen = 0
    last_messages = []
    # Stream (not invoke) so each step's timestamp reflects when it actually happened,
    # not when we got around to reading the finished result afterward.
    for state in agent.stream(
        {"messages": [{"role": "user", "content": complaint}]}, stream_mode="values"
    ):
        last_messages = state["messages"]
        for msg in last_messages[seen:]:
            role = msg.__class__.__name__
            if role == "HumanMessage":
                continue
            elif role == "AIMessage":
                if msg.content:
                    reasoning_chunks.append(msg.content)
                for call in getattr(msg, "tool_calls", []) or []:
                    step = {
                        "id": call["id"],
                        "name": _TOOL_LABELS.get(call["name"], call["name"]),
                        "tool": call["name"],
                        "status": "running",
                        "timestamp": elapsed(),
                        "detail": f"Calling with {json.dumps(call['args'])}",
                        "args": call["args"],
                    }
                    steps.append(step)
                    pending_by_call_id[call["id"]] = step
                    if call["name"] == "slack_notify":
                        slack_text = call["args"].get("text")
                    elif call["name"] == "notion_log_case":
                        decision = call["args"].get("decision")
                        amount = call["args"].get("amount")
                        case_id = call["args"].get("case_id")
                        notion_row = {
                            "caseId": call["args"].get("case_id"),
                            "amount": f"${call['args'].get('amount', 0):.2f}",
                            "decision": call["args"].get("decision"),
                            "reasoning": call["args"].get("reasoning"),
                            "status": call["args"].get("status"),
                        }
            elif role == "ToolMessage":
                step = pending_by_call_id.get(getattr(msg, "tool_call_id", None))
                if step:
                    step["status"] = _infer_status(msg.content)
                    step["timestamp"] = elapsed()
                    step["detail"] = msg.content
        seen = len(last_messages)

    final_reasoning = reasoning_chunks[-1] if reasoning_chunks else (
        last_messages[-1].content if last_messages else ""
    )

    # Safety net: occasionally the model writes the log entry's fields out as its final
    # message instead of actually invoking notion_log_case (a real, if rare, tool-calling
    # slip on Groq's end - the prompt above tells it not to, this covers the times it
    # still does). If that happened, recover the fields it clearly intended and actually
    # log them for real - the decision content still comes from the model's own reasoning,
    # this just makes sure it's not silently lost. Labeled "auto-recovered" so it's never
    # mistaken for something the model did unprompted.
    if notion_row is None:
        try:
            parsed = json.loads(final_reasoning)
        except (json.JSONDecodeError, TypeError):
            parsed = None
        if isinstance(parsed, dict) and "decision" in parsed:
            case_id = parsed.get("case_id") or f"AUTO-{int(time.time())}"
            amount = parsed.get("amount", 0)
            decision = parsed.get("decision")
            reasoning_text = parsed.get("reasoning", final_reasoning)
            status = parsed.get("status", "Resolved")
            recovered_args = {
                "case_id": case_id,
                "amount": amount,
                "decision": decision,
                "reasoning": reasoning_text,
                "status": status,
                "customer_id": parsed.get("customer_id", "unknown"),
            }
            log_result = _notion_log_case_tool.invoke(recovered_args)
            steps.append(
                {
                    "id": "auto-recovered-notion-log",
                    "name": "Write Notion Ledger Entry (auto-recovered)",
                    "tool": "notion_log_case",
                    "status": _infer_status(log_result),
                    "args": recovered_args,
                    "timestamp": elapsed(),
                    "detail": (
                        "The agent produced this log entry as text instead of calling the "
                        f"tool - recovered it and executed the real call. Result: {log_result}"
                    ),
                }
            )
            notion_row = {
                "caseId": case_id,
                "amount": f"${amount:.2f}" if isinstance(amount, (int, float)) else str(amount),
                "decision": decision,
                "reasoning": reasoning_text,
                "status": status,
            }

    _DRY_RUN.reset(dry_run_token)

    # The exact mutating tool calls Aegis decided on, in order, with their real args -
    # everything a co-pilot approval needs to replay for real later, without re-invoking
    # the LLM (avoids a second Groq call and any chance it decides differently on retry).
    pending_actions = [
        {"tool": s["tool"], "args": s.get("args", {})}
        for s in steps
        if s["tool"] in MUTATING_TOOLS
    ]

    return {
        "steps": steps,
        "final_reasoning": final_reasoning,
        "decision": decision,
        "amount": amount,
        "case_id": case_id,
        "slack_text": slack_text,
        "notion_row": notion_row,
        "dry_run": dry_run,
        "pending_actions": pending_actions,
    }


if __name__ == "__main__":
    import sys

    complaint = " ".join(sys.argv[1:]) or (
        "I was charged twice for my order, please check capture ID FAKE123 and refund me."
    )
    handle_complaint(complaint)
