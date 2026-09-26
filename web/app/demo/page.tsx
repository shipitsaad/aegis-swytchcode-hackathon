"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Terminal,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Workflow,
} from "lucide-react";
import TomatoAppMockup from "../components/TomatoAppMockup";
import ConsoleView from "../components/ConsoleView";
import AegisLiveStoryStepper from "../components/AegisLiveStoryStepper";
import { DISPUTE_SCENARIOS, DisputeScenario, ScenarioId } from "../types/scenarios";

export default function DemoStoryPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>("standard");
  const currentScenario =
    DISPUTE_SCENARIOS.find((s) => s.id === selectedScenarioId) || DISPUTE_SCENARIOS[0];

  const [isConsoleRevealed, setIsConsoleRevealed] = useState(false);
  const [activePrompt, setActivePrompt] = useState(currentScenario.promptText);
  const [refundCompleted, setRefundCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"story" | "console">("story");
  const [stepperSessionKey, setStepperSessionKey] = useState(0);

  const handleSelectScenario = (id: ScenarioId) => {
    setSelectedScenarioId(id);
    const sc = DISPUTE_SCENARIOS.find((s) => s.id === id) || DISPUTE_SCENARIOS[0];
    setActivePrompt(sc.promptText);
    setIsConsoleRevealed(false);
    setRefundCompleted(false);
    setViewMode("story");
    setStepperSessionKey((prev) => prev + 1);
  };

  const handleSendMessage = (promptText: string) => {
    setActivePrompt(promptText);
    setStepperSessionKey((prev) => prev + 1);
    setIsConsoleRevealed(true);
    setRefundCompleted(false);
    setViewMode("story"); // Default to step-by-step story
  };

  const handleStepperComplete = () => {
    setRefundCompleted(true);
  };

  const handleReset = () => {
    setIsConsoleRevealed(false);
    setRefundCompleted(false);
    setViewMode("story");
    setStepperSessionKey((prev) => prev + 1);
  };

  return (
    <div className="relative h-screen max-h-screen w-screen bg-[#F6F7F9] text-[#16171B] flex flex-col font-sans overflow-hidden select-none">
      {/* Top Banner Navigation */}
      <header className="h-14 border-b border-[#E4E6EA] bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#4B5563] hover:text-[#16171B] transition-colors font-medium py-1.5 px-2.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          <div className="h-5 w-[1px] bg-[#E4E6EA]" />

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#E23744] text-white flex items-center justify-center font-black text-[11px] shadow-xs">
              T
            </span>
            <div className="leading-tight">
              <div className="font-semibold text-xs sm:text-sm tracking-tight text-[#16171B] flex items-center gap-2">
                <span>The Story of a Dispute</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-50 text-[#E23744] border border-red-200 inline-flex items-center gap-1">
                  <span>Consumer App</span>
                  <ArrowRight className="w-2.5 h-2.5 inline" />
                  <span>Aegis Defense</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Multi-Scenario Switcher Bar */}
        <div className="hidden md:flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl border border-[#E5E7EB]">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider px-2">
            Scenario:
          </span>
          {DISPUTE_SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-white text-[#16171B] shadow-xs border border-[#E5E7EB]"
                    : "text-[#6B7280] hover:text-[#16171B] hover:bg-white/50"
                }`}
                title={sc.subtitle}
              >
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
                <span className="font-semibold">{sc.title}</span>
                <span className="font-mono text-[10px] text-[#5E6AD2]">({sc.amount})</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Mode Switcher when revealed */}
          {isConsoleRevealed && (
            <div className="hidden sm:flex items-center bg-[#F3F4F6] p-0.5 rounded-lg border border-[#E5E7EB]">
              <button
                onClick={() => setViewMode("story")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === "story"
                    ? "bg-white text-[#16171B] shadow-2xs"
                    : "text-[#6B7280] hover:text-[#16171B]"
                }`}
              >
                <Workflow className="w-3 h-3 text-[#5E6AD2]" />
                <span>Step-by-Step Story</span>
              </button>
              <button
                onClick={() => setViewMode("console")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === "console"
                    ? "bg-white text-[#16171B] shadow-2xs"
                    : "text-[#6B7280] hover:text-[#16171B]"
                }`}
              >
                <Terminal className="w-3 h-3 text-[#5E6AD2]" />
                <span>Raw Workbench</span>
              </button>
            </div>
          )}

          {isConsoleRevealed && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#16171B] border border-[#E5E7EB] font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replay Story</span>
            </button>
          )}

          <Link
            href="/console"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#4F5BC0] text-white font-medium shadow-xs transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Full Console</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </Link>
        </div>
      </header>

      {/* Main Stage: Continuous Fluid Macro-Animation Container */}
      <div className="relative flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col md:flex-row items-center">
        {/* ============================================================== */}
        {/* Left Column: Persistent Phone Mockup that physically slides left*/}
        {/* ============================================================== */}
        <div
          className={`flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 shrink-0 ${
            !isConsoleRevealed
              ? "w-full h-full p-4 justify-center"
              : "w-full md:w-[385px] lg:w-[415px] h-full border-b md:border-b-0 md:border-r border-[#E4E6EA] bg-[#EFF1F4]/80 p-3 justify-center shadow-md"
          }`}
        >
          {/* Centered Intro Header: Collapses smoothly when console is revealed */}
          <div
            className={`text-center space-y-1 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              !isConsoleRevealed
                ? "max-h-36 opacity-100 mb-3"
                : "max-h-0 opacity-0 mb-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 border border-red-200 text-[#E23744] text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs bg-[#E23744] text-white flex items-center justify-center font-black text-[9px]">
                  T
                </span>
                <span>Tomato Food Delivery</span>
              </span>
              <span>·</span>
              <span>Zomato Parody App</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#16171B]">
              "I ordered food, it failed, but I got charged."
            </h1>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-tight">
              Tap <strong className="text-[#0070BA]">Pay via PayPal</strong> on the phone to experience the payment deduction, order glitch, and dispute hand-off.
            </p>
          </div>

          {/* Docked Status Header (Visible only when revealed on left) */}
          <div
            className={`w-full max-w-[360px] pb-2 flex items-center justify-between text-xs overflow-hidden transition-all duration-500 ${
              isConsoleRevealed
                ? "max-h-10 opacity-100"
                : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-1.5 font-black text-[#E23744] text-xs">
              <span className="w-4 h-4 rounded-xs bg-[#E23744] text-white flex items-center justify-center font-black text-[10px]">
                T
              </span>
              <span>Customer Device View</span>
            </div>
            <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#E4E6EA] flex items-center gap-1">
              <span>Status:</span>
              <strong className={`flex items-center gap-1 ${
                refundCompleted
                  ? currentScenario.outcomeType === "blocked"
                    ? "text-rose-700"
                    : currentScenario.outcomeType === "escalated"
                    ? "text-purple-700"
                    : "text-emerald-700"
                  : "text-[#5E6AD2]"
              }`}>
                {refundCompleted ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      {currentScenario.outcomeType === "blocked"
                        ? "Blocked"
                        : currentScenario.outcomeType === "escalated"
                        ? "Escalated"
                        : "Refunded"}
                    </span>
                  </>
                ) : (
                  <span>Evaluating...</span>
                )}
              </strong>
            </div>
          </div>

          {/* Persistent Phone Mockup: NO internal scroll, 100% stable DOM instance */}
          <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center max-h-full flex items-center justify-center ${
              isConsoleRevealed
                ? "scale-[0.88] sm:scale-[0.92] lg:scale-[0.95]"
                : "scale-[0.88] sm:scale-[0.94] xl:scale-100 hover:scale-[1.01]"
            }`}
          >
            <TomatoAppMockup
              key={stepperSessionKey}
              onSendMessage={handleSendMessage}
              isConsoleRevealed={isConsoleRevealed}
              refundCompleted={refundCompleted}
              scenario={currentScenario}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* Feature 4: Cross-Panel Live Data Bridge Beam */}
        {isConsoleRevealed && (
          <div className="hidden lg:flex flex-col items-center justify-center absolute left-[385px] lg:left-[415px] top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            {/* Glowing Center Core */}
            <div className="bg-[#0B0D13] text-white px-2.5 py-1.5 rounded-full border border-[#F26522]/50 shadow-[0_0_20px_rgba(242,101,34,0.35)] flex items-center gap-1.5 font-mono text-[10px] tracking-tight">
              <span className="w-2 h-2 rounded-full bg-[#F26522] animate-ping" />
              <ShieldCheck className="w-3.5 h-3.5 text-[#F26522]" />
              <span className="font-bold uppercase tracking-wider text-[9px] text-[#F26522]">
                Swytchcode Wire
              </span>
            </div>

            {/* Directional Flow Laser Line */}
            <div className="relative w-16 h-6 flex items-center justify-center mt-1">
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-[#E23744] via-[#F26522] to-[#5E6AD2] animate-pulse" />
              <div className="text-[9px] font-mono text-white bg-black/90 px-1.5 py-0.5 rounded z-10 font-bold border border-white/10 shadow-sm">
                {refundCompleted ? "◀ Settlement" : "Intake ▶"}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Right Column: Step-by-Step Story Stepper OR Raw Workbench       */}
        {/* ============================================================== */}
        <div
          className={`h-full min-h-0 overflow-hidden flex flex-col bg-white transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isConsoleRevealed
              ? "flex-1 w-full opacity-100 translate-x-0"
              : "flex-none w-0 opacity-0 translate-x-32 pointer-events-none"
          }`}
        >
          {/* Only mount story stepper or raw workbench when console is revealed */}
          {isConsoleRevealed && (
            viewMode === "story" ? (
              <AegisLiveStoryStepper
                key={stepperSessionKey}
                isActive={isConsoleRevealed}
                promptText={activePrompt}
                scenario={currentScenario}
                onComplete={handleStepperComplete}
                onReset={handleReset}
                onOpenFullConsole={() => setViewMode("console")}
              />
            ) : (
              /* View Mode 2: Full Developer Workbench with Raw Payloads */
              <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
              <div className="bg-[#5E6AD2]/10 border-b border-[#5E6AD2]/20 px-4 py-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#5E6AD2] animate-pulse" />
                  <span className="font-bold text-[#16171B]">
                    Aegis Raw Technical Workbench
                  </span>
                  <span className="text-[#6B7280]">|</span>
                  <span className="text-[11px] text-[#4B5563] truncate max-w-md">
                    PayPal sandbox capture <strong className="font-mono text-[#5E6AD2]">TEST-SMALL</strong>
                  </span>
                </div>

                <button
                  onClick={() => setViewMode("story")}
                  className="text-[11px] text-[#5E6AD2] hover:text-[#4F5BC0] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Back to Step-by-Step Story</span>
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <ConsoleView
                  initialPrompt={activePrompt}
                  autoRunOnMount={true}
                  isEmbedded={true}
                  hideTopNav={true}
                  onExecutionComplete={(decision) => {
                    if (decision === "Refunded" || decision.toLowerCase().includes("refund")) {
                      setRefundCompleted(true);
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
