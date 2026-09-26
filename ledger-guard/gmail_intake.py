"""
Gmail intake for Aegis - polls for test-tagged unread emails and feeds each one into
the real agent, exactly like typing a complaint into the console. Gmail is just a
different way a complaint arrives; the agent itself doesn't know or care.

Deliberately scoped to emails whose subject contains "AEGIS TEST" (not a blanket
"is:unread" query) - the connected inbox is the user's real personal Gmail account,
which had 200+ unrelated unread emails at connection time. We must never treat real
personal mail as a billing complaint.
"""

import html

from agent import run_agent_structured
from tools import run_swy

GMAIL_QUERY = 'is:unread subject:"AEGIS TEST"'


def list_matching_emails(max_results: int = 10) -> list[dict]:
    result = run_swy(
        "gmail.user.messages.get",  # the LIST endpoint (F42: swapped name)
        {"userId": "me", "q": GMAIL_QUERY, "maxResults": max_results},
    )
    return result.get("data", {}).get("messages", []) or []


def get_email_summary(message_id: str) -> dict:
    result = run_swy(
        "gmail.user.messages.get1",  # the single-message GET (F42: swapped name)
        {"userId": "me", "id": message_id, "format": "full"},
    )
    data = result.get("data", {})
    headers = {h["name"]: h["value"] for h in data.get("payload", {}).get("headers", [])}
    return {
        "id": message_id,
        "subject": headers.get("Subject", ""),
        "from": headers.get("From", ""),
        # Gmail's own plain-text preview - good enough for a complaint's gist without
        # needing to decode the full base64url MIME body.
        "snippet": html.unescape(data.get("snippet", "")),
    }


def mark_as_read(message_id: str) -> None:
    run_swy(
        "gmail.user.modify.create",
        {"userId": "me", "id": message_id, "body": {"removeLabelIds": ["UNREAD"]}},
    )


def check_and_process(max_results: int = 5) -> list[dict]:
    """Check for test-tagged unread emails, run each through the real agent, mark as
    read, and return what happened for each one.
    """
    results = []
    for msg in list_matching_emails(max_results):
        email = get_email_summary(msg["id"])
        complaint = f"Subject: {email['subject']}\n\n{email['snippet']}"
        print(f"\n{'='*70}\nGMAIL INTAKE: {email['subject']} (from {email['from']})\n{'='*70}")
        outcome = run_agent_structured(complaint)
        mark_as_read(msg["id"])
        results.append({"email": email, "outcome": outcome})
        print(f"Decision: {outcome['decision']}\n{outcome['final_reasoning']}\n")
    return results


if __name__ == "__main__":
    found = check_and_process()
    if not found:
        print(f'No matching unread emails found (query: {GMAIL_QUERY}).')
        print('To test: send yourself an email with "AEGIS TEST" in the subject line,')
        print("describing a billing complaint, then run this script again.")
    else:
        print(f"\nProcessed {len(found)} email(s).")
