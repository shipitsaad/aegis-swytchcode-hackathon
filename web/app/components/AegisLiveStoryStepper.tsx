"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Cpu,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Radar,
  ArrowRight,
  Database,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Activity,
  CheckCheck,
  Loader2,
  Brain,
  Search,
  AlertTriangle,
  Target,
  Check,
  ArrowLeft,
  Copy,
  Code2,
} from "lucide-react";
import { PayPalLogo, SlackLogo, NotionLogo } from "./ConsoleView";
import { DisputeScenario, DISPUTE_SCENARIOS } from "../types/scenarios";

interface SwytchcodeActionCardProps {
  step: number;
  title: string;
  command: string;
  where: string;
  how: string;
  icon: React.ComponentType<{ className?: string }>;
  payload: Record<string, any>;
}

function SwytchcodeActionCard({
  step,
  title,
  command,
  where,
  how,
  icon: Icon,
  payload,
}: SwytchcodeActionCardProps) {
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

        {/* Command Badge & Interactive Actions */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#8A8F98] bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {command}
          </span>

          {/* 1-Click Copy CLI Command Button */}
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

          {/* Feature 3: Inspect JSON Payload Toggle */}
          <button
            onClick={() => setIsInspectOpen(!isInspectOpen)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isInspectOpen
                ? "bg-[#F26522]/20 text-[#F26522] border border-[#F26522]/40"
                : "bg-white/5 text-[#CBD5E1] hover:text-white hover:bg-white/10 border border-white/10"
            }`}
            title="Inspect Swytchcode Execution Payload"
          >
            <Code2 className="w-2.5 h-2.5 text-[#F26522]" />
            <span>{isInspectOpen ? "Hide JSON" : "Inspect"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[#F26522] font-bold block mb-1">
            Where It Runs
          </span>
          <p className="text-white font-medium leading-relaxed">{where}</p>
        </div>
        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
            How Swytchcode Powers It
          </span>
          <p className="text-[#CBD5E1] leading-relaxed">{how}</p>
        </div>
      </div>

      {/* Expandable JSON Payload Inspector */}
      {isInspectOpen && (
        <div className="mt-2 p-3 rounded-xl bg-[#050608] border border-white/10 font-mono text-[10px] space-y-2 animate-in fade-in duration-200 shadow-inner">
          <div className="flex items-center justify-between text-[#8A8F98] border-b border-white/10 pb-1.5">
            <span className="text-[#F26522] font-bold flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>Swytchcode Terminal Schema Inspector · Step {step}</span>
            </span>
            <span className="text-emerald-400 font-mono text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Contract Verified
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
  scenario,
  onComplete,
  onReset,
  onOpenFullConsole,
}: AegisLiveStoryStepperProps) {
  const activeScenario = scenario || DISPUTE_SCENARIOS[0];
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<"demo" | "fast">("demo");
  const [stepProgress, setStepProgress] = useState<number>(0);

  // Step 2 Cognitive Stream Animation State
  const [thinkingStage, setThinkingStage] = useState<number>(0);
  const [tokensGenerated, setTokensGenerated] = useState<number>(14);

  // Guarantee step resets to 1 if promptText changes
  useEffect(() => {
    setCurrentStep(1);
    setStepProgress(0);
    setIsPlaying(true);
  }, [promptText]);

  // Progressive cognitive thinking stream when Step 2 is active
  useEffect(() => {
    if (currentStep < 2) {
      setThinkingStage(0);
      setTokensGenerated(14);
      return;
    }
    if (currentStep > 2) {
      setThinkingStage(4);
      setTokensGenerated(196);
      return;
    }

    // currentStep === 2: reset & trigger progressive thought stream
    setThinkingStage(0);
    setTokensGenerated(14);

    const stepInterval = speed === "demo" ? 1150 : 600;

    const t1 = setTimeout(() => {
      setThinkingStage(1);
      setTokensGenerated(52);
    }, stepInterval * 1);

    const t2 = setTimeout(() => {
      setThinkingStage(2);
      setTokensGenerated(98);
    }, stepInterval * 2);

    const t3 = setTimeout(() => {
      setThinkingStage(3);
      setTokensGenerated(146);
    }, stepInterval * 3);

    const t4 = setTimeout(() => {
      setThinkingStage(4);
      setTokensGenerated(196);
    }, stepInterval * 4);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [currentStep, speed]);

  // Auto-advance step timer with progressive fill bar
  useEffect(() => {
    if (!isPlaying || !isActive) return;
    if (currentStep >= 6) return;

    setStepProgress(0);
    const intervalTime = 50;
    // Step 1: 5200ms (inbound claim ingestion)
    // Step 2: 6400ms in demo mode (real-time cognitive thinking monologue stream)
    // Steps 3-5: 4200ms
    const effectiveDuration = currentStep === 1 
      ? (speed === "demo" ? 5200 : 2500)
      : currentStep === 2
      ? (speed === "demo" ? 6400 : 3200)
      : (speed === "demo" ? 4200 : 2000);
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

    const advanceTimer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, effectiveDuration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(advanceTimer);
    };
  }, [currentStep, isPlaying, isActive, speed]);

  // Safely notify parent when final stage is reached
  useEffect(() => {
    if (currentStep >= 6 && onComplete) {
      onComplete();
    }
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
    { num: 2, title: "Aegis Thinking", subtitle: "AI reasoning", icon: Cpu },
    { num: 3, title: "PayPal Verified", subtitle: "Sandbox query", icon: CreditCard },
    { num: 4, title: "Guardrails Passed", subtitle: "Cap & Leak Radar", icon: ShieldCheck },
    { num: 5, title: "Action Dispatched", subtitle: "Refund & Ledger", icon: Zap },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#F6F7F9] text-[#16171B] overflow-hidden select-none">
      {/* -------------------------------------------------------------------- */}
      {/* 1. Interactive Demo Control Bar                                      */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white border-b border-[#E4E6EA] px-4 py-2.5 shrink-0 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5E6AD2] animate-pulse" />
            <div>
              <span className="font-black text-xs sm:text-sm tracking-tight text-[#16171B]">
                Aegis Financial Defense Engine
              </span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F26522]/10 border border-[#F26522]/30 text-[#F26522] font-bold">
                Swytchcode Sandboxed
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

          {/* Demo Controls: Play/Pause, Speed, Manual Stepper */}
          <div className="flex items-center gap-1.5 text-xs">
            {/* Speed Toggle */}
            <div className="flex items-center bg-[#F3F4F6] p-0.5 rounded-lg border border-[#E5E7EB] text-[10px] font-medium text-[#6B7280]">
              <button
                onClick={() => setSpeed("demo")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  speed === "demo" ? "bg-white text-[#16171B] font-bold shadow-2xs" : "hover:text-[#16171B]"
                }`}
                title="Comfortable Demo Pace (4.2s per stage)"
              >
                Demo Pace (4.2s)
              </button>
              <button
                onClick={() => setSpeed("fast")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  speed === "fast" ? "bg-white text-[#16171B] font-bold shadow-2xs" : "hover:text-[#16171B]"
                }`}
                title="Fast Pace (2.0s per stage)"
              >
                Fast (2.0s)
              </button>
            </div>

            {/* Play / Pause Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#16171B] border border-[#E5E7EB] transition-colors cursor-pointer"
              title={isPlaying ? "Pause auto-stepper" : "Resume auto-stepper"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            {/* Manual Step Controls */}
            <button
              onClick={handlePrevStep}
              disabled={currentStep <= 1}
              className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#16171B] border border-[#E5E7EB] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStep >= 6}
              className="px-2.5 py-1 rounded-lg bg-[#5E6AD2] hover:bg-[#4F5BC0] text-white font-semibold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
              title="Advance to next step"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Restart */}
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#16171B] border border-[#E5E7EB] transition-colors cursor-pointer"
              title="Restart story from Step 1"
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

        {/* Multi-Station Step Progress Bar with REAL-TIME PROGRESS FILL */}
        <div className="grid grid-cols-5 gap-1.5 pt-0.5">
          {stepsConfig.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  setCurrentStep(s.num);
                  setStepProgress(100);
                  setIsPlaying(false);
                }}
                className="flex flex-col gap-1 cursor-pointer group"
              >
                <div className="h-2 rounded-full overflow-hidden bg-[#E5E7EB] relative border border-[#E5E7EB]">
                  <div
                    className={`h-full transition-all ${
                      isCompleted
                        ? "bg-emerald-500 w-full"
                        : isCurrent
                        ? "bg-[#5E6AD2]"
                        : "w-0"
                    }`}
                    style={isCurrent ? { width: `${stepProgress}%` } : undefined}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-semibold text-[#6B7280]">
                  <span
                    className={
                      isCurrent
                        ? "text-[#5E6AD2] font-black"
                        : isCompleted
                        ? "text-emerald-700"
                        : "opacity-60"
                    }
                  >
                    {s.num}. {s.title}
                  </span>
                  {isCompleted && <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />}
                  {isCurrent && isPlaying && (
                    <span className="text-[#5E6AD2] font-mono text-[8px] animate-pulse">
                      {Math.round(stepProgress)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. Main Stage: VERY BIG HIGHLIGHT OF WHAT IS GOING ON RIGHT NOW       */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full">
        {/* ================================================================== */}
        {/* STAGE 1 HIGHLIGHT: INBOUND CLAIM INGESTION                         */}
        {/* ================================================================== */}
        {currentStep === 1 && (
          <div className="p-6 rounded-3xl bg-white border-2 border-blue-400 ring-8 ring-blue-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Stage 1 of 5 · Inbound Support Claim</span>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Ingested Live</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                Receiving Customer Support Ticket
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Dispatched directly from the customer's Tomato App support chat (Order #TM-9402)
              </p>
            </div>

            {/* Massive Callout Box */}
            <div className="bg-[#FAF9FB] rounded-2xl p-4 sm:p-5 border border-[#E2E4E9] shadow-inner space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A8F98] block">
                Raw Customer Claim Text
              </span>
              <p className="text-base sm:text-lg font-serif italic text-[#16171B] leading-relaxed">
                "{promptText}"
              </p>
            </div>

            {/* Extracted Telemetry Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                <span className="text-[10px] text-blue-600 block uppercase font-bold">Intent Classified</span>
                <span className="text-sm font-mono font-black text-blue-950">
                  {activeScenario.id === "bot_attack"
                    ? "rapid_retry_charge"
                    : activeScenario.id === "high_value"
                    ? "high_ticket_dispute"
                    : "duplicate_glitch_charge"}
                </span>
              </div>
              <div className="bg-red-50/70 p-3 rounded-xl border border-red-200">
                <span className="text-[10px] text-red-600 block uppercase font-bold">Target Capture Ref</span>
                <span className="text-sm font-mono font-black text-red-950">{activeScenario.captureId}</span>
              </div>
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-600 block uppercase font-bold">Claimed Amount</span>
                <span className="text-sm font-mono font-black text-emerald-950">{activeScenario.amount} INR</span>
              </div>
            </div>

            {/* Swytchcode in Action: Untrusted Intake Boundary */}
            <SwytchcodeActionCard
              step={1}
              title="Untrusted Intake Boundary"
              command="swy boundary isolate --mode=intake"
              where="Consumer edge boundary between the customer's Tomato App and Aegis internal backend."
              how="Sanitizes untrusted ticket parameters, enforces caller isolation, and prevents malicious prompt injection from reaching downstream payment credentials."
              icon={ShieldCheck}
              payload={{
                cli_command: "swy boundary isolate --mode=intake",
                boundary_mode: "untrusted_consumer_intake",
                sanitized_inputs: {
                  claimant_id: "usr_rahul_9402",
                  capture_reference: activeScenario.captureId,
                  claimed_amount: activeScenario.amount,
                  intent_extracted:
                    activeScenario.id === "bot_attack"
                      ? "rapid_retry_charge"
                      : activeScenario.id === "high_value"
                      ? "high_ticket_dispute"
                      : "duplicate_glitch_charge",
                },
                prompt_injection_firewall: "PASSED (0 heuristics tripped)",
                egress_token_quarantine: "ACTIVE",
              }}
            />

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-medium">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5E6AD2] animate-spin shrink-0" />
                <span>Forwarding ticket to Aegis Agent Brain to formulate reasoning...</span>
              </span>
              <button
                onClick={handleNextStep}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#4F5BC0] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>Advance to Step 2: Agent Thinking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* STAGE 2 HIGHLIGHT: WHAT AEGIS IS ACTUALLY THINKING                 */}
        {/* ================================================================== */}
        {currentStep === 2 && (
          <div className="p-6 rounded-3xl bg-white border-2 border-purple-500 ring-8 ring-purple-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
            {/* Header bar with Neural Waves and Model Info */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                <span>Stage 2 of 5 · Autonomous AI Brain</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Live Neural Waveform Visualizer */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950 text-[10px] text-purple-300 border border-purple-800/80 font-mono shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Neural Waves:</span>
                  <div className="flex items-end gap-0.5 h-3 w-8">
                    <div className="w-1 bg-purple-400 rounded-full animate-pulse h-2" />
                    <div className="w-1 bg-purple-300 rounded-full animate-bounce h-3" />
                    <div className="w-1 bg-indigo-400 rounded-full animate-pulse h-1.5" />
                    <div className="w-1 bg-emerald-400 rounded-full animate-bounce h-2.5" />
                  </div>
                </div>

                <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 font-bold hidden sm:inline-block">
                  Groq Llama-3 70B · 84.2 tok/s
                </span>
              </div>
            </div>

            {/* Title & Live Telemetry Counters */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                  What Aegis Is Actually Thinking
                </h2>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-bold">
                    Tokens: {tokensGenerated} · Latency: 120ms
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Real-time cognitive internal monologue: evaluating dispute policies & planning sandbox actions
              </p>
            </div>

            {/* LangGraph Node Execution Pipeline Bar */}
            <div className="grid grid-cols-3 gap-2 bg-[#0F1017] p-2 sm:p-2.5 rounded-2xl border border-purple-900/40 text-[11px] font-mono shadow-inner">
              {/* Node 1 */}
              <div className={`p-2 rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                thinkingStage >= 1
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                  : "bg-purple-950/60 border-purple-500/50 text-purple-200 ring-2 ring-purple-500/30"
              }`}>
                {thinkingStage >= 1 ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0" />
                )}
                <div className="truncate">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-[#8A8F98]">Node 1</div>
                  <div className="font-bold text-xs truncate">Claim Tokenizer</div>
                </div>
              </div>

              {/* Node 2 */}
              <div className={`p-2 rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                thinkingStage >= 3
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                  : thinkingStage >= 1
                  ? "bg-purple-950/60 border-purple-500/50 text-purple-200 ring-2 ring-purple-500/30"
                  : "bg-white/5 border-white/5 text-[#6B7280]"
              }`}>
                {thinkingStage >= 3 ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : thinkingStage >= 1 ? (
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                )}
                <div className="truncate">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-[#8A8F98]">Node 2</div>
                  <div className="font-bold text-xs truncate">Policy Auditor</div>
                </div>
              </div>

              {/* Node 3 */}
              <div className={`p-2 rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                thinkingStage >= 4
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                  : thinkingStage >= 3
                  ? "bg-purple-950/60 border-purple-500/50 text-purple-200 ring-2 ring-purple-500/30"
                  : "bg-white/5 border-white/5 text-[#6B7280]"
              }`}>
                {thinkingStage >= 4 ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : thinkingStage >= 3 ? (
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                )}
                <div className="truncate">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-[#8A8F98]">Node 3</div>
                  <div className="font-bold text-xs truncate">Tool Synthesizer</div>
                </div>
              </div>
            </div>

            {/* Massive Terminal: Authentic Thought Monologue with Animated Stream */}
            <div className="bg-[#0B0C10] rounded-2xl p-5 border-2 border-purple-500/40 shadow-2xl text-xs sm:text-sm font-mono text-[#D8E2EC] space-y-3 leading-relaxed relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-[#A5B4FC]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>aegis-brain-agent // live_internal_monologue.log</span>
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{thinkingStage < 4 ? "STREAMING_REASONING_TOKENS" : "REASONING_SYNTHESIZED"}</span>
                </span>
              </div>

              {/* Streamed Log Output */}
              <div className="space-y-2.5 text-[12px] sm:text-[13px] font-mono min-h-[190px]">
                {/* Step 0: Ingestion */}
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <p className="text-purple-300 font-semibold flex items-start gap-1.5">
                    <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-purple-200">[Cognitive Parse]:</strong> Ingesting claim:{" "}
                      <span className="italic text-[#E2E8F0]">"{promptText}"</span>
                    </span>
                  </p>
                  <p className="text-[#94A3B8] text-[11px] pl-5 mt-0.5">
                    ↳ <span className="text-purple-200">Extraction:</span> capture_ref=
                    <code className="text-white bg-purple-900/60 px-1 py-0.5 rounded font-bold">
                      {promptText.match(/TEST-[A-Z0-9_-]+/i)?.[0] || "TEST-SMALL"}
                    </code>
                    {" · "}
                    claimed_amount=<span className="text-emerald-400 font-bold">₹45.00</span>
                  </p>
                </div>

                {/* Step 1: Classification */}
                {thinkingStage >= 1 && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 border-l-2 border-blue-500/50 pl-3">
                    <p className="text-blue-300 font-semibold flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span><strong className="text-blue-200">[Intent Classification]:</strong> Plain billing dispute (cancelled order duplicate charge).</span>
                    </p>
                    <p className="text-[#94A3B8] text-[11px] mt-0.5 pl-5">
                      ↳ Confidence: <span className="text-emerald-400 font-bold">99.4%</span> · Formality: Informal customer complaint
                    </p>
                  </div>
                )}

                {/* Step 2: Policy Rule */}
                {thinkingStage >= 2 && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 border-l-2 border-amber-500/50 pl-3">
                    <p className="text-amber-300 font-semibold flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong className="text-amber-200">[Policy Rule #1 (MANDATORY)]:</strong> "Never take the customer's word for the amount or status — check the real transaction in PayPal."</span>
                    </p>
                    <p className="text-amber-200/70 text-[11px] mt-0.5 pl-5">
                      ↳ Risk evaluation: Low-value claim (&lt; ₹100), but gateway status verification is non-negotiable.
                    </p>
                  </div>
                )}

                {/* Step 3: Decided Next Action */}
                {thinkingStage >= 3 && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 border-l-2 border-emerald-500/50 pl-3">
                    <p className="text-emerald-300 font-semibold flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span><strong className="text-emerald-200">[Decided Next Action]:</strong> Query the live merchant PayPal sandbox to inspect authentic capture record for ID{" "}
                      <code className="bg-purple-900/60 px-1 py-0.5 rounded text-white font-bold">
                        {promptText.match(/TEST-[A-Z0-9_-]+/i)?.[0] || "TEST-SMALL"}
                      </code>.</span>
                    </p>
                  </div>
                )}

                {/* Step 4: Tool Plan Prepared */}
                {thinkingStage >= 4 && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 border-l-2 border-purple-500/50 pl-3">
                    <p className="text-sky-300 font-semibold flex items-center gap-1.5 flex-wrap">
                      <Zap className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <strong className="text-sky-200">[Tool Call Synthesized]:</strong>
                      <code className="text-white bg-blue-900/70 border border-blue-400/40 px-2 py-0.5 rounded font-mono font-bold shadow-xs">
                        paypal_lookup_capture(capture_id="{promptText.match(/TEST-[A-Z0-9_-]+/i)?.[0] || "TEST-SMALL"}")
                      </code>
                    </p>
                    <p className="text-emerald-400 text-[11px] font-bold mt-1 flex items-center gap-1 pl-5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Reasoning complete (320ms). Execution plan dispatched to sandbox gateway.</span>
                    </p>
                  </div>
                )}

                {/* Blinking Typing Cursor */}
                {thinkingStage < 4 && (
                  <div className="flex items-center gap-1.5 text-purple-400 text-xs pt-1 animate-pulse">
                    <span className="inline-block w-2 h-4 bg-purple-400" />
                    <span className="text-[11px] font-mono text-purple-300">
                      Aegis cognitive reasoning in progress...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Swytchcode in Action: Dynamic Tool Registry Binding */}
            <SwytchcodeActionCard
              step={2}
              title="Dynamic Tool Registry Binding"
              command="swy list tooling --json"
              where="LangGraph cognitive reasoning loop prior to tool dispatch."
              how="Swytchcode binds verified JSON Schemas into the agent context, guaranteeing the LLM strictly adheres to real PayPal parameter contracts without hallucinating invalid arguments."
              icon={Cpu}
              payload={{
                cli_command: "swy list tooling --json",
                registry_binding: "langgraph_financial_reasoning_node",
                allowed_tool_schemas: [
                  {
                    name: "paypal_lookup_capture",
                    parameters: {
                      capture_id: {
                        type: "string",
                        pattern: "^TEST-[A-Z0-9_-]+$",
                      },
                    },
                  },
                ],
                argument_hallucination_prevention: "STRICT_JSON_SCHEMA_ENFORCED",
                active_model: "Groq Llama-3 70B (84.2 tok/s)",
              }}
            />

            {/* Advance Footer */}
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-medium">
              <span className="flex items-center gap-2">
                {thinkingStage < 4 ? (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
                    <span>Aegis Brain is synthesizing dispute decision plan ({thinkingStage + 1} of 4)...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Agent has formulated execution plan: Dispatching API query to PayPal sandbox...</span>
                  </>
                )}
              </span>
              <button
                onClick={handleNextStep}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>Advance to Step 3: PayPal Query</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* STAGE 3 HIGHLIGHT: LIVE PAYPAL VERIFICATION                         */}
        {/* ================================================================== */}
        {currentStep === 3 && (
          <div className="p-6 rounded-3xl bg-white border-2 border-sky-400 ring-8 ring-sky-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <PayPalLogo className="w-4 h-4" />
                <span>Stage 3 of 5 · Sandbox Gateway Query</span>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                200 OK · 185ms Latency
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                Live PayPal Sandbox Query Executed
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1 font-mono">
                GET https://api-m.sandbox.paypal.com/v2/payments/captures/TEST-SMALL
              </p>
            </div>

            {/* Massive Verification Card */}
            <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl p-5 border-2 border-sky-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <span className="text-xs uppercase font-extrabold tracking-wider text-sky-900">
                  Authenticated Transaction Record
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" />
                  Authentic PayPal Capture Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-sky-200 text-center shadow-2xs">
                  <span className="text-[11px] text-[#6B7280] block font-sans">Capture Identifier</span>
                  <span className="text-lg font-mono font-black text-[#16171B]">{activeScenario.captureId}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-200 text-center shadow-2xs">
                  <span className="text-[11px] text-emerald-700 block font-sans">Payment Status</span>
                  <span className="text-lg font-mono font-black text-emerald-700">COMPLETED</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-sky-200 text-center shadow-2xs">
                  <span className="text-[11px] text-[#6B7280] block font-sans">Real Amount Debited</span>
                  <span className="text-lg font-mono font-black text-[#16171B]">{activeScenario.amount}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Claim Authenticated:</strong> PayPal records confirm {activeScenario.amount} was indeed debited for transaction {activeScenario.captureId}. Claim verified against authentic ledger!
                </span>
              </div>
            </div>

            {/* Swytchcode in Action: Managed Credential Gateway */}
            <SwytchcodeActionCard
              step={3}
              title="Managed Credential Gateway"
              command="swy exec payments.payment.captures.get"
              where="Live outbound execution tunnel between Aegis and PayPal Sandbox."
              how="Swytchcode executes OAuth2 credential exchanges, bearer injection, and error normalization on the agent's behalf. Zero private merchant API keys are exposed to the LLM."
              icon={CreditCard}
              payload={{
                cli_command: "swy exec payments.payment.captures.get",
                transport: "paypal_sandbox_oauth2",
                bearer_token_mode: "swytchcode_managed_vault",
                merchant_api_key_exposed_to_agent: false,
                upstream_response: {
                  id: activeScenario.captureId,
                  status: "COMPLETED",
                  amount: {
                    value: activeScenario.amountNumber.toFixed(2),
                    currency_code: "INR",
                  },
                  merchant_id: "TOMATO_FOODS_PVT",
                },
                upstream_latency_ms: 185,
              }}
            />

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-medium">
              <span>Next: Testing claim against Swytchcode safety thresholds & Leak Radar...</span>
              <button
                onClick={handleNextStep}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>Advance to Step 4: Guardrail Checks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* STAGE 4 HIGHLIGHT: SWYTCHCODE GUARDRAILS & LEAK RADAR              */}
        {/* ================================================================== */}
        {currentStep === 4 && (
          <div className="p-6 rounded-3xl bg-white border-2 border-indigo-400 ring-8 ring-indigo-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5E6AD2]" />
                <span>Stage 4 of 5 · Autonomous Safety Checks</span>
              </div>
              <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 font-bold">
                Swytchcode Guardrails Active
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                Safety Thresholds & Leak Radar Cleared
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Aegis verifies that autonomous payout parameters fall strictly within merchant safety limits
              </p>
            </div>

            {/* Massive 2-Column Guardrail Checkers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Check 1: Amount Limit */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-white p-5 rounded-2xl border-2 border-indigo-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-[#16171B]">
                    <Lock className="w-4 h-4 text-[#5E6AD2]" />
                    <span>Amount Ceiling Policy</span>
                  </div>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    activeScenario.amountNumber <= 100
                      ? "text-emerald-700 bg-emerald-100"
                      : "text-purple-700 bg-purple-100"
                  }`}>
                    <span>{activeScenario.amountNumber <= 100 ? "PASSED" : "CEILING EXCEEDED"}</span>
                    {activeScenario.amountNumber <= 100 && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </div>
                <div className={`text-xl font-mono font-black ${
                  activeScenario.amountNumber <= 100 ? "text-emerald-800" : "text-purple-800"
                }`}>
                  {activeScenario.amount} {activeScenario.amountNumber <= 100 ? "≤ ₹100.00 Limit" : "> ₹100.00 Limit"}
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {activeScenario.amountNumber <= 100
                    ? "Amount is within the low-risk autonomous threshold. Aegis is cleared to act without waiting for human manager approval."
                    : "Amount exceeds autonomous refund ceiling. Aegis policy halts automatic disbursement and requires human supervisor sign-off."}
                </p>
              </div>

              {/* Check 2: Leak Radar Velocity */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-white p-5 rounded-2xl border-2 border-indigo-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-[#16171B]">
                    <Radar className="w-4 h-4 text-orange-500" />
                    <span>Leak Radar Anomaly Check</span>
                  </div>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    activeScenario.id === "bot_attack"
                      ? "text-rose-700 bg-rose-100"
                      : "text-emerald-700 bg-emerald-100"
                  }`}>
                    <span>{activeScenario.id === "bot_attack" ? "CLUSTER DETECTED" : "NO CLUSTERS"}</span>
                    {activeScenario.id !== "bot_attack" && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </div>
                <div className={`text-xl font-mono font-black ${
                  activeScenario.id === "bot_attack" ? "text-rose-800" : "text-emerald-800"
                }`}>
                  {activeScenario.velocityMetric}
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {activeScenario.id === "bot_attack"
                    ? "6 rapid retry complaints detected within 10 minutes from this client subnet. Velocity breaker triggered to prevent card-testing draining!"
                    : "Zero repeat complaints detected at this threshold. Confirms an isolated glitch, not a coordinated card-testing script."}
                </p>
              </div>
            </div>

            {/* Swytchcode in Action: Autonomous Policy & Velocity Engine */}
            <SwytchcodeActionCard
              step={4}
              title="Autonomous Policy & Velocity Engine"
              command="swy guardrail check --dry-run"
              where="Pre-execution safety gatekeeper before authorizing money movement."
              how={activeScenario.whyGuardrail}
              icon={Radar}
              payload={{
                cli_command: "swy guardrail check --dry-run",
                policy_checks: {
                  max_delegated_amount_ceiling: "₹100.00",
                  disputed_amount: activeScenario.amount,
                  ceiling_passed: activeScenario.amountNumber <= 100,
                  velocity_radar_scan: activeScenario.velocityMetric,
                  velocity_passed: activeScenario.id !== "bot_attack",
                },
                guardrail_verdict: activeScenario.guardrailStatus.toUpperCase(),
                policy_action:
                  activeScenario.id === "bot_attack"
                    ? "HALT_EXECUTION_FRAUD_TRIGGER"
                    : activeScenario.id === "high_value"
                    ? "ROUTE_TO_HUMAN_SUPERVISOR"
                    : "AUTHORIZE_AUTONOMOUS_PAYOUT",
              }}
            />

            <div className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-semibold ${
              activeScenario.outcomeType === "blocked"
                ? "bg-rose-50 border-rose-200 text-rose-950"
                : activeScenario.outcomeType === "escalated"
                ? "bg-purple-50 border-purple-200 text-purple-950"
                : "bg-emerald-50 border-emerald-200 text-emerald-950"
            }`}>
              <span className="flex items-center gap-2">
                {activeScenario.outcomeType === "blocked" ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Verdict: Leak Radar tripped! Automated block and security alert queued.</span>
                  </>
                ) : activeScenario.outcomeType === "escalated" ? (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Verdict: High-value dispute routed to Human Escalation Queue (Ref: AEGIS-9402-ESC).</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verdict: Autonomous refund authorized with 100% policy confidence!</span>
                  </>
                )}
              </span>
              <button
                onClick={handleNextStep}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 ${
                  activeScenario.outcomeType === "blocked"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : activeScenario.outcomeType === "escalated"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <span>Advance to Step 5: Multi-System Execution</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* STAGE 5 HIGHLIGHT: MULTI-SYSTEM EXECUTION DISPATCH                 */}
        {/* ================================================================== */}
        {currentStep === 5 && (
          <div className="p-6 rounded-3xl bg-white border-2 border-emerald-400 ring-8 ring-emerald-500/10 shadow-xl space-y-4 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Stage 5 of 5 · Live Execution & Sync</span>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                All 3 Integrations Active
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16171B]">
                Executing Autonomous Resolution Live
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Swytchcode simultaneously triggers the PayPal refund, alerts merchant Slack, and records in Notion
              </p>
            </div>

            {/* Massive 3-Column Execution Showcase */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Box 1: Action Dispatch */}
              <div className={`p-4 rounded-2xl border-2 flex flex-col justify-between shadow-2xs space-y-2 ${
                activeScenario.outcomeType === "blocked"
                  ? "bg-rose-50/70 border-rose-300"
                  : activeScenario.outcomeType === "escalated"
                  ? "bg-purple-50/70 border-purple-300"
                  : "bg-sky-50/70 border-sky-300"
              }`}>
                <div className={`flex items-center gap-2 font-bold text-sm ${
                  activeScenario.outcomeType === "blocked"
                    ? "text-rose-900"
                    : activeScenario.outcomeType === "escalated"
                    ? "text-purple-900"
                    : "text-sky-900"
                }`}>
                  <PayPalLogo className="w-4 h-4" />
                  <span>
                    {activeScenario.outcomeType === "blocked"
                      ? "1. Anti-Fraud Lock"
                      : activeScenario.outcomeType === "escalated"
                      ? "1. Human Escalation"
                      : "1. PayPal Refund"}
                  </span>
                </div>
                <div className="text-xs font-mono bg-white p-2 rounded-lg border border-black/10">
                  <span className="text-[10px] text-[#6B7280] block">Action Status</span>
                  <span className={`font-black ${
                    activeScenario.outcomeType === "blocked"
                      ? "text-rose-700"
                      : activeScenario.outcomeType === "escalated"
                      ? "text-purple-700"
                      : "text-emerald-700"
                  }`}>
                    {activeScenario.outcomeType === "blocked"
                      ? "PAYMENT BLOCKED"
                      : activeScenario.outcomeType === "escalated"
                      ? "TICKET DISPATCHED"
                      : `REF-9921 · ${activeScenario.amount}`}
                  </span>
                </div>
                <p className={`text-[11px] leading-tight ${
                  activeScenario.outcomeType === "blocked"
                    ? "text-rose-800"
                    : activeScenario.outcomeType === "escalated"
                    ? "text-purple-800"
                    : "text-sky-800"
                }`}>
                  {activeScenario.outcomeType === "blocked"
                    ? "Velocity freeze applied. Zero merchant money lost."
                    : activeScenario.outcomeType === "escalated"
                    ? "Case routed to senior agent for manual authorization."
                    : "Funds reversed to customer's account instantly."}
                </p>
              </div>

              {/* Box 2: Slack Alert */}
              <div className="bg-teal-50/70 p-4 rounded-2xl border-2 border-teal-300 flex flex-col justify-between shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-teal-900">
                  <SlackLogo className="w-4 h-4" />
                  <span>2. Slack Ops Alert</span>
                </div>
                <div className="text-xs font-mono bg-white p-2 rounded-lg border border-teal-200">
                  <span className="text-[10px] text-[#6B7280] block">Channel</span>
                  <span className="text-teal-700 font-black">
                    {activeScenario.id === "bot_attack"
                      ? "#security-ops"
                      : activeScenario.id === "high_value"
                      ? "#fraud-supervisors"
                      : "#all-swytchcode"}
                  </span>
                </div>
                <p className="text-[11px] text-teal-800 leading-tight">
                  Operations team notified with case reasoning.
                </p>
              </div>

              {/* Box 3: Notion Ledger */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border-2 border-purple-300 flex flex-col justify-between shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
                  <NotionLogo className="w-4 h-4 text-[#16171B]" />
                  <span>3. Notion Audit Ledger</span>
                </div>
                <div className="text-xs font-mono bg-white p-2 rounded-lg border border-purple-200">
                  <span className="text-[10px] text-[#6B7280] block">Ledger Row ID</span>
                  <span className="text-purple-800 font-black">AEGIS-9402-REF</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-tight">
                  Permanent record logged with compliance trace.
                </p>
              </div>
            </div>

            {/* Swytchcode in Action: Atomic 3-API Multi-Bundle Sync */}
            <SwytchcodeActionCard
              step={5}
              title="Atomic 3-API Multi-Bundle Sync"
              command={
                activeScenario.outcomeType === "blocked"
                  ? "swy exec security_lock + slack + notion"
                  : activeScenario.outcomeType === "escalated"
                  ? "swy exec zendesk_escalate + slack + notion"
                  : "swy exec paypal + slack + notion"
              }
              where="Enterprise multi-vendor settlement across PayPal, Slack, and Notion."
              how={
                activeScenario.outcomeType === "blocked"
                  ? "Halted payment disbursement, posted critical security alarm to Slack (#security-ops), and committed attacker IP to Notion firewall blacklist."
                  : activeScenario.outcomeType === "escalated"
                  ? "Created supervisor escalation ticket, posted review request to Slack (#fraud-supervisors), and logged audit trace to Notion."
                  : "Simultaneously triggers the PayPal refund, broadcasts an ops notification to Slack (#all-swytchcode), and commits an audit row to Notion within a single unified transaction context."
              }
              icon={Zap}
              payload={{
                cli_command: "swy exec paypal + slack + notion",
                multi_bundle_transaction: {
                  action:
                    activeScenario.outcomeType === "refunded"
                      ? "EXECUTE_REFUND"
                      : "TRIGGER_DEFENSIVE_LOCK",
                  paypal_target: activeScenario.captureId,
                  slack_target_channel:
                    activeScenario.id === "bot_attack"
                      ? "#security-ops"
                      : activeScenario.id === "high_value"
                      ? "#fraud-supervisors"
                      : "#all-swytchcode",
                  notion_database_row: "AEGIS-9402-REF",
                },
                atomic_sync_status: "COMMITTED (3 of 3 endpoints)",
                total_execution_ms: 38,
              }}
            />

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-semibold">
              <span>Syncing resolution status back to customer's Tomato App...</span>
              <button
                onClick={handleNextStep}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>View Final Verdict Outcome</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* STAGE 6 HIGHLIGHT: FINAL OUTCOME VERDICT                           */}
        {/* ================================================================== */}
        {currentStep === 6 && (
          <div className={`p-6 sm:p-8 rounded-3xl text-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-500 border-4 ${
            activeScenario.outcomeType === "blocked"
              ? "bg-gradient-to-r from-rose-600 to-rose-700 border-rose-300"
              : activeScenario.outcomeType === "escalated"
              ? "bg-gradient-to-r from-purple-600 to-indigo-700 border-purple-300"
              : "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-300"
          }`}>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Full Resolution Complete</span>
              </span>
              <span className="text-xs font-mono bg-black/20 px-3 py-1 rounded-full font-bold">
                Case AEGIS-9402-REF
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Decision: {activeScenario.outcomeTitle}
              </h2>
              <p className="text-sm sm:text-base text-white/90">
                {activeScenario.outcomeType === "blocked"
                  ? "Bot attack successfully intercepted: Swytchcode velocity memory halted payout."
                  : activeScenario.outcomeType === "escalated"
                  ? "Dispute safely routed to Senior Fraud Review: claim exceeds autonomous ceiling."
                  : "Dispute successfully resolved autonomously under Swytchcode execution guardrails."}
              </p>
            </div>

            <div className="bg-black/15 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border border-white/10 font-sans">
              "{activeScenario.outcomeDesc}"
            </div>

            {/* Swytchcode in Action: Cryptographic Audit Ledger */}
            <SwytchcodeActionCard
              step={6}
              title="Cryptographic Audit Ledger"
              command="swy audit network --json"
              where="Permanent enterprise governance and compliance verification layer."
              how="Cryptographically logs every outbound request payload, response status, and latency timestamp into Swytchcode's audit network, providing complete regulatory replayability."
              icon={Database}
              payload={{
                cli_command: "swy audit network --json",
                audit_hash: "0x8fa3e91b420f18c7429d5b",
                cryptographic_replay_signature: "valid",
                case_reference: "AEGIS-9402-REF",
                timestamp: "2026-09-26T09:41:00Z",
                final_disposition: activeScenario.outcomeTitle,
                human_in_loop_escalation: activeScenario.id === "high_value",
                fraud_incident_id:
                  activeScenario.id === "bot_attack" ? "INC-VELOCITY-094" : null,
              }}
            />

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-white shrink-0 animate-pulse" />
                <span>Customer's Tomato app on the left has received the live refund credit!</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestart}
                  className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Stepper</span>
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

        {/* ================================================================== */}
        {/* Step History Timeline Quick-Bar (Allows jumping to any stage)      */}
        {/* ================================================================== */}
        <div className="pt-2">
          <div className="text-[11px] font-bold text-[#6B7280] mb-2 px-1 flex items-center justify-between">
            <span>Pipeline Station Navigator (Click any stage to highlight):</span>
            <span className="font-mono text-[10px]">Jump to Stage</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stepsConfig.map((s) => {
              const isSelected = currentStep === s.num;
              const isPassed = currentStep > s.num;
              const StepIcon = s.icon;
              return (
                <button
                  key={s.num}
                  onClick={() => {
                    setCurrentStep(s.num);
                    setStepProgress(100);
                    setIsPlaying(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
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
                  <div className="text-xs font-bold truncate text-[#16171B]">
                    {s.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
