"use client";

import React from "react";
import {
  Mail,
  MessageCircle,
  Bot,
  ShieldCheck,
  CreditCard,
  Layers,
  Lock,
  Radar,
  Zap,
  UserCheck,
  ArrowRight,
} from "lucide-react";

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-20 relative z-10 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-mono text-purple-300 mb-4">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>One layer, any channel</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.02em] text-[#EDEDEF]">
            Aegis doesn't replace your support stack
          </h2>
          <p className="text-sm sm:text-base text-[#8A8F98] mt-3.5 leading-relaxed">
            It's the verification and decision layer email, chat, or your own AI agent hands off
            to the moment a request touches money.
          </p>
        </div>

        <div className="linear-card rounded-2xl p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Column 1: Any channel in */}
            <div className="space-y-3 flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-blue-400 mb-1">
                <span>Any channel in</span>
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              </div>

              <div className="bg-[#050506] border border-blue-500/20 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#EDEDEF]">Support email</div>
                  <div className="text-[10px] text-[#8A8F98]">A customer emails a complaint</div>
                </div>
              </div>

              <div className="bg-[#050506] border border-teal-500/20 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25 shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#EDEDEF]">Support chat</div>
                  <div className="text-[10px] text-[#8A8F98]">A live chat message comes in</div>
                </div>
              </div>

              <div className="bg-[#050506] border border-purple-500/20 rounded-xl p-3.5 flex items-center gap-3 flex-1">
                <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#EDEDEF]">Your own AI agent</div>
                  <div className="text-[10px] text-[#8A8F98]">Hands off anything money-related</div>
                </div>
              </div>

              <p className="text-[10px] text-[#8A8F98] leading-relaxed pt-1">
                All three are just text. Aegis doesn't care where it came from.
              </p>
            </div>

            {/* Column 2: Aegis verifies + decides */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                <span>Aegis verifies &amp; decides</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="linear-card bg-[#0a0a0c] p-6 rounded-xl border border-emerald-500/35 ring-1 ring-emerald-500/20 flex-1 flex flex-col justify-between shadow-[0_0_30px_rgba(16,185,129,0.08)]">
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#EDEDEF] block">The real signals it checks</span>
                      <span className="text-[10px] font-mono text-emerald-400">Not a single rule — three combined</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono text-[#8A8F98]">
                    <div className="p-2.5 rounded-lg bg-[#050506] border border-white/[0.06] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                        <span>Real transaction lookup</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">PayPal</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#050506] border border-white/[0.06] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Radar className="w-3.5 h-3.5 text-orange-400" />
                        <span>Pattern across other cases</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">Leak Radar</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#050506] border border-white/[0.06] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Spend policy</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">Judgment-Based</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400/90 font-mono mt-4 pt-3 border-t border-emerald-500/20 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No single check decides alone</span>
                </div>
              </div>
            </div>

            {/* Column 3: Two ways out */}
            <div className="space-y-3 flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-indigo-400 mb-1">
                <span>Two ways out</span>
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
              </div>

              <div className="bg-[#050506] border border-indigo-500/25 rounded-xl p-4 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-indigo-500/15 text-indigo-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-[#EDEDEF]">Autonomous mode</span>
                </div>
                <p className="text-xs text-[#8A8F98] leading-relaxed">
                  Acts immediately for cases it's confident about — refunds via PayPal, notifies
                  Slack, logs to Notion, no human in the loop.
                </p>
              </div>

              <div className="bg-[#050506] border border-amber-500/25 rounded-xl p-4 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-amber-500/15 text-amber-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-[#EDEDEF]">Co-pilot mode</span>
                </div>
                <p className="text-xs text-[#8A8F98] leading-relaxed">
                  Same verification, same reasoning — drafts the recommendation and waits for a
                  human to approve before anything real happens.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[#8A8F98] pt-1">
                <ArrowRight className="w-3 h-3 shrink-0" />
                <span>Same agent, same checks — you choose how much trust to give it.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
