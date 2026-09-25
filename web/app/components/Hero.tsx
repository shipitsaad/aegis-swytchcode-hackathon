"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Terminal,
  Layers,
  Sparkles,
  CreditCard,
  Lock,
  Radar,
  Database,
  TrendingUp,
  Zap,
  CheckCircle2,
  RefreshCw,
  DollarSign,
} from "lucide-react";

export default function Hero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Floating Pill Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#5E6AD2]/15 via-purple-500/10 to-transparent border border-[#5E6AD2]/30 text-xs font-mono text-[#EDEDEF]">
            <Sparkles className="w-3.5 h-3.5 text-[#818cf8]" />
            <span className="font-semibold text-white">Track 6</span>
            <span className="text-white/40">·</span>
            <span className="text-[#EDEDEF]">AI Business Operator</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Swytchcode Sandboxed Execution</span>
          </div>
        </div>

        {/* Display Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.03em] text-[#EDEDEF] max-w-5xl mx-auto leading-[1.05] mb-6">
          Autonomous financial operations with{" "}
          <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            sandboxed execution boundaries.
          </span>
        </h1>

        {/* Lead Text */}
        <p className="text-base sm:text-lg text-[#8A8F98] max-w-2xl mx-auto leading-relaxed mb-8">
          Aegis evaluates customer refund requests against real PayPal data, enforces mathematical
          policy limits before any money moves, and syncs an immutable audit ledger to Notion.
        </p>

        {/* Visual Pill Strip (Icons + Color Psychology for Instant Scanning) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto mb-10">
          <div className="visual-chip bg-blue-500/10 border border-blue-500/25 text-blue-300">
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>PayPal Sandbox Verified</span>
          </div>

          <div className="visual-chip bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>&lt;$200 Hard Limit</span>
          </div>

          <div className="visual-chip bg-amber-500/10 border border-amber-500/25 text-amber-300">
            <Radar className="w-3.5 h-3.5 text-amber-400" />
            <span>Leak Radar Coordinated Defense</span>
          </div>

          <div className="visual-chip bg-purple-500/10 border border-purple-500/25 text-purple-300">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Notion Permanent Ledger</span>
          </div>

          <div className="visual-chip bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>LangGraph ReAct on Groq</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
          <Link
            href="/console"
            className="btn-linear-primary w-full sm:w-auto px-6 py-3 text-sm font-medium tracking-tight cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(94,106,210,0.4)] hover:shadow-[0_0_35px_rgba(94,106,210,0.6)] transition-all"
          >
            <Terminal className="w-4 h-4 text-white" />
            Launch Operations Console
            <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-white/80" />
          </Link>

          <button
            onClick={() => scrollTo("pipeline")}
            className="btn-linear-secondary w-full sm:w-auto px-6 py-3 text-sm font-medium tracking-tight cursor-pointer flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4 text-[#8A8F98]" />
            Explore System Pipeline
          </button>
        </div>

        {/* Asymmetric Bento Metrics Grid with Color Accents */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          {/* Tile 1: Hero Emerald Protection (Span 2) */}
          <div className="md:col-span-2 linear-card p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Protected Revenue</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                Live Telemetry
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-semibold text-[#EDEDEF] font-mono tracking-tight flex items-baseline gap-2">
              <span>$14,850.00</span>
              <span className="text-xs font-normal text-emerald-400 font-sans flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                100% saved
              </span>
            </div>

            <p className="text-xs text-[#8A8F98] mt-2.5 leading-relaxed">
              18 disputed charges investigated. Autonomous execution stopped unauthorized chargeback drains and card-testing probes.
            </p>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-[11px] font-mono text-emerald-400/90">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Zero Unauthorized Chargebacks</span>
            </div>
          </div>

          {/* Tile 2: Double Refunds Idempotency (Indigo / Blue) */}
          <div className="linear-card p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-400">
                <div className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span>Double Refunds</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>

            <div className="text-3xl font-semibold text-emerald-400 font-mono tracking-tight">
              0.00%
            </div>

            <p className="text-xs text-[#8A8F98] mt-2.5 leading-relaxed">
              Swytchcode dynamic idempotency deduplicates retry storms at the gateway.
            </p>

            <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] font-mono text-blue-400/90 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span>Gateway Key Locked</span>
            </div>
          </div>

          {/* Tile 3: Execution Stack (Purple / Violet) */}
          <div className="linear-card p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400">
                <div className="w-6 h-6 rounded-md bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span>Engine</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300">Groq LPU</span>
            </div>

            <div className="text-3xl font-semibold text-[#EDEDEF] font-mono tracking-tight">
              LangGraph
            </div>

            <p className="text-xs text-[#8A8F98] mt-2.5 leading-relaxed">
              Multi-step ReAct reasoning loop with Swytchcode tool bindings.
            </p>

            <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] font-mono text-purple-400/90 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>3 Rails Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
