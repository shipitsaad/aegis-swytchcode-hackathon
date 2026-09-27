<div align="center">

<img src="assets/banner.png" alt="Aegis" width="100%" />

# Aegis

### The autonomous verification & decision layer for money requests — built on Swytchcode

A real AI agent that reads a billing complaint or PayPal dispute, **verifies it against real
transaction data**, then refunds, denies, or escalates it — with a full audit trail, human-approval
mode, and pattern detection that turns single complaints into flagged engineering/analyst tickets.

*Built in 24 hours for **Build with Swytchcode — Gurgaon Edition** (Track 6: Business Operator).*

[![Framework](https://img.shields.io/badge/framework-LangGraph-5E6AD2?style=flat-square)](https://github.com/langchain-ai/langgraph)
[![LLM](https://img.shields.io/badge/LLM-Groq%20%2F%20Gemini-5E6AD2?style=flat-square)](https://groq.com)
[![Integrations](https://img.shields.io/badge/Swytchcode%20integrations-5-5E6AD2?style=flat-square)](#-swytchcode-integrations)
[![Status](https://img.shields.io/badge/status-live%20demo-brightgreen?style=flat-square)](#)

</div>

---

## Why this exists

Refund and dispute handling looks like a solved problem — until you look closely. A support inbox
gets a complaint, a dispute lands from PayPal, or an internal tool fires an automated request. Someone
(or something) has to decide: **is this real, and what happens next?**

Aegis is that decision layer. Not a script that checks "does the transaction exist → refund" — a real
agent that verifies, cross-references history, weighs signals together, and *only then* acts. It
runs autonomously, or in **co-pilot mode**, where it drafts the decision and a human approves it before
anything real executes.

---

## What it actually does

<table>
<tr><td width="50%" valign="top">

### 🔍 Verifies before acting
Every claim is checked against real PayPal transaction data — not trusted at face value. A fake or
unverifiable capture ID is denied, every time, regardless of what the complaint demands.

### 🧠 Judgment, not a fixed rule
No dollar-amount ceiling. The agent weighs verification confidence, plausibility, and amount together —
and names the specific signals in its reasoning.

### 📡 Leak Radar — cross-case memory
The **same verified $45 transaction**, complained about 3 separate times, was denied → denied →
**escalated**. Identical input, different outcomes — proof this isn't `if/else` wearing a hoodie.

</td><td width="50%" valign="top">

### 🧑‍💻 Co-pilot mode
The agent drafts the refund/deny/escalate decision with the exact tool calls it would make. A human
clicks **Approve** or **Reject** before any money moves or message sends.

### 🚨 Repeat-pattern detection
Same customer, multiple claims, different amounts → auto-escalates **and** files a real Jira ticket,
distinct from a systemic-bug alert.

### 🛡️ Real guardrails, not decoration
Dry-run mode (Swytchcode's own `--dry-run` flag) and a full audit trail (`swy audit network`) of every
outbound call — enforced by the CLI itself, not just prompt instructions.

</td></tr>
</table>

---

## Swytchcode integrations

| Integration | What it's used for |
|---|---|
| **PayPal** | Verify captures & disputes, issue refunds, accept/settle disputes |
| **Slack** | Color-coded, category-tagged case notifications |
| **Notion** | Permanent, human-readable case ledger |
| **Jira** | Auto-filed tickets when a systemic or repeat-customer pattern is detected |
| **Gmail** | Real inbox intake — resolves a live unread complaint email end to end |

---

## Architecture

<div align="center">
<img src="assets/architecture.png" alt="Architecture diagram" width="85%" />
</div>

```
Channels in (email · chat · your own agent)
        │
        ▼
┌───────────────────────┐
│   LangGraph ReAct      │   verify → check patterns → decide → act
│   agent (Groq/Gemini)  │
└───────────┬───────────┘
            │  every mutating call goes through
            ▼
┌───────────────────────┐
│  Swytchcode execution  │   dry-run guardrail · full audit log
│  boundary               │
└───────────┬───────────┘
            │
   ┌────────┼────────┬─────────┬─────────┐
   ▼        ▼        ▼         ▼         ▼
 PayPal   Slack    Notion     Jira     Gmail
```

**Two output modes from one agent:**
- **Autonomous** — resolves immediately, no human in the loop.
- **Co-pilot** — drafts the decision and exact tool calls, waits for a human **Approve**/**Reject**.

---

## Tech stack

- **Agent framework:** [LangGraph](https://github.com/langchain-ai/langgraph) (ReAct agent, real tool-calling — not narrated text)
- **LLM:** Groq (`openai/gpt-oss-120b`, free tier) with a Gemini fallback path
- **Backend:** Flask (`api_server.py` — agent runs; `gmail_service.py` — live inbox intake)
- **Frontend:** Next.js 16 (App Router) + Tailwind
- **Execution layer:** [Swytchcode](https://swytchcode.com) — sandboxed, audited calls to every third-party API

---

## Quickstart

**Prerequisites:** Python 3.12+, Node 18+, the [Swytchcode CLI](https://swytchcode.com) (`swy`) installed and
logged in, a free [Groq API key](https://console.groq.com), and your own PayPal sandbox / Slack / Notion /
Jira credentials.

```bash
# 1. Backend
cd ledger-guard
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your own keys/IDs
python api_server.py   # runs on :5001
```

In a second terminal:

```bash
cd ledger-guard
source .venv/bin/activate
python gmail_service.py   # runs on :5002 (real Gmail inbox intake)
```

In a third terminal:

```bash
cd web
npm install
npm run dev   # runs on :3000
```

Then open **`http://localhost:3000`** — start at **`/showcase`** for a guided tour of every demo scenario,
or jump straight to **`/copilot`** for the main interactive demo.

---

## Known, honest limitations

- Delivery/fulfillment verification uses a small labeled test dataset, not a live shipment-tracking API
  (the real PayPal tracking API exists but needs a permission scope our sandbox token doesn't have) — the
  lookup function is written so swapping in a real order-management DB is a one-function change.
- Idempotency (preventing a duplicate action on retry) is not yet built — dry-run mode and the audit trail
  are.
- PayPal auth uses a direct sandbox bearer token rather than Swytchcode's fully managed connection.

---

<div align="center">

Built with **Swytchcode** · **LangGraph** · **Groq**

</div>
