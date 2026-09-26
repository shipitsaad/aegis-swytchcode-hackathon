"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Terminal,
  Sparkles,
  Mail,
  Database,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Layers,
  ExternalLink,
  ShieldAlert,
  Clock,
  Compass,
  FileCheck,
  Check,
  Sun,
  Moon,
  Copy,
  ClipboardList,
} from "lucide-react";

type Category = "all" | "flagship" | "guardrails" | "receipts";

type Step = {
  n: number;
  route: string;
  category: "flagship" | "guardrails" | "receipts";
  label: string;
  badge: string;
  badgeColor: string;
  iconBg: string;
  icon: React.ReactNode;
  what: string;
  how: string[];
  prompts?: string[];
  expect: string;
  tokenCost: string;
};

function CopyBox({ text, isDark }: { text: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable - fine, text is still selectable/visible
    }
  };
  return (
    <div
      className={`flex items-start gap-2 p-2.5 rounded-lg border font-mono text-[11px] leading-relaxed ${
        isDark
          ? "bg-[#0B0D13] border-[#232738] text-[#C0CAD8]"
          : "bg-[#F9FAFB] border-[#E5E7EB] text-[#374151]"
      }`}
    >
      <span className="flex-1 whitespace-pre-wrap">{text}</span>
      <button
        onClick={onCopy}
        className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
          copied
            ? "bg-emerald-500 text-white"
            : isDark
            ? "bg-[#232738] text-[#9AA5B8] hover:text-white"
            : "bg-[#E5E7EB] text-[#4B5563] hover:text-[#111827]"
        }`}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

const STEPS: Step[] = [
  {
    n: 1,
    route: "/",
    category: "flagship",
    label: "Landing Page & System Architecture",
    badge: "Pitch & Positioning",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconBg: "bg-indigo-100 text-[#5E6AD2]",
    icon: <ShieldCheck className="w-6 h-6" />,
    what: "30 seconds of high-level positioning before touching live tools: Aegis is the autonomous verification and financial decision layer for customer complaints from any channel.",
    how: [
      "Scroll past Hero into the interactive guardrails visualization.",
      "Review the Swytchcode multi-tool execution architecture diagram.",
      "Demonstrate why Aegis is a judgment layer, not a simple refund bot.",
    ],
    expect: "Establishes why the autonomous actions matter before executing live calls.",
    tokenCost: "0 Tokens",
  },
  {
    n: 2,
    route: "/copilot",
    category: "flagship",
    label: "Human-in-the-Loop Co-pilot Approval",
    badge: "Flagship Co-pilot",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100 text-purple-600",
    icon: <Sparkles className="w-6 h-6" />,
    what: "Support agent assisted workflow. The agent drafts an autonomous decision with exact tool parameters, holding payout execution until a human clicks Approve or Reject.",
    how: [
      "Select 'Support agent (co-pilot)' toggle.",
      "Paste the exact text below -> View drafted refund.",
      "Click 'Approve' -> Real Swytchcode PayPal refund, Slack alert, and Notion ledger fire live.",
    ],
    prompts: [
      "Customer says: my order was cancelled before it shipped but I was still charged, capture TEST-SMALL. Email: priya.demo@example.com",
    ],
    expect: "Refund approved (small, verified) — draft generated, then real mutation on approval.",
    tokenCost: "1 LLM Call",
  },
  {
    n: 3,
    route: "/copilot",
    category: "flagship",
    label: "Customer View: Autonomous Escalation",
    badge: "Autonomous Defense",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100 text-blue-600",
    icon: <ShieldAlert className="w-6 h-6" />,
    what: "Flip the toggle to 'Customer (autonomous)'. Same underlying LangGraph agent, but no human checkpoint: immediate resolution with internal reasoning separated from user summary.",
    how: [
      "Select 'Customer (autonomous)' perspective.",
      "Paste the exact text below.",
      "Observe that Aegis refuses to blindly auto-refund large amounts without senior review.",
    ],
    prompts: [
      "Someone used my card without permission, capture TEST-LARGE, I need my ₹350 back.",
    ],
    expect: "Escalated: High-value charge safely halted and routed to human queue.",
    tokenCost: "1 LLM Call",
  },
  {
    n: 4,
    route: "/copilot",
    category: "guardrails",
    label: "Leak Radar: Velocity & Cluster Attack",
    badge: "Cross-Case Memory",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100 text-amber-600",
    icon: <Zap className="w-6 h-6" />,
    what: "Runs identical ₹45.00 complaints in rapid succession to prove cross-case memory. Proves Aegis is an intelligent agent with working memory, not a static if/else rule.",
    how: [
      "Paste the exact text below 3 times in a row, no changes.",
      "1st run -> Denied.",
      "2nd run -> Denied.",
      "3rd run -> PATTERN ALERT triggered: Leak Radar flags cluster attack and escalates instead.",
    ],
    prompts: [
      "Customer says: my order was cancelled before it shipped but I was still charged, capture TEST-SMALL. Email: leak-test@example.com",
    ],
    expect: "Same input produces 3 different intelligent outcomes based on evolving context.",
    tokenCost: "1 LLM Call",
  },
  {
    n: 5,
    route: "/copilot",
    category: "guardrails",
    label: "Repeat Customer Pattern & Jira Bug Filing",
    badge: "Jira Integration",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-100 text-rose-600",
    icon: <AlertTriangle className="w-6 h-6" />,
    what: "Detects repeat claim patterns from the same customer identity across different amounts, and automatically creates a real Jira investigation issue via Swytchcode.",
    how: [
      "Paste all 3 texts below, in order, same customer email, varying amounts.",
      "3rd claim triggers the customer abuse pattern.",
      "Swytchcode calls jira.issue.create live to open a tracked engineering/analyst ticket.",
    ],
    prompts: [
      "Customer says: my order was cancelled before it shipped but I was still charged, capture TEST-SMALL. Email: priya.demo@example.com",
      "Step 2 (same customer) - Customer says: card was compromised, capture TEST-LARGE, wants the ₹350 back. Email: priya.demo@example.com",
      "Step 3 (same customer again) - Customer says: charged again, capture TEST-SMALL, please refund. Email: priya.demo@example.com",
    ],
    expect: "Files real Jira issue (e.g. SCRUM-9, SCRUM-10) with complete case audit context.",
    tokenCost: "1 LLM Call",
  },
  {
    n: 6,
    route: "/demo",
    category: "flagship",
    label: "Tomato Mobile App & Story Stepper",
    badge: "Interactive Pitch",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    iconBg: "bg-red-100 text-[#E23744]",
    icon: <Play className="w-6 h-6 fill-current" />,
    what: "The flagship visual demo. An interactive food delivery app with native iOS Dynamic Island, order glitch hand-off, and cross-panel animated data bridge.",
    how: [
      "Select scenario: Normal (₹45), Bot Attack (₹45), or High Value (₹2.5k).",
      "Tap 'Pay via PayPal' inside phone -> Observe simulated capture.",
      "Tap 'Contact Support' -> Watch live story stepper reveal Swytchcode tools in real time.",
    ],
    expect: "Stunning visual walk-through illustrating end-to-end user and agent journey.",
    tokenCost: "Zero LLM in visual demo",
  },
  {
    n: 7,
    route: "/console",
    category: "guardrails",
    label: "PayPal Disputes Resolution Branch",
    badge: "Dispute Branch",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    iconBg: "bg-sky-100 text-[#0070BA]",
    icon: <ShieldCheck className="w-6 h-6" />,
    what: "Formal dispute arbitration branch. When customers escalate directly through PayPal instead of an email, Aegis switches to its dispute resolution policy.",
    how: [
      "Paste each text below separately (3 distinct dispute scenarios).",
      "PP-D-TEST-SMALL (ITEM_NOT_RECEIVED, ₹60) -> Full dispute accepted.",
      "PP-D-TEST-MEDIUM (Not as described, ₹120) -> Partial settlement offered.",
      "PP-D-TEST-LARGE (UNAUTHORIZED, ₹500) -> Flagged for senior security analyst.",
    ],
    prompts: [
      "A customer has filed a formal PayPal dispute, ID PP-D-TEST-SMALL, reason ITEM_NOT_RECEIVED, amount $60.",
      "A customer has filed a formal PayPal dispute, ID PP-D-TEST-MEDIUM, reason MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED, amount $120.",
      "A customer has filed a formal PayPal dispute, ID PP-D-TEST-LARGE, reason UNAUTHORIZED, amount $500.",
    ],
    expect: "3 distinct, intelligent branches demonstrating multi-situation reasoning.",
    tokenCost: "1 LLM Call",
  },
  {
    n: 8,
    route: "/gmail",
    category: "flagship",
    label: "Live Inbound Gmail Mailbox Intake",
    badge: "Live Swytchcode Hook",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-600",
    icon: <Mail className="w-6 h-6" />,
    what: "Real-world inbound email scanner. Connected live to saad.saad737@gmail.com via Swytchcode. Scans for real unread test emails and marks them read in your inbox.",
    how: [
      "Send an email from your phone with subject containing 'AEGIS TEST'.",
      "Click 'Scan & Resolve' on /gmail (runs on Port 5002).",
      "Aegis pulls the real email, resolves it, and marks it read in your actual Gmail app.",
    ],
    expect: "Extracts real sender/subject via gmail.user.messages.get1 and executes resolution.",
    tokenCost: "1 LLM Call",
  },
  {
    n: 9,
    route: "/database",
    category: "receipts",
    label: "Test Order Database: The Receipts",
    badge: "100% Free / Safe Filler",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-600",
    icon: <Database className="w-6 h-6" />,
    what: "Inspectable database view showing the verified orders, tracking records, and captures that Aegis reads live during disputes. Zero LLM cost.",
    how: [
      "Open /database to show judges the underlying verifiable data.",
      "Shows order statuses (Delivered, In Transit, Refunded) and PayPal capture mappings.",
      "Completely safe to display when Groq quota is tight.",
    ],
    expect: "Proof that test captures (ORD-88041, TEST-SMALL) are backed by structured records.",
    tokenCost: "0 Tokens (Always Safe)",
  },
  {
    n: 10,
    route: "/console",
    category: "receipts",
    label: "Operations Console & Audit Trail",
    badge: "CLI Guardrails",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
    iconBg: "bg-slate-100 text-slate-700",
    icon: <Terminal className="w-6 h-6" />,
    what: "The developer inspection panel. Displays Swytchcode's authentic network audit trail (~/.swytchcode/audit/) with timestamps, HTTP status codes, and latency.",
    how: [
      "Toggle dry-run mode to demonstrate guarded execution.",
      "Switch to Audit Trail tab to view real swy audit network log entries.",
      "Show mentors proof of authentic Swytchcode CLI calls under the hood.",
    ],
    expect: "Proves guardrails are enforced by Swytchcode's CLI binary, not mock scripts.",
    tokenCost: "0 Tokens in Audit View",
  },
];

export default function ShowcasePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [isDark, setIsDark] = useState(false);

  const filteredSteps =
    selectedCategory === "all"
      ? STEPS
      : STEPS.filter((s) => s.category === selectedCategory);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark
          ? "bg-[#090A0F] text-[#ECEFF4] selection:bg-[#5E6AD2]/30 selection:text-white"
          : "bg-[#F8F9FA] text-[#1F2937] selection:bg-[#5E6AD2]/20 selection:text-[#5E6AD2]"
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md transition-colors ${
          isDark
            ? "border-[#212433] bg-[#0E1017]/90"
            : "border-[#E5E7EB] bg-white/95 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isDark
                ? "bg-[#181B26] hover:bg-[#232738] text-[#9AA5B8] hover:text-white border-[#2A3045]"
                : "bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#111827] border-[#E5E7EB]"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </Link>
          <div
            className={`h-4 w-px ${isDark ? "bg-[#252A3C]" : "bg-[#E5E7EB]"}`}
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight">
              Aegis Demonstration Showcase
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                isDark
                  ? "bg-[#181B26] text-[#8C9BB4] border-[#2B3145]"
                  : "bg-indigo-50 text-[#5E6AD2] border-indigo-200"
              }`}
            >
              Jury & Mentor Guide
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? "bg-[#181B26] text-amber-300 border-[#2A3045] hover:bg-[#232738]"
                : "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]"
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{isDark ? "Light View" : "Dark View"}</span>
          </button>

          <Link
            href="/demo"
            className="px-3.5 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-xs font-semibold shadow-[0_2px_10px_rgba(94,106,210,0.35)] transition-all flex items-center gap-1.5"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Hero Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>10 Verified Interactive Demo Steps</span>
          </div>
          <h1
            className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isDark ? "text-white" : "text-[#111827]"
            }`}
          >
            Step-by-Step Pitch Showcase
          </h1>
          <p
            className={`text-sm max-w-2xl leading-relaxed ${
              isDark ? "text-[#8C9BB4]" : "text-[#6B7280]"
            }`}
          >
            Every step below represents an authentic Swytchcode tool execution. Use this master guide to jump directly to any demo surface, understand the exact click sequence, and demonstrate verified financial guardrails.
          </p>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-[#141620] border-[#232738]"
                : "bg-white border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold mb-1">
              Interactive Surfaces
            </div>
            <div className="text-2xl font-black text-[#5E6AD2]">10 Stages</div>
            <div className="text-[11px] text-[#9CA3AF] mt-0.5">
              Zero mock scripts
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-[#141620] border-[#232738]"
                : "bg-white border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold mb-1">
              Swytchcode APIs
            </div>
            <div className="text-2xl font-black text-emerald-600">5 of 5 Live</div>
            <div className="text-[11px] text-[#9CA3AF] mt-0.5">
              PayPal, Gmail, Slack, Notion, Jira
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-[#141620] border-[#232738]"
                : "bg-white border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold mb-1">
              Safety Boundaries
            </div>
            <div className="text-2xl font-black text-purple-600">
              ₹45 — ₹2,500
            </div>
            <div className="text-[11px] text-[#9CA3AF] mt-0.5">
              Autonomous threshold
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-[#141620] border-[#232738]"
                : "bg-white border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold mb-1">
              Enforcement Mode
            </div>
            <div className="text-2xl font-black text-amber-600">CLI & Policy</div>
            <div className="text-[11px] text-[#9CA3AF] mt-0.5">
              Dry-run + audit log
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-b pb-4 border-[#E5E7EB]/70">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#5E6AD2] text-white shadow-sm"
                : isDark
                ? "bg-[#141620] text-[#8C9BB4] hover:text-white border border-[#232738]"
                : "bg-white text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB]"
            }`}
          >
            All Steps ({STEPS.length})
          </button>
          <button
            onClick={() => setSelectedCategory("flagship")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "flagship"
                ? "bg-[#5E6AD2] text-white shadow-sm"
                : isDark
                ? "bg-[#141620] text-[#8C9BB4] hover:text-white border border-[#232738]"
                : "bg-white text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB]"
            }`}
          >
            Flagship Surfaces (4)
          </button>
          <button
            onClick={() => setSelectedCategory("guardrails")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "guardrails"
                ? "bg-[#5E6AD2] text-white shadow-sm"
                : isDark
                ? "bg-[#141620] text-[#8C9BB4] hover:text-white border border-[#232738]"
                : "bg-white text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB]"
            }`}
          >
            Guardrails & Radar (3)
          </button>
          <button
            onClick={() => setSelectedCategory("receipts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "receipts"
                ? "bg-[#5E6AD2] text-white shadow-sm"
                : isDark
                ? "bg-[#141620] text-[#8C9BB4] hover:text-white border border-[#232738]"
                : "bg-white text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB]"
            }`}
          >
            Inspect Receipts & Audit (3)
          </button>
        </div>

        {/* Steps List: Large, Modern, Card-Based */}
        <div className="space-y-6">
          {filteredSteps.map((s) => (
            <div
              key={s.n}
              className={`rounded-2xl border p-6 sm:p-7 transition-all duration-200 ${
                isDark
                  ? "bg-[#141620] border-[#252A3C] hover:border-[#38405C]"
                  : "bg-white border-[#E5E7EB] hover:border-[#CBD5E1] shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Left: Icon, Number, Title & Overview */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Step Number + Icon Badge */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs border ${s.iconBg} ${
                        isDark ? "border-white/10" : "border-black/5"
                      }`}
                    >
                      {s.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-[#8C9BB4]">
                      Step {s.n < 10 ? `0${s.n}` : s.n}
                    </span>
                  </div>

                  {/* Title & What */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={`text-lg font-bold tracking-tight ${
                          isDark ? "text-white" : "text-[#111827]"
                        }`}
                      >
                        {s.label}
                      </h2>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${s.badgeColor}`}
                      >
                        {s.badge}
                      </span>
                    </div>

                    <p
                      className={`text-xs sm:text-[13px] leading-relaxed max-w-xl ${
                        isDark ? "text-[#9AA5B8]" : "text-[#4B5563]"
                      }`}
                    >
                      {s.what}
                    </p>
                  </div>
                </div>

                {/* Right: Quick Launch Button */}
                <div className="shrink-0 flex items-center gap-2 self-start lg:self-center">
                  <span
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border ${
                      isDark
                        ? "bg-[#1C202E] text-[#8C9BB4] border-[#2A3147]"
                        : "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]"
                    }`}
                  >
                    Route: <strong className="font-semibold">{s.route}</strong>
                  </span>

                  <Link
                    href={s.route.split(" ")[0]}
                    className="px-4 py-2 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] active:scale-[0.98] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(94,106,210,0.3)] transition-all cursor-pointer"
                  >
                    <span>Open Surface</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Lower Section: How to Demo & Expected Outcome */}
              <div
                className={`mt-6 pt-5 border-t grid grid-cols-1 md:grid-cols-12 gap-5 ${
                  isDark ? "border-[#212536]" : "border-[#F1F3F5]"
                }`}
              >
                {/* How to Demo */}
                <div className="md:col-span-7 space-y-2">
                  {s.prompts && (
                    <div className="space-y-1.5 mb-3">
                      <div className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-[#5E6AD2]" />
                        <span>Exact text to paste{s.prompts.length > 1 ? " (in order)" : ""}</span>
                      </div>
                      {s.prompts.map((p, idx) => (
                        <CopyBox key={idx} text={p} isDark={isDark} />
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#5E6AD2]" />
                    <span>How to Demonstrate Live</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {s.how.map((instruction, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg flex items-start gap-2 ${
                          isDark
                            ? "bg-[#181B26] text-[#C0CAD8]"
                            : "bg-[#F9FAFB] text-[#374151] border border-[#E5E7EB]/80"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-[#5E6AD2]/10 text-[#5E6AD2] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Outcome */}
                <div className="md:col-span-5 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono uppercase text-emerald-600 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Expected Outcome</span>
                    </div>
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        isDark
                          ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
                          : "bg-emerald-50/70 border-emerald-200 text-emerald-800 font-medium"
                      }`}
                    >
                      {s.expect}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#9CA3AF] flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Cost: {s.tokenCost}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Honest Guardrail Note */}
        <div
          className={`p-6 rounded-2xl border flex items-start gap-3.5 ${
            isDark
              ? "bg-[#141620] border-[#252A3C]"
              : "bg-white border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#5E6AD2] flex items-center justify-center shrink-0 border border-blue-100">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <h4
              className={`font-bold ${isDark ? "text-white" : "text-[#111827]"}`}
            >
              Auditor Note: Real Swytchcode Execution
            </h4>
            <p className={`${isDark ? "text-[#9AA5B8]" : "text-[#6B7280]"} leading-relaxed`}>
              Every action in this showcase connects to genuine Swytchcode APIs (PayPal Sandbox, Gmail, Slack, Notion, Jira). Idempotency (the 3rd classic financial guardrail alongside dry-run and network audit logging) is recorded as a planned roadmap item; dry-run and audit logging are fully implemented.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
