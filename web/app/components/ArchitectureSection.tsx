"use client";

import React from "react";
import {
  Cpu,
  ShieldCheck,
  Database,
  MessageSquare,
  CreditCard,
  Layers,
  ArrowRight,
  Lock,
  RefreshCw,
  Key,
  Sparkles,
} from "lucide-react";

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-20 relative z-10 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-mono text-purple-300 mb-4">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Enterprise System Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.02em] text-[#EDEDEF]">
            Execution boundary and tool routing
          </h2>
          <p className="text-sm sm:text-base text-[#8A8F98] mt-3.5 leading-relaxed">
            The agent never holds long-lived provider credentials or connects directly to external APIs.
            Swytchcode sits between the model and financial infrastructure as an enforcement gateway.
          </p>
        </div>

        {/* Visual Architecture Grid with 3 Connected Phases */}
        <div className="linear-card rounded-2xl p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Column 1: Ingestion & Reasoning (Purple/Blue) */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-purple-400 mb-1">
                <span>Phase 1 · Intake & Reasoning</span>
                <span className="w-2 h-2 rounded-full bg-purple-400" />
              </div>

              <div className="bg-[#050506] border border-blue-500/20 rounded-xl p-4 flex-1">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Inbound Event</span>
                <h4 className="text-sm font-medium text-[#EDEDEF] mt-1">Dispute / Refund Request</h4>
                <p className="text-xs text-[#8A8F98] mt-1.5 leading-relaxed">
                  Web intake, email webhook, or PayPal dispute webhook.
                </p>
              </div>

              <div className="linear-card p-5 rounded-xl border border-purple-500/30 bg-purple-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-purple-500/15 text-purple-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-[#EDEDEF]">LangGraph ReAct Loop</span>
                </div>
                <div className="text-xs font-mono text-purple-300 bg-[#050506] p-2 rounded-lg border border-purple-500/20 mb-2">
                  Groq LPU (gpt-oss-120b)
                </div>
                <p className="text-xs text-[#8A8F98] leading-relaxed">
                  Extracts capture IDs, evaluates claim plausibility, and selects Swytchcode tool sequences.
                </p>
              </div>
            </div>

            {/* Column 2: Swytchcode Execution Gateway (Emerald / Highlight) */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                <span>Phase 2 · Sandboxed Boundary</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="linear-card bg-[#0a0a0c] p-6 rounded-xl border border-emerald-500/35 ring-1 ring-emerald-500/20 flex-1 flex flex-col justify-between shadow-[0_0_30px_rgba(16,185,129,0.08)]">
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#EDEDEF] block">Swytchcode Gateway</span>
                      <span className="text-[10px] font-mono text-emerald-400">Deterministic Policy Layer</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono text-[#8A8F98]">
                    <div className="p-2.5 rounded-lg bg-[#050506] border border-white/[0.06] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                        <span>Idempotency Lock</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">Dynamic SHA256</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#050506] border border-white/[0.06] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Financial Ceiling</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">&lt; $200.00</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#050506] border border-white/[0.06] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-purple-400" />
                        <span>Credential Isolation</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">Managed Bearer</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#050506] border border-white/[0.06] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dual Audit Dispatch</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">Synchronized</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400/90 font-mono mt-4 pt-3 border-t border-emerald-500/20 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payloads validated before external dispatch</span>
                </div>
              </div>
            </div>

            {/* Column 3: Protected Tools / Settlement (Multi-rail) */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-blue-400 mb-1">
                <span>Phase 3 · Managed Tools</span>
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              </div>

              <div className="space-y-2.5 flex-1 flex flex-col justify-between">
                {/* PayPal Rail */}
                <div className="bg-[#050506] border border-blue-500/25 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#EDEDEF]">PayPal Sandbox</span>
                      <span className="text-[10px] font-mono text-emerald-400">Connected</span>
                    </div>
                    <code className="text-[10px] text-[#8A8F98] truncate block">
                      payments.payment.captures.refund
                    </code>
                  </div>
                </div>

                {/* Slack Rail */}
                <div className="bg-[#050506] border border-teal-500/25 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#EDEDEF]">Slack Ops Broadcast</span>
                      <span className="text-[10px] font-mono text-teal-400">#all-swytchcode</span>
                    </div>
                    <code className="text-[10px] text-[#8A8F98] truncate block">
                      slack.chat.postmessage.create
                    </code>
                  </div>
                </div>

                {/* Notion Rail */}
                <div className="bg-[#050506] border border-purple-500/25 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#EDEDEF]">Notion Permanent Ledger</span>
                      <span className="text-[10px] font-mono text-purple-400">Database DB</span>
                    </div>
                    <code className="text-[10px] text-[#8A8F98] truncate block">
                      notion.page.create
                    </code>
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
