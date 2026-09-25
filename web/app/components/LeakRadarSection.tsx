"use client";

import React from "react";
import {
  Radar,
  ShieldAlert,
  Zap,
  AlertTriangle,
  Clock,
  Layers,
  PauseCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function LeakRadarSection() {
  return (
    <section id="leak-radar" className="py-20 relative z-10 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (6 Cols): Visual Logic & Explanations */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-400">
              <Radar className="w-3.5 h-3.5 text-amber-400" />
              <span>Coordinated Threat Recognition</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.02em] text-[#EDEDEF] leading-tight">
              Leak Radar: Catching card-testing fraud rings
            </h2>

            <p className="text-[#8A8F98] text-sm sm:text-base leading-relaxed">
              Fraud rings probe merchant defenses by submitting repeated small refund claims across
              different accounts to stay under standard bot thresholds.
            </p>

            <p className="text-[#8A8F98] text-sm sm:text-base leading-relaxed">
              Leak Radar tracks recent dispute activity. If three or more disputes for the same amount
              occur within 60 minutes, the agent pauses automated refunds and escalates the cluster to humans.
            </p>

            {/* Visual Rule Anatomy Cards with Icons */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="linear-card p-3.5 rounded-xl border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                  <Clock className="w-3 h-3" />
                  <span>Window</span>
                </div>
                <div className="text-lg font-semibold font-mono text-[#EDEDEF]">60 min</div>
                <p className="text-[10px] text-[#8A8F98] mt-0.5">Sliding history</p>
              </div>

              <div className="linear-card p-3.5 rounded-xl border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                  <Layers className="w-3 h-3" />
                  <span>Threshold</span>
                </div>
                <div className="text-lg font-semibold font-mono text-amber-300">≥ 3 claims</div>
                <p className="text-[10px] text-[#8A8F98] mt-0.5">Matching cluster</p>
              </div>

              <div className="linear-card p-3.5 rounded-xl border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1">
                  <PauseCircle className="w-3 h-3" />
                  <span>Defense</span>
                </div>
                <div className="text-lg font-semibold font-mono text-red-300">Pause</div>
                <p className="text-[10px] text-[#8A8F98] mt-0.5">Escalate to human</p>
              </div>
            </div>
          </div>

          {/* Right Column: Luminous Dynamic Radar Telemetry Graphic */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-amber-500/20 bg-[#050506] p-4 shadow-[0_0_50px_rgba(245,158,11,0.1)] flex items-center justify-center">
              {/* Concentric Grid Rings */}
              <div className="absolute inset-4 rounded-full border border-white/[0.04]" />
              <div className="absolute inset-16 rounded-full border border-amber-500/10" />
              <div className="absolute inset-28 rounded-full border border-amber-500/15" />
              <div className="absolute inset-40 rounded-full border border-amber-500/20" />

              {/* Crosshair Axes */}
              <div className="absolute w-full h-[1px] bg-amber-500/15" />
              <div className="absolute h-full w-[1px] bg-amber-500/15" />

              {/* Rotating Sweep Beam with Amber Glow */}
              <div
                className="absolute inset-0 rounded-full animate-sweep-subtle origin-center pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg at 50% 50%, rgba(245, 158, 11, 0.3) 0deg, rgba(245, 158, 11, 0) 55deg, transparent 360deg)",
                }}
              />

              {/* Center Radar Node */}
              <div className="relative z-10 w-5 h-5 rounded-full bg-amber-500 border border-white/50 shadow-[0_0_15px_rgba(245,158,11,0.8)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Cluster Blips with Visual Tags */}
              <div className="absolute top-20 right-24 z-20 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="text-[10px] font-mono text-[#EDEDEF] bg-[#0a0a0c] px-2 py-0.5 rounded-md border border-amber-500/30">
                  $45 · user_01
                </span>
              </div>

              <div className="absolute top-32 right-14 z-20 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="text-[10px] font-mono text-[#EDEDEF] bg-[#0a0a0c] px-2 py-0.5 rounded-md border border-amber-500/30">
                  $45 · user_02
                </span>
              </div>

              <div className="absolute bottom-24 right-28 z-20 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)] animate-ping" />
                <span className="text-[10px] font-mono text-red-200 bg-red-950/90 px-2 py-0.5 rounded-md border border-red-500/50 shadow-lg">
                  $45 · user_03 [Cluster Alert]
                </span>
              </div>

              {/* Floating Bottom Status Pill */}
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-11/12 linear-card p-3 rounded-xl z-30 flex items-center justify-between text-xs border border-amber-500/30 bg-[#0a0a0c]/90 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-[11px] text-[#EDEDEF]">
                    Pattern CL-45-USD Tripped
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30">
                  Auto-Refund Paused
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
