"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Cpu,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Radar,
  ArrowRight,
  Database,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Loader2,
  Check,
  ArrowLeft,
  Copy,
  Code2,
  Ticket,
  Send,
  WifiOff,
} from "lucide-react";
import { PayPalLogo, SlackLogo, NotionLogo, getDecisionStyle } from "./ConsoleView";
import { DisputeScenario } from "../types/scenarios";

const API_BASE = "http://localhost:5001";

// Which of the real agent's tools belong in which visual stage of the story. Steps not in
// any of these lists (there aren't any today, but a new tool added later without updating
// this file would just not show up in stages 3/4/5) still show up in the raw step list the
// "Raw Workbench" view (ConsoleView) always renders, so nothing is ever silently dropped
// from the actual audit trail - only from this cinematic retelling of it.
const VERIFY_TOOLS = ["paypal_lookup_capture", "paypal_lookup_dispute"];
const GUARDRAIL_TOOLS = ["check_leak_pattern", "check_customer_pattern", "check_delivery_status"];
const ACTION_TOOLS = [
  "paypal_refund_capture",
  "paypal_accept_dispute",
  "paypal_offer_dispute_settlement",
  "slack_notify",
  "notion_log_case",
  "jira_file_bug",
];

interface LiveStep {
  id: string;
  name: string;
  tool: string;
  status: string;
  timestamp: string;
  detail: string;
}

interface LiveResult {
  steps: LiveStep[];
  final_reasoning: string;
  decision: string | null;
  amount: number | null;
  case_id: string | null;
  slack_text?: string | null;
  notion_row?: any;
}

function parseDetail(detail: string): any {
  try {
    return JSON.parse(detail);
  } catch {
    return null;
  }
}

function isAlertDetail(detail: string): boolean {
  return detail.includes("ALERT") || detail.toUpperCase().includes("DELIVERED -");
}

interface SwytchcodeActionCardProps {
  step: number;
  title: string;
  command: string;
  where: string;
  how: string;
  icon: React.ComponentType<{ className?: string }>;
  payload: Record<string, any>;
}

function SwytchcodeActionCard({ step, title, command, where, how, icon: Icon, payload }: SwytchcodeActionCardProps) {
  const [copied, setCopied] = useState(false);
  const [isInspectOpen, setIsInspectOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0B0D13] rounded-2xl p-4 border border-[#F26522]/30 shadow-md text-xs space-y-2.5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-[#F26522]/15 border border-[#F26522]/35 text-[#F26522] font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Icon className="w-3 h-3 text-[#F26522]" />
            <span>Swytchcode In Action · {title}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#8A8F98] bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {command}
          </span>
          <button
            onClick={handleCopy}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              copied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-white/5 text-[#CBD5E1] hover:text-white hover:bg-white/10 border border-white/10"
            }`}
            title="Copy Swytchcode CLI Command"
          >
            {copied ? (
              <>
                <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-2.5 h-2.5 text-gray-400" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={() => setIsInspectOpen(!isInspectOpen)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isInspectOpen
                ? "bg-[#F26522]/20 text-[#F26522] border border-[#F26522]/40"
                : "bg-white/5 text-[#CBD5E1] hover:text-white hover:bg-white/10 border border-white/10"
            }`}
            title="Inspect the real Swytchcode execution payload for this step"
          >
            <Code2 className="w-2.5 h-2.5 text-[#F26522]" />
            <span>{isInspectOpen ? "Hide JSON" : "Inspect"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#F26522] font-bold block mb-1">Where It Runs</span>
          <p className="text-white font-medium leading-relaxed">{where}</p>
        </div>
        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
            How Swytchcode Powers It
          </span>
          <p className="text-[#CBD5E1] leading-relaxed">{how}</p>
        </div>
      </div>

      {isInspectOpen && (
        <div className="mt-2 p-3 rounded-xl bg-[#050608] border border-white/10 font-mono text-[10px] space-y-2 animate-in fade-in duration-200 shadow-inner">
          <div className="flex items-center justify-between text-[#8A8F98] border-b border-white/10 pb-1.5">
            <span className="text-[#F26522] font-bold flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>Real response from this step · Step {step}</span>
            </span>
          </div>
          <pre className="text-emerald-300/90 overflow-x-auto leading-relaxed max-h-40 p-1">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export interface AegisLiveStoryStepperProps {
  promptText: string;
  isActive?: boolean;
  scenario?: DisputeScenario;
  onComplete?: () => void;
  onReset?: () => void;
  onOpenFullConsole?: () => void;
}

export default function AegisLiveStoryStepper({
  promptText,
  isActive = true,
  onComplete,
  onReset,
  onOpenFullConsole,
}: AegisLiveStoryStepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<"demo" | "fast">("demo");
  const [stepProgress, setStepProgress] = useState<number>(0);

  const [liveResult, setLiveResult] = useState<LiveResult | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const fetchStartRef = useRef<number>(0);

  // Kick off a real agent run every time the prompt changes - this is the ONLY place data
  // in this component comes from. Autonomous (dry_run: false) because this stepper plays
  // the customer-facing "Tomato app" side of Aegis, same as /copilot's Customer perspective.
  useEffect(() => {
    if (!isActive || !promptText.trim()) return;

    setCurrentStep(1);
    setStepProgress(0);
    setIsPlaying(true);
    setLiveResult(null);
    setFetchError(null);
    setIsFetching(true);
    fetchStartRef.current = Date.now();

    let cancelled = false;

    fetch(`${API_BASE}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText, dry_run: false }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || data.error) throw new Error(data.error || "Aegis couldn't process that.");
        setLiveResult(data);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setFetchError(
          err?.message === "Failed to fetch"
            ? "Can't reach the Aegis backend at localhost:5001 - make sure api_server.py is running."
            : err?.message || "Something went wrong calling the live agent."
        );
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptText, isActive]);

  // Real elapsed-time counter while the real call is in flight - no fabricated token/latency
  // numbers, just how long the actual call has actually been running.
  useEffect(() => {
    if (!isFetching) return;
    const t = setInterval(() => setElapsedMs(Date.now() - fetchStartRef.current), 100);
    return () => clearInterval(t);
  }, [isFetching]);

  // Auto-advance: stage 1 -> 2 is a short fixed pause (cosmetic only, no claim attached).
  // Stage 2 waits for the REAL fetch to finish (isFetching false) before it can advance -
  // however long that actually takes. Stages 3-5 use a modest fixed dwell purely to pace
  // the reveal of data we already have in full, same pattern ConsoleView already uses.
  useEffect(() => {
    if (!isPlaying || !isActive) return;
    if (currentStep >= 6) return;
    if (currentStep === 2 && (isFetching || (!liveResult && !fetchError))) return;
    if (fetchError) return; // don't advance past a failed run

    setStepProgress(0);
    const intervalTime = 50;
    const effectiveDuration =
      currentStep === 1 ? (speed === "demo" ? 1600 : 800) : speed === "demo" ? 3200 : 1500;
    const increment = (intervalTime / effectiveDuration) * 100;

    const progressTimer = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, intervalTime);

    const advanceTimer = setTimeout(() => setCurrentStep((prev) => prev + 1), effectiveDuration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(advanceTimer);
    };
  }, [currentStep, isPlaying, isActive, speed, isFetching, liveResult, fetchError]);

  useEffect(() => {
    if (currentStep >= 6 && onComplete) onComplete();
  }, [currentStep, onComplete]);

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      setStepProgress(0);
    }
  };
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setStepProgress(0);
    }
  };
  const handleRestart = () => {
    setCurrentStep(1);
    setStepProgress(0);
    setIsPlaying(true);
    if (onReset) onReset();
  };

  const stepsConfig = [
    { num: 1, title: "Ticket Ingested", subtitle: "Customer claim", icon: MessageSquare },
    { num: 2, title: "Aegis Thinking", subtitle: "Real Groq call", icon: Cpu },
    { num: 3, title: "Verified", subtitle: "Real PayPal query", icon: CreditCard },
    { num: 4, title: "Guardrails", subtitle: "Leak Radar & friends", icon: ShieldCheck },
    { num: 5, title: "Action Dispatched", subtitle: "Real side effects", icon: Zap },
  ];

  const extractedCaptureId = promptText.match(/TEST-[A-Z0-9_-]+/i)?.[0] || null;
  const verifyStep = liveResult?.steps.find((s) => VERIFY_TOOLS.includes(s.tool));
  const guardrailSteps = liveResult?.steps.filter((s) => GUARDRAIL_TOOLS.includes(s.tool)) || [];
  const actionSteps = liveResult?.steps.filter((s) => ACTION_TOOLS.includes(s.tool)) || [];
  const verifyDetail = verifyStep ? parseDetail(verifyStep.detail) : null;
  const decisionStyle = liveResult?.decision ? getDecisionStyle(liveResult.decision) : null;

  return (
    <div className="flex flex-col h-full w-full bg-[#F6F7F9] text-[#16171B] overflow-hidden select-none">
      {/* -------------------------------------------------------------------- */}
      {/* 1. Interactive Demo Control Bar                                      */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white border-b border-[#E4E6EA] px-4 py-2.5 shrink-0 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${fetchError ? "bg-rose-500" : "bg-[#5E6AD2] animate-pulse"}`}
            />
            <div>
              <span className="font-black text-xs sm:text-sm tracking-tight text-[#16171B]">
                Aegis Financial Defense Engine
              </span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F26522]/10 border border-[#F26522]/30 text-[#F26522] font-bold">
                Live · Real Backend
              </span>
              <span className="ml-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#5E6AD2] font-bold">
                {currentStep < 6 ? (
                  `Stage ${currentStep} of 5 Active`
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <span>Resolved & Verified</span>
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center bg-[#F3F4F6] p-0.5 rounded-lg border border-[#E5E7EB] text-[10px] font-medium text-[#6B7280]">
              <button
                onClick={() => setSpeed("demo")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  speed === "demo" ? "bg-white text-[#16171B] font-bold shadow-2xs" : "hover:text-[#16171B]"
                }`}
              >
                Demo Pace
              </button>
              <button
                onClick={() => setSpeed("fast")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  speed === "fast" ? "bg-white text-[#16171B] font-bold shadow-2xs" : "hover:text-[#16171B]"
                }`}
              >
                Fast
              </button>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#16171B] border border-[#E5E7EB] transition-colors cursor-pointer"
              title={isPlaying ? "Pause auto-stepper" : "Resume auto-stepper"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
            <button
              onClick={handlePrevStep}
              disabled={currentStep <= 1}
              className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#16171B] border border-[#E5E7EB] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStep >= 6 || (currentStep === 2 && isFetching)}
              className="px-2.5 py-1 rounded-lg bg-[#5E6AD2] hover:bg-[#4F5BC0] text-white font-semibold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#16171B] border border-[#E5E7EB] transition-colors cursor-pointer"
              title="Re-run this complaint against the real agent"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {onOpenFullConsole && (
              <button
                onClick={onOpenFullConsole}
                className="hidden lg:flex text-[11px] text-[#4B5563] hover:text-[#16171B] font-semibold items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] transition-colors cursor-pointer ml-1"
              >
                <span>Raw Workbench</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 pt-0.5">
          {stepsConfig.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num === 2 && isFetching) return;
                  setCurrentStep(s.num);
                  setStepProgress(100);
                  setIsPlaying(false);
                }}
                className="flex flex-col gap-1 cursor-pointer group"
              >
                <div className="h-2 rounded-full overflow-hidden bg-[#E5E7EB] relative border border-[#E5E7EB]">
                  <div
                    className={`h-full transition-all ${
                      isCompleted ? "bg-emerald-500 w-full" : isCurrent ? "bg-[#5E6AD2]" : "w-0"
                    }`}
                    style={isCurrent ? { width: `${stepProgress}%` } : undefined}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-semibold text-[#6B7280]">
                  <span
                    className={
                      isCurrent ? "text-[#5E6AD2] font-black" : isCompleted ? "text-emerald-700" : "opacity-60"
                    }
                  >
                    {s.num}. {s.title}
                  </span>
                  {isCompleted && <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. Main Stage                                                        */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full">
        {fetchError ? (
          <div className="p-6 rounded-3xl bg-white border-2 border-rose-400 ring-8 ring-rose-500/10 shadow-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Live Backend Unreachable</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-[#16171B]">This didn't run for real</h2>
            <p className="text-sm text-[#6B7280]">{fetchError}</p>
            <button
              onClick={handleRestart}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <>
            {/* STAGE 1: Ticket Ingested */}
            {currentStep === 1 && (
              <div className="p-6 rounded-3xl bg-white border-2 border-blue-400 ring-8 ring-blue-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Stage 1 of 5 · Inbound Support Claim</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Sent to real agent</span>
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                    Receiving Customer Support Ticket
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                    Dispatched from the customer's Tomato App support chat
                  </p>
                </div>
                <div className="bg-[#FAF9FB] rounded-2xl p-4 sm:p-5 border border-[#E2E4E9] shadow-inner space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A8F98] block">
                    Raw Customer Claim Text
                  </span>
                  <p className="text-base sm:text-lg font-serif italic text-[#16171B] leading-relaxed">
                    "{promptText}"
                  </p>
                </div>
                {extractedCaptureId && (
                  <div className="bg-red-50/70 p-3 rounded-xl border border-red-200 inline-block">
                    <span className="text-[10px] text-red-600 block uppercase font-bold">Referenced Capture ID</span>
                    <span className="text-sm font-mono font-black text-red-950">{extractedCaptureId}</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-medium">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5E6AD2] animate-spin shrink-0" />
                    <span>Forwarding ticket to the real Aegis agent...</span>
                  </span>
                </div>
              </div>
            )}

            {/* STAGE 2: Aegis Thinking (real call in flight, or just-finished) */}
            {currentStep === 2 && (
              <div className="p-6 rounded-3xl bg-white border-2 border-purple-500 ring-8 ring-purple-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
                    <Cpu className={`w-3.5 h-3.5 text-purple-600 ${isFetching ? "animate-spin" : ""}`} />
                    <span>Stage 2 of 5 · Autonomous AI Brain</span>
                  </div>
                  <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 font-bold">
                    LangGraph + Groq (openai/gpt-oss-120b)
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                  What Aegis Is Actually Thinking
                </h2>

                <div className="bg-[#0B0C10] rounded-2xl p-5 border-2 border-purple-500/40 shadow-2xl text-xs sm:text-sm font-mono text-[#D8E2EC] space-y-3 leading-relaxed min-h-[160px]">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-[#A5B4FC]">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Terminal className="w-4 h-4 text-purple-400" />
                      <span>aegis-agent // real run</span>
                    </span>
                    <span className={`font-bold flex items-center gap-1 ${isFetching ? "text-amber-400" : "text-emerald-400"}`}>
                      <span className={`w-2 h-2 rounded-full ${isFetching ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                      <span>{isFetching ? "CALLING REAL AGENT" : "REASONING COMPLETE"}</span>
                    </span>
                  </div>

                  {isFetching ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-purple-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Real LangGraph + Groq call in progress - {(elapsedMs / 1000).toFixed(1)}s elapsed</span>
                      </div>
                      <p className="text-[#94A3B8] text-[11px]">
                        This can take anywhere from a few seconds to about a minute depending on real Groq load -
                        nothing here is on a fixed timer.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[#E2E8F0] whitespace-pre-wrap">
                      {liveResult?.final_reasoning || "No reasoning returned."}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 3: Verified */}
            {currentStep === 3 && (
              <div className="p-6 rounded-3xl bg-white border-2 border-sky-400 ring-8 ring-sky-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
                  <PayPalLogo className="w-4 h-4" />
                  <span>Stage 3 of 5 · Sandbox Gateway Query</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                  Live PayPal Sandbox Query Executed
                </h2>
                {verifyStep ? (
                  <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl p-5 border-2 border-sky-200 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                      <span className="text-xs uppercase font-extrabold tracking-wider text-sky-900">
                        {verifyStep.name}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        {verifyStep.timestamp} elapsed
                      </span>
                    </div>
                    <pre className="text-[11px] font-mono bg-white p-3 rounded-xl border border-sky-200 overflow-x-auto">
                      {JSON.stringify(verifyDetail ?? verifyStep.detail, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-[#6B7280]">No verification step in this run.</p>
                )}
                {verifyStep && (
                  <SwytchcodeActionCard
                    step={3}
                    title="Managed Credential Gateway"
                    command={`swy exec ${verifyStep.tool}`}
                    where="Live outbound execution tunnel between Aegis and PayPal Sandbox."
                    how="Swytchcode executes the OAuth2 credential exchange and bearer injection on the agent's behalf - the merchant's real API key is never exposed to the LLM."
                    icon={CreditCard}
                    payload={verifyDetail ?? { raw: verifyStep.detail }}
                  />
                )}
              </div>
            )}

            {/* STAGE 4: Guardrails */}
            {currentStep === 4 && (
              <div className="p-6 rounded-3xl bg-white border-2 border-indigo-400 ring-8 ring-indigo-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5E6AD2]" />
                  <span>Stage 4 of 5 · Autonomous Safety Checks</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                  Real Pattern & Delivery Checks
                </h2>
                {guardrailSteps.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">
                    No guardrail checks were needed for this case (judged on payment verification alone).
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {guardrailSteps.map((s) => {
                      const alert = isAlertDetail(s.detail);
                      return (
                        <div
                          key={s.id}
                          className={`p-5 rounded-2xl border-2 shadow-xs space-y-2 ${
                            alert ? "bg-amber-50/70 border-amber-300" : "bg-emerald-50/50 border-emerald-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-black text-sm text-[#16171B]">
                              <Radar className="w-4 h-4 text-orange-500" />
                              <span>{s.name}</span>
                            </div>
                            <span
                              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                                alert ? "text-amber-700 bg-amber-100" : "text-emerald-700 bg-emerald-100"
                              }`}
                            >
                              {alert ? "ALERT" : "CLEAR"}
                            </span>
                          </div>
                          <p className="text-xs text-[#4B5563] leading-relaxed">{s.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
                {guardrailSteps.length > 0 && (
                  <SwytchcodeActionCard
                    step={4}
                    title="Pattern & Delivery Checks"
                    command="python check_leak_pattern / check_customer_pattern / check_delivery_status"
                    where="Aegis's own local pattern memory + order-status lookup, called before any decision."
                    how="No fixed rupee ceiling - the real judgment-based policy weighs these signals alongside verification confidence and plausibility."
                    icon={Radar}
                    payload={Object.fromEntries(guardrailSteps.map((s) => [s.tool, s.detail]))}
                  />
                )}
              </div>
            )}

            {/* STAGE 5: Action Dispatched */}
            {currentStep === 5 && (
              <div className="p-6 rounded-3xl bg-white border-2 border-emerald-400 ring-8 ring-emerald-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stage 5 of 5 · Live Execution & Sync</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                  Real Actions Dispatched
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {actionSteps.map((s) => {
                    const Icon = s.tool.includes("slack")
                      ? SlackLogo
                      : s.tool.includes("notion")
                      ? NotionLogo
                      : s.tool.includes("jira")
                      ? Ticket
                      : PayPalLogo;
                    return (
                      <div
                        key={s.id}
                        className="p-4 rounded-2xl border-2 border-teal-300 bg-teal-50/70 flex flex-col justify-between shadow-2xs space-y-2"
                      >
                        <div className="flex items-center gap-2 font-bold text-sm text-teal-900">
                          <Icon className="w-4 h-4" />
                          <span>{s.name}</span>
                        </div>
                        <p className="text-[11px] text-teal-800 leading-tight break-words">{s.detail}</p>
                      </div>
                    );
                  })}
                  {actionSteps.length === 0 && (
                    <p className="text-sm text-[#6B7280] sm:col-span-3">
                      No mutating actions were taken - the case was logged without a refund/dispute action.
                    </p>
                  )}
                </div>
                <SwytchcodeActionCard
                  step={5}
                  title="Multi-Bundle Sync"
                  command="swy exec ..."
                  where="Real dispatch across whichever of PayPal / Slack / Notion / Jira this case needed."
                  how="Each call here is a real Swytchcode-executed request - visible in full in `swy audit network --json`."
                  icon={Send}
                  payload={Object.fromEntries(actionSteps.map((s) => [s.tool, s.detail]))}
                />
              </div>
            )}

            {/* STAGE 6: Final Verdict */}
            {currentStep === 6 && decisionStyle && (
              <div
                className={`p-6 sm:p-8 rounded-3xl text-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-500 border-4 ${
                  liveResult?.decision === "Refunded"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-300"
                    : liveResult?.decision === "Denied"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-300"
                    : "bg-gradient-to-r from-purple-600 to-indigo-700 border-purple-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Full Resolution Complete</span>
                  </span>
                  {liveResult?.case_id && (
                    <span className="text-xs font-mono bg-black/20 px-3 py-1 rounded-full font-bold">
                      Case {liveResult.case_id}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Decision: {liveResult?.decision}
                </h2>
                <div className="bg-black/15 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border border-white/10 font-sans">
                  "{liveResult?.final_reasoning}"
                </div>
                <SwytchcodeActionCard
                  step={6}
                  title="Real Audit Ledger"
                  command="swy audit network --json"
                  where="Permanent enterprise governance and compliance verification layer."
                  how="Logs every outbound request this case actually made - verify it yourself with this exact command."
                  icon={Database}
                  payload={{ decision: liveResult?.decision, case_id: liveResult?.case_id, amount: liveResult?.amount }}
                />
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 text-white shrink-0 animate-pulse" />
                    <span>The customer's Tomato app reflects this same real result.</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRestart}
                      className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Run Again</span>
                    </button>
                    {onOpenFullConsole && (
                      <button
                        onClick={onOpenFullConsole}
                        className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-50 transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1"
                      >
                        <span>Inspect Raw Workbench</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stage Navigator */}
        <div className="pt-2">
          <div className="text-[11px] font-bold text-[#6B7280] mb-2 px-1 flex items-center justify-between">
            <span>Pipeline Station Navigator:</span>
            <span className="font-mono text-[10px]">Jump to Stage</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stepsConfig.map((s) => {
              const isSelected = currentStep === s.num;
              const isPassed = currentStep > s.num;
              const StepIcon = s.icon;
              const disabled = s.num === 2 && isFetching && !isSelected;
              return (
                <button
                  key={s.num}
                  disabled={disabled}
                  onClick={() => {
                    setCurrentStep(s.num);
                    setStepProgress(100);
                    setIsPlaying(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isSelected
                      ? "bg-white border-[#5E6AD2] ring-2 ring-[#5E6AD2]/20 shadow-xs"
                      : isPassed
                      ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                      : "bg-[#F3F4F6] border-[#E5E7EB] opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold">Stage {s.num}</span>
                    <StepIcon className={`w-3.5 h-3.5 ${isSelected ? "text-[#5E6AD2]" : "text-[#6B7280]"}`} />
                  </div>
                  <div className="text-xs font-bold truncate text-[#16171B]">{s.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
