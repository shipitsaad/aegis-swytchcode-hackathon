"""
One-off script: creates real PayPal sandbox transactions so we have real capture IDs
to test Aegis's refund and escalate branches (not just "deny" on a fake ID).

Our sandbox app's region has no direct card-processing feature (F31), so we use a
normal PayPal-wallet order instead: create the order, YOU approve it once in the
browser (logged in as the sandbox buyer/personal account), then this script captures
it. Two steps:

  1. python seed_paypal.py create      -> creates orders, prints approval links
     (open each link, log in as the sandbox PERSONAL account, approve)
  2. python seed_paypal.py capture     -> captures the approved orders, saves the
     real capture IDs to seed_transactions.json
"""

import json
import sys
import uuid

from tools import _paypal_exec

# The scenarios we need real transactions for.
SEEDS = [
    {"label": "small_verified_duplicate", "amount": "45.00"},
    {"label": "large_risky_amount", "amount": "350.00"},
]

PENDING_FILE = "seed_orders_pending.json"
OUTPUT_FILE = "seed_transactions.json"


def create_order(amount: str) -> dict:
    body = {
        "intent": "CAPTURE",
        "purchase_units": [{"amount": {"currency_code": "USD", "value": amount}}],
    }
    result = _paypal_exec(
        "orders.checkout.orders.create",
        {"body": body},
        extra_headers={"PayPal-Request-Id": str(uuid.uuid4())},
    )
    return result.get("data", result)


def capture_order(order_id: str) -> dict:
    result = _paypal_exec(
        "orders.checkout.capture.create",
        {"order_id": order_id, "body": {}},
        extra_headers={"PayPal-Request-Id": str(uuid.uuid4())},
    )
    return result.get("data", result)


def step_create():
    pending = []
    for seed in SEEDS:
        print(f"Creating order for {seed['label']} (${seed['amount']})...")
        order = create_order(seed["amount"])

        if "id" not in order:
            print(f"  FAILED: {json.dumps(order, indent=2)}")
            continue

        approve_link = next(
            (l["href"] for l in order.get("links", []) if l["rel"] == "payer-action"),
            None,
        ) or next(
            (l["href"] for l in order.get("links", []) if l["rel"] == "approve"), None
        )
        print(f"  Order {order['id']} created. Approve it here:\n    {approve_link}\n")
        pending.append({**seed, "order_id": order["id"], "approve_link": approve_link})

    with open(PENDING_FILE, "w") as f:
        json.dump(pending, f, indent=2)

    print(f"Saved {len(pending)} pending orders to {PENDING_FILE}.")
    print("\n>>> Open each approval link above, log in as your sandbox PERSONAL")
    print(">>> (buyer) account, and approve the payment. Then run:")
    print(">>>   python seed_paypal.py capture\n")


def step_capture():
    with open(PENDING_FILE) as f:
        pending = json.load(f)

    seeded = []
    for p in pending:
        print(f"Capturing order {p['order_id']} ({p['label']})...")
        result = capture_order(p["order_id"])

        status = result.get("status")
        if status != "COMPLETED":
            print(f"  Not completed yet (status: {status}) - did you approve it?")
            print(f"  Full response: {json.dumps(result, indent=2)}")
            continue

        capture = result["purchase_units"][0]["payments"]["captures"][0]
        capture_id = capture["id"]
        print(f"  Captured! ID: {capture_id} (status: {capture['status']})")

        seeded.append(
            {
                "label": p["label"],
                "amount": p["amount"],
                "capture_id": capture_id,
                "order_id": p["order_id"],
            }
        )

    with open(OUTPUT_FILE, "w") as f:
        json.dump(seeded, f, indent=2)

    print(f"\nSaved {len(seeded)} captured transactions to {OUTPUT_FILE}")
    print("\nTest complaints you can now use:")
    for s in seeded:
        print(
            f'  - "I was charged twice, please check capture ID {s["capture_id"]} '
            f'(${s["amount"]}) and refund me."'
        )


if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "create"
    if step == "create":
        step_create()
    elif step == "capture":
        step_capture()
    else:
        print("Usage: python seed_paypal.py [create|capture]")
