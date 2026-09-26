"use client";

import React from "react";
import { ShieldCheck, Check, X, CheckCircle2, XCircle } from "lucide-react";

export default function GuardrailsSection() {
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
                    Prompt injection ("CEO override") tricks LLM into releasing ₹5,000+.
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
                    <span className="text-emerald-300 font-medium block">Verification Defeats Injection:</span>
                    Decision never depends on the prompt's own claims — a fake capture ID is denied no matter what the prompt demands.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[#8A8F98]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-300 font-medium block">Dry-Run Guardrail:</span>
                    Real Swytchcode --dry-run flag — test the full reasoning path with zero live effect.
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
