"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Send,
  CheckCheck,
  ShieldX,
  Sparkles,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { getDecisionStyle } from "./ConsoleView";

const API_BASE = "http://localhost:5001";

type Perspective = "agent" | "customer";

const SUGGESTIONS: Record<Perspective, string[]> = {
  agent: [
    "Customer says: my order was cancelled before it shipped but I was still charged, capture TEST-SMALL. Email: priya.demo@example.com",
    "Step 2 (same customer) - Customer says: card was compromised, capture TEST-LARGE, wants the ₹350 back. Email: priya.demo@example.com",
    "Step 3 (same customer again) - Customer says: charged again, capture TEST-SMALL, please refund. Email: priya.demo@example.com",
  ],
  customer: [
    "I was charged twice for my order, capture ID TEST-SMALL, can you refund me?",
    "My order got cancelled but I still got billed - capture TEST-SMALL. Can you help?",
    "Someone used my card without permission, capture TEST-LARGE, I need my ₹350 back.",
    "I never received my order, capture ID TEST-DELIVERED, please refund the $60.",
  ],
};

const TEST_ID_NOTES: { id: string; note: string }[] = [
  { id: "TEST-SMALL", note: "small, routine amount" },
  { id: "TEST-LARGE", note: "large amount - tests escalation" },
  { id: "TEST-DELIVERED", note: "marked delivered - tests the non-receipt contradiction check" },
];

function customerFacingSummary(decision: string | null | undefined) {
  switch (decision) {
    case "Refunded":
      return "Good news - your refund's confirmed and on its way back to your account.";
    case "Denied":
      return "We looked into this closely and, based on our records, we're not able to issue a refund here.";
    case "Settled":
      return "We've sent you an offer to resolve this - check your PayPal notifications.";
    case "Escalated":
    default:
      return "We've flagged this for a specialist on our team, who'll follow up with you shortly.";
  }
}

type ActionOutcome = "approved" | "rejected" | null;

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "error";
  text: string;
  perspective?: Perspective;
  thinking?: boolean;
  caseId?: string | null;
  decision?: string | null;
  pending?: boolean;
  actionLoading?: "approve" | "reject" | null;
  outcome?: ActionOutcome;
  outcomeDetail?: string;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function CopilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [perspective, setPerspective] = useState<Perspective>("agent");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => setBackendOnline(res.ok))
      .catch(() => setBackendOnline(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || isSending) return;

    const currentPerspective = perspective;
    setInput("");
    setIsSending(true);

    const userMsg: ChatMessage = { id: uid(), role: "user", text, perspective: currentPerspective };
    const assistantId = uid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      text: "",
      thinking: true,
      perspective: currentPerspective,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const patch = (fields: Partial<ChatMessage>) => {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...fields } : m)));
    };

    // Agent perspective = co-pilot draft (dry_run, needs approval below). Customer perspective =
    // the fully-autonomous mode - executes for real immediately, exactly what a customer talking
    // to Aegis directly would experience, no human in the loop.
    const dryRun = currentPerspective === "agent";

    try {
      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, dry_run: dryRun }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Aegis couldn't process that.");

      patch({
        thinking: false,
        text:
          currentPerspective === "customer"
            ? customerFacingSummary(data.decision)
            : data.final_reasoning || "No reasoning returned.",
        caseId: data.case_id || null,
        decision: data.decision || null,
        pending: Boolean(dryRun && data.pending && data.case_id),
      });
    } catch (err: any) {
      patch({
        thinking: false,
        role: "error",
        text:
          err?.message === "Failed to fetch"
            ? "Can't reach the Aegis backend at localhost:5001 - make sure api_server.py is running."
            : `Something went wrong: ${err?.message || err}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleApproval = async (msgId: string, action: "approve" | "reject") => {
    const target = messages.find((m) => m.id === msgId);
    if (!target?.caseId) return;

    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, actionLoading: action } : m)));

    try {
      const response = await fetch(`${API_BASE}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: target.caseId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `${action} failed`);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                pending: false,
                actionLoading: null,
                outcome: action === "approve" ? "approved" : "rejected",
                outcomeDetail:
                  action === "approve"
                    ? "Executed for real - same tool calls, same args, no re-decision."
                    : "Nothing executed. Logged to the Notion ledger as human-declined.",
              }
            : m
        )
      );
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, actionLoading: null } : m)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F6F7F9] text-[#16171B] flex flex-col font-sans">
      {/* Header */}
      <header className="h-14 border-b border-[#E4E6EA] bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#4B5563] hover:text-[#16171B] transition-colors font-medium py-1.5 px-2.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
          <div className="h-5 w-[1px] bg-[#E4E6EA]" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#5E6AD2] text-white shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm tracking-tight">Aegis Co-pilot</div>
              <div className="text-[11px] text-[#6B7280]">
                {perspective === "agent" ? "Drafts every decision - you approve or reject" : "Fully autonomous - resolves the customer directly"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[11px] font-mono text-[#6B7280]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              backendOnline === null ? "bg-[#D1D5DB]" : backendOnline ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {backendOnline === null ? "checking..." : backendOnline ? "live agent connected" : "backend offline"}
        </div>
      </header>

      {/* Perspective switch */}
      <div className="border-b border-[#E4E6EA] bg-white px-4 sm:px-6 py-2 flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-[#6B7280] mr-1">Viewing as:</span>
        <button
          onClick={() => setPerspective("agent")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            perspective === "agent"
              ? "bg-[#5E6AD2] text-white shadow-xs"
              : "bg-[#F3F4F6] text-[#6B7280] hover:text-[#16171B]"
          }`}
        >
          Support agent (co-pilot)
        </button>
        <button
          onClick={() => setPerspective("customer")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            perspective === "customer"
              ? "bg-[#5E6AD2] text-white shadow-xs"
              : "bg-[#F3F4F6] text-[#6B7280] hover:text-[#16171B]"
          }`}
        >
          Customer (autonomous)
        </button>
      </div>

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center pt-16">
              <div className="w-12 h-12 rounded-2xl bg-[#5E6AD2] text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="mt-4 text-lg font-semibold tracking-tight">
                {perspective === "agent" ? "What did the customer say?" : "What's your issue?"}
              </h1>
              <p className="mt-1.5 text-sm text-[#6B7280] max-w-md mx-auto">
                {perspective === "agent"
                  ? "Paste in what the customer told you. Aegis verifies it against real PayPal data and drafts a decision - nothing real happens until you approve it."
                  : "Talk to Aegis directly, like a live support chat. It verifies your claim against real PayPal data and resolves it immediately - no human reviews this one."}
              </p>
              <div className="mt-6 grid gap-2 max-w-lg mx-auto">
                {SUGGESTIONS[perspective].map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-xs px-3.5 py-2.5 rounded-xl border border-[#E4E6EA] bg-white hover:border-[#5E6AD2]/50 hover:bg-indigo-50/30 transition-colors cursor-pointer text-[#4B5563]"
                  >
                    {s}
                  </button>
                ))}
              </div>
              {perspective === "agent" && (
                <p className="mt-4 text-[11px] text-[#9CA3AF] max-w-md mx-auto">
                  Send the 3 steps above in order to see the{" "}
                  <span className="font-semibold text-[#6B7280]">repeat-customer pattern alert</span> fire on the
                  3rd - Aegis notices the same customer filing multiple claims and escalates + files a Jira
                  ticket instead of resolving it quietly again.
                </p>
              )}
              <div className="mt-5 pt-4 border-t border-[#E4E6EA] max-w-lg mx-auto">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#9CA3AF] mb-2">
                  Real test capture IDs you can type
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {TEST_ID_NOTES.map((t) => (
                    <span
                      key={t.id}
                      title={t.note}
                      className="text-[10px] font-mono px-2 py-1 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563]"
                    >
                      {t.id}
                    </span>
                  ))}
                </div>
                <Link
                  href="/database"
                  className="mt-2 inline-block text-[11px] text-[#5E6AD2] hover:text-[#4F5BC0] font-medium underline underline-offset-2"
                >
                  See the real test order database →
                </Link>
              </div>
            </div>
          )}

          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex items-start gap-3 justify-end">
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-[#5E6AD2] text-white text-sm leading-relaxed shadow-xs">
                    {m.text}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#6B7280]" />
                  </div>
                </div>
              );
            }

            const isError = m.role === "error";
            const decisionStyle = m.decision ? getDecisionStyle(m.decision) : null;

            return (
              <div key={m.id} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isError ? "bg-rose-100 text-rose-600" : "bg-[#5E6AD2] text-white"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="max-w-[85%] space-y-2">
                  {m.thinking ? (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-[#E4E6EA] text-[#6B7280] text-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying against real PayPal data...</span>
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-xs ${
                        isError
                          ? "bg-rose-50 border border-rose-200 text-rose-800"
                          : "bg-white border border-[#E4E6EA] text-[#16171B]"
                      }`}
                    >
                      {m.text}
                    </div>
                  )}

                  {decisionStyle && (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        m.pending ? "border-[#5E6AD2]/40 bg-indigo-50/70" : decisionStyle.banner
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">
                          {m.perspective === "customer"
                            ? "Resolved automatically - no human reviewed this"
                            : m.pending
                            ? `Proposed decision: ${m.decision}`
                            : `Decision: ${m.decision}`}
                        </span>
                        {m.caseId && m.perspective !== "customer" && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/5">
                            {m.caseId}
                          </span>
                        )}
                      </div>
                      {m.perspective === "customer" && (
                        <p className="mt-1 text-[10px] font-mono text-black/40">
                          internal: {m.decision} · {m.caseId}
                        </p>
                      )}

                      {m.pending && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => handleApproval(m.id, "approve")}
                            disabled={!!m.actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5E6AD2] hover:bg-[#4F5BC0] text-white shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {m.actionLoading === "approve" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCheck className="w-3.5 h-3.5" />
                            )}
                            <span>Approve &amp; execute</span>
                          </button>
                          <button
                            onClick={() => handleApproval(m.id, "reject")}
                            disabled={!!m.actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E4E6EA] hover:bg-[#F3F4F6] text-[#4B5563] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {m.actionLoading === "reject" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldX className="w-3.5 h-3.5" />
                            )}
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {m.outcome && (
                        <p
                          className={`mt-2 font-semibold ${
                            m.outcome === "approved" ? "text-emerald-700" : "text-[#6B7280]"
                          }`}
                        >
                          {m.outcome === "approved" ? "Approved. " : "Rejected. "}
                          {m.outcomeDetail}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-[#E4E6EA] bg-white/95 backdrop-blur-md p-4 shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={perspective === "agent" ? "Paste what the customer said..." : "Type your issue..."}
            rows={1}
            className="flex-1 resize-none text-sm px-4 py-3 rounded-2xl border border-[#E4E6EA] bg-[#F9FAFB] focus:outline-none focus:border-[#5E6AD2] focus:bg-white transition-all max-h-32"
          />
          <button
            onClick={() => send(input)}
            disabled={isSending || !input.trim()}
            className={`flex items-center justify-center w-11 h-11 rounded-2xl transition-all cursor-pointer shrink-0 ${
              isSending || !input.trim()
                ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                : "bg-[#5E6AD2] hover:bg-[#4F5BC0] text-white shadow-xs"
            }`}
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="max-w-2xl mx-auto mt-2 text-[10px] text-[#9CA3AF] text-center">
          Every reply is a real LangGraph + Groq agent run against real PayPal sandbox data.{" "}
          {perspective === "agent"
            ? "Nothing is executed until you approve it."
            : "This executes for real immediately - no approval step, exactly like a live autonomous chat."}
        </p>
      </div>
    </div>
  );
}
