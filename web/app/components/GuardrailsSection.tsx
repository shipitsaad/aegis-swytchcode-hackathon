"use client";

import React from "react";
import {
  ShieldCheck,
  Lock,
  RefreshCw,
  Cpu,
  Database,
  Check,
  X,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Key,
} from "lucide-react";

export default function GuardrailsSection() {
  const guardrails = [
    {
      title: "Dynamic Idempotency Lock",
      subtitle: "Prevents duplicate actions on retry",
      icon: RefreshCw,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/25",
      glow: "hover:border-blue-500/35",
      description:
        "When an API request experiences a network timeout, naive agents retry and execute multiple refunds. Aegis configures Swytchcode dynamic idempotency, ensuring identical refund calls are deduplicated at the gateway.",
      proof: 'SHA256(capture_id + amount) deduplication key',
    },
    {
      title: "Programmatic Policy Ceilings",
      subtitle: "Hard financial boundary at $200",
      icon: Lock,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
      glow: "hover:border-emerald-500/35",
      description:
        "The agent cannot execute payouts or refunds over $200. Even if an adversarial prompt injection bypasses model instructions, Swytchcode's execution layer rejects the tool call before the payload reaches PayPal.",
      proof: "swy policy check --max-amount 200.00",
    },
    {
      title: "Execution Layer Isolation",
      subtitle: "Decouples credentials from the model",
      icon: Key,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/25",
      glow: "hover:border-purple-500/35",
      description:
        "The model never handles PayPal credentials or raw HTTP headers directly. It interfaces strictly with typed canonical tools, while the CLI handles bearer token caching, SSL verification, and secret redaction.",
      proof: "swy exec --header 'Authorization=Bearer [MANAGED]'",
    },
    {
      title: "Dual Audit Synchronization",
      subtitle: "Every action logged to Notion and Slack",
      icon: Database,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/25",
      glow: "hover:border-amber-500/35",
      description:
        "Every autonomous resolution, denial, or escalation writes a structured row to the Notion Aegis Ledger database and dispatches a message to Slack. No decision occurs without an audit trace.",
      proof: "notion.page.create() + slack.chat.postmessage.create()",
    },
  ];

  return (
    <section id="guardrails" className="py-20 relative z-10 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-400 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deterministic Enforcement Boundary</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.02em] text-[#EDEDEF]">
            Execution guardrails for financial actions
          </h2>
          <p className="text-sm sm:text-base text-[#8A8F98] mt-3.5 leading-relaxed">
            Autonomous financial agents require deterministic guardrails at the API boundary,
            not just natural-language prompt instructions that can be bypassed.
          </p>
        </div>

        {/* 4 Cards Grid with Semantic Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {guardrails.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div
                key={idx}
                className={`linear-card p-6 rounded-2xl relative overflow-hidden transition-all ${g.glow}`}
              >
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className={`p-2.5 rounded-xl border ${g.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-[#EDEDEF]">{g.title}</h3>
                    <p className="text-xs text-[#8A8F98] font-mono">{g.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-[#8A8F98] leading-relaxed mb-4">{g.description}</p>

                <div className="bg-[#050506] rounded-lg p-2.5 border border-white/[0.06] font-mono text-[11px] text-[#EDEDEF] flex items-center justify-between">
                  <code className="text-[#818cf8] truncate">{g.proof}</code>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider shrink-0 ml-2">
                    Enforced
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Side-by-Side Comparison (Color Science: Red Danger vs. Emerald Safety) */}
        <div className="linear-card rounded-2xl p-6 sm:p-8 overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-semibold text-[#EDEDEF] mb-1.5">
              Why API Boundaries Matter
            </h3>
            <p className="text-xs text-[#8A8F98] font-mono">
              Comparing failure modes of prompt-only agents vs. Aegis with Swytchcode.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Naive Prompt-Only Bot (Red) */}
            <div className="bg-[#050506] border border-red-500/25 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>Naive Unconstrained Agent</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/30">
                  Prompt-Only
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 text-[#8A8F98]">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-red-300 font-medium block">Hallucinated Payouts:</span>
                    Issues refunds without checking if capture ID exists in PayPal.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[#8A8F98]">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-red-300 font-medium block">Bypassed by Jailbreaks:</span>
                    Prompt injection ("CEO override") tricks LLM into releasing $5,000+.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[#8A8F98]">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-red-300 font-medium block">Duplicate Double Refunds:</span>
                    Network timeouts cause retry loops that double-refund the same charge.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[#8A8F98]">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-red-300 font-medium block">Zero Audit Trail:</span>
                    Executes opaque transactions without synchronized compliance records.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Aegis with Swytchcode (Emerald) */}
            <div className="bg-[#0a0a0c] border border-emerald-500/35 rounded-xl p-5 space-y-4 ring-1 ring-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.08)]">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aegis + Swytchcode Boundary</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                  Deterministic
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 text-[#8A8F98]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-300 font-medium block">Real Sandbox Verification:</span>
                    Always checks capture state via PayPal API; ghost claims denied instantly.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[#8A8F98]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-300 font-medium block">Hard $200 Math Ceiling:</span>
                    Swytchcode gateway intercepts calls &gt;$200 regardless of prompt text.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[#8A8F98]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-300 font-medium block">Dynamic Idempotency Lock:</span>
                    Hashes capture ID + amount into key; retries never duplicate payouts.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[#8A8F98]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-300 font-medium block">Dual Slack + Notion Audit:</span>
                    Every single action logs an immutable database row and team notification.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
