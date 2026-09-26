"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Terminal,
  Activity,
  Loader2,
  Inbox,
  Send,
  Sparkles,
  ChevronRight,
  Clock,
  User,
  FileText,
  CheckCheck,
  Ticket,
  ChevronDown,
  ChevronUp,
  Trash2,
  Maximize2,
  Minimize2,
  CornerDownRight,
  Circle,
} from "lucide-react";
import { PayPalLogo, SlackLogo, NotionLogo, getDecisionStyle } from "../components/ConsoleView";

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  snippet: string;
}

interface LiveStep {
  id: string;
  name: string;
  tool: string;
  status: string;
  timestamp: string;
  detail: string;
}

interface OutcomePayload {
  case_id?: string;
  decision?: string;
  final_reasoning?: string;
  amount?: number;
  steps?: LiveStep[];
}

interface TerminalLog {
  id: string;
  timestamp: string;
  level: "INFO" | "EXEC" | "SWY" | "AUTH" | "PASS" | "WARN" | "ERROR";
  tag: string;
  message: string;
}

export default function GmailLiveDemoPage() {
  const [profile, setProfile] = useState<{
    emailAddress: string;
    messagesTotal?: number;
    query?: string;
    status?: string;
  } | null>(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [unreadEmails, setUnreadEmails] = useState<EmailMessage[]>([]);
  const [processedResult, setProcessedResult] = useState<{
    email: EmailMessage;
    outcome: OutcomePayload;
    marked_read: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [lastScannedTime, setLastScannedTime] = useState<string | null>(null);
  const [serviceOnline, setServiceOnline] = useState<boolean | null>(null);

  // Terminal & CI logs state
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [terminalCopied, setTerminalCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<TerminalLog[]>(() => {
    const now = Date.now();
    const formatT = (offsetMs: number) =>
      new Date(now - offsetMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    return [
      {
        id: "log-init-1",
        timestamp: formatT(9000),
        level: "AUTH",
        tag: "OAUTH2",
        message: "Swytchcode CLI session loaded. Identity: saad.saad737@gmail.com",
      },
      {
        id: "log-init-2",
        timestamp: formatT(6000),
        level: "INFO",
        tag: "DAEMON",
        message: "Aegis Gmail Inbound listener initialized on localhost:5002",
      },
      {
        id: "log-init-3",
        timestamp: formatT(3000),
        level: "EXEC",
        tag: "FILTER",
        message: 'Active search query: is:unread subject:"AEGIS TEST"',
      },
    ];
  });

  const GMAIL_SERVICE_URL = "http://localhost:5002";

  const addLog = (level: TerminalLog["level"], tag: string, message: string) => {
    const newLog: TerminalLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      level,
      tag,
      message,
    };
    setLogs((prev) => [...prev.slice(-120), newLog]);
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && isTerminalOpen && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll, isTerminalOpen]);

  // Fetch connection profile
  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      addLog("INFO", "DAEMON", "Pinging Gmail intake daemon at localhost:5002...");
      const res = await fetch(`${GMAIL_SERVICE_URL}/profile`);
      const data = await res.json();
      if (res.ok && data.status !== "error") {
        setProfile(data);
        setServiceOnline(true);
        addLog(
          "PASS",
          "OAUTH2",
          `Connected: ${data.emailAddress} (unread query: ${data.query || 'is:unread subject:"AEGIS TEST"'})`
        );
      } else {
        setProfile(null);
        setServiceOnline(false);
        setErrorMsg(data.error || "Gmail service reported an error.");
        addLog("WARN", "DAEMON", `Profile check failed: ${data.error || "Service reported an error"}`);
      }
    } catch {
      setProfile(null);
      setServiceOnline(false);
      setErrorMsg("Can't reach the Gmail service at localhost:5002 - make sure gmail_service.py is running.");
      addLog("ERROR", "DAEMON", "Connection refused on localhost:5002. Is gmail_service.py running?");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Scan inbox for matching emails
  const scanInbox = async () => {
    try {
      setIsScanning(true);
      setErrorMsg(null);
      addLog("EXEC", "SWY-CLI", 'swy exec gmail.user.messages.get --filter "is:unread subject:\\"AEGIS TEST\\""');
      const res = await fetch(`${GMAIL_SERVICE_URL}/inbox`);
      if (!res.ok) throw new Error("Could not connect to Gmail service on port 5002");
      const data = await res.json();
      setUnreadEmails(data.emails || []);
      const scanTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastScannedTime(scanTime);

      if (data.emails && data.emails.length > 0) {
        addLog("PASS", "DISPATCH", `Found ${data.emails.length} unread complaint(s) matching filter.`);
        data.emails.forEach((m: EmailMessage) => {
          addLog("INFO", "MSG-ITEM", `ID ${m.id.slice(0, 12)}... | "${m.subject}"`);
        });
      } else {
        addLog("INFO", "INBOX", "Inbox clean. 0 matching unread emails found.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to scan inbox");
      addLog("ERROR", "SWY-CLI", `Scan failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Scan and immediately process via agent
  const scanAndProcess = async (isAutoScan = false) => {
    try {
      setIsScanning(true);
      setErrorMsg(null);
      setInfoMsg(null);

      if (!isAutoScan) {
        addLog("EXEC", "PIPELINE", "Triggering Swytchcode autonomous intake & resolve workflow...");
      }

      const res = await fetch(`${GMAIL_SERVICE_URL}/scan-and-process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dry_run: false }),
      });
      const data = await res.json();
      const scanTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastScannedTime(scanTime);

      if (data.found && data.email && data.outcome) {
        setProcessedResult({
          email: data.email,
          outcome: data.outcome,
          marked_read: data.marked_read,
        });
        setUnreadEmails((prev) => prev.filter((m) => m.id !== data.email.id));

        addLog("SWY", "GMAIL-INTAKE", `Captured message id: ${data.email.id} | "${data.email.subject}"`);

        // Stream outcome steps
        if (data.outcome.steps && Array.isArray(data.outcome.steps)) {
          data.outcome.steps.forEach((step: LiveStep) => {
            const isBlocked = step.status === "blocked";
            addLog(
              isBlocked ? "WARN" : "SWY",
              step.tool.toUpperCase(),
              `[${step.name}] ${step.detail}`
            );
          });
        }

        if (data.marked_read) {
          addLog("PASS", "MUTATION", "swy exec gmail.user.modify.create -> UNREAD label removed from live mailbox");
        }

        addLog(
          "PASS",
          "AEGIS-DECISION",
          `Autonomous decision: ${data.outcome.decision || "Approved"} (Case: ${data.outcome.case_id || "AEGIS-GMAIL-RESOLVED"})`
        );
      } else if (data.error) {
        setErrorMsg(data.error);
        addLog("ERROR", "PIPELINE", `Pipeline error: ${data.error}`);
      } else if (!isAutoScan) {
        setUnreadEmails([]);
        setInfoMsg(`No unread "AEGIS TEST" email found right now - send one, then try again.`);
        addLog("INFO", "SCAN", 'Query returned 0 unread messages for subject "AEGIS TEST".');
      } else {
        setUnreadEmails([]);
      }
    } catch (err: any) {
      const msg =
        err?.message === "Failed to fetch"
          ? "Can't reach the Gmail service at localhost:5002 - make sure gmail_service.py is running."
          : err.message || "Error during scan and process";
      setErrorMsg(msg);
      addLog("ERROR", "PIPELINE", `Error: ${msg}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Process a specific email clicked in list
  const processSpecificEmail = async (emailId: string) => {
    try {
      setIsScanning(true);
      setErrorMsg(null);
      setInfoMsg(null);
      addLog("EXEC", "RESOLVE", `Targeting specific message ID ${emailId} for resolution...`);

      const res = await fetch(`${GMAIL_SERVICE_URL}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: emailId, dry_run: false }),
      });
      const data = await res.json();
      if (data.status === "success" && data.email && data.outcome) {
        setProcessedResult({
          email: data.email,
          outcome: data.outcome,
          marked_read: data.marked_read,
        });
        setUnreadEmails((prev) => prev.filter((m) => m.id !== emailId));

        addLog("SWY", "GMAIL-INTAKE", `Processed message "${data.email.subject}"`);
        if (data.outcome.steps && Array.isArray(data.outcome.steps)) {
          data.outcome.steps.forEach((step: LiveStep) => {
            addLog("SWY", step.tool.toUpperCase(), `[${step.name}] ${step.detail}`);
          });
        }
        if (data.marked_read) {
          addLog("PASS", "MUTATION", "swy exec gmail.user.modify.create -> UNREAD label removed from live mailbox");
        }
        addLog("PASS", "DECISION", `Case ${data.outcome.case_id} resolved with ${data.outcome.decision}`);
      } else {
        setErrorMsg(data.error || "Aegis couldn't process that email.");
        addLog("ERROR", "RESOLVE", `Failed to process message: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      const msg =
        err?.message === "Failed to fetch"
          ? "Can't reach the Gmail service at localhost:5002 - make sure gmail_service.py is running."
          : err.message || "Failed to process message";
      setErrorMsg(msg);
      addLog("ERROR", "RESOLVE", `Error: ${msg}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto scan interval
  useEffect(() => {
    if (!autoScan) return;
    addLog("INFO", "AUTOPILOT", "Auto-scan polling daemon active (tick: 6000ms)");
    const interval = setInterval(() => {
      scanAndProcess(true);
    }, 6000);
    return () => {
      clearInterval(interval);
      addLog("INFO", "AUTOPILOT", "Auto-scan polling daemon suspended");
    };
  }, [autoScan]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    addLog("INFO", "CLIPBOARD", `Copied ${field.toUpperCase()} template to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyTerminalLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.padEnd(5)}] [${l.tag}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setTerminalCopied(true);
    setTimeout(() => setTerminalCopied(false), 2000);
  };

  const clearTerminalLogs = () => {
    setLogs([
      {
        id: `clear-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        level: "INFO",
        tag: "SYSTEM",
        message: "Terminal buffer cleared by user.",
      },
    ]);
  };

  const sampleSubject = "AEGIS TEST: Double charge ₹45.00 for order #8841 (Capture: TEST-SMALL)";
  const sampleBody =
    "Hi Support,\n\nI was charged twice (₹45.00) for my delivery order earlier today. Please check capture ID TEST-SMALL and process a refund to my account.\n\nThank you.";

  const getTagBadgeStyle = (level: TerminalLog["level"]) => {
    switch (level) {
      case "AUTH":
        return "bg-emerald-950/70 text-emerald-400 border-emerald-800/80";
      case "EXEC":
        return "bg-indigo-950/70 text-indigo-300 border-indigo-800/80";
      case "SWY":
        return "bg-amber-950/70 text-amber-300 border-amber-800/80";
      case "PASS":
        return "bg-emerald-950/70 text-emerald-300 border-emerald-800/80";
      case "WARN":
        return "bg-yellow-950/70 text-yellow-300 border-yellow-800/80";
      case "ERROR":
        return "bg-rose-950/70 text-rose-300 border-rose-800/80";
      case "INFO":
      default:
        return "bg-sky-950/70 text-sky-300 border-sky-800/80";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F2937] font-sans flex flex-col antialiased selection:bg-[#EA4335]/20 selection:text-[#B3261E]">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#111827] text-xs font-semibold transition-colors border border-[#E5E7EB]"
          >
            <span>Back to Demo</span>
          </Link>

          <div className="h-4 w-px bg-[#E5E7EB]" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EA4335] to-[#D93025] flex items-center justify-center text-white shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm text-[#111827] tracking-tight">
                  Gmail Live Inbound Support
                </h1>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    serviceOnline === null
                      ? "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]"
                      : serviceOnline
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {serviceOnline === null ? "Checking..." : serviceOnline ? "Connected" : "Service Offline"}
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Swytchcode Autonomous Intake & Verification
              </p>
            </div>
          </div>
        </div>

        {/* Account Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-xs">
            <div className={`w-2 h-2 rounded-full ${serviceOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span className="text-[#6B7280] text-[11px]">
              Active Mailbox:{" "}
              <strong className="text-[#111827] font-semibold font-mono">
                {profile?.emailAddress || "not connected"}
              </strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Email Instructions & Scanner (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: How to test live */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-rose-50 text-[#EA4335] flex items-center justify-center text-xs font-bold border border-rose-100">
                  1
                </div>
                <h2 className="font-bold text-sm text-[#111827]">
                  Send Email From Your Phone
                </h2>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] font-medium border border-[#E5E7EB]">
                Send From Any Mail App
              </span>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed">
              Open your email app on your phone and compose a message to this address. Swytchcode automatically filters for subject containing{" "}
              <code className="bg-[#F3F4F6] text-[#EA4335] font-mono px-1 py-0.5 rounded font-semibold text-[11px]">
                AEGIS TEST
              </code>{" "}
              so your personal mail is never read.
            </p>

            {/* Copyable Fields */}
            <div className="space-y-2 text-xs">
              {/* To */}
              <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-medium">
                    To
                  </span>
                  <button
                    onClick={() => copyToClipboard(profile?.emailAddress || "saad.saad737@gmail.com", "to")}
                    className="flex items-center gap-1 text-[10px] text-[#6B7280] hover:text-[#111827] font-medium transition-colors"
                  >
                    {copiedField === "to" ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === "to" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="font-mono text-[#111827] font-semibold text-xs select-all">
                  {profile?.emailAddress || "saad.saad737@gmail.com"}
                </div>
              </div>

              {/* Subject */}
              <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-medium">
                    Subject Line (Must Include AEGIS TEST)
                  </span>
                  <button
                    onClick={() => copyToClipboard(sampleSubject, "subject")}
                    className="flex items-center gap-1 text-[10px] text-[#6B7280] hover:text-[#111827] font-medium transition-colors"
                  >
                    {copiedField === "subject" ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === "subject" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="font-mono text-[#EA4335] font-semibold text-xs select-all">
                  {sampleSubject}
                </div>
              </div>

              {/* Body */}
              <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-medium">
                    Body
                  </span>
                  <button
                    onClick={() => copyToClipboard(sampleBody, "body")}
                    className="flex items-center gap-1 text-[10px] text-[#6B7280] hover:text-[#111827] font-medium transition-colors"
                  >
                    {copiedField === "body" ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === "body" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="text-[#4B5563] text-[11px] leading-relaxed select-all">
                  {sampleBody}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Scanner & Radar Actions */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-[#1D4ED8] flex items-center justify-center text-xs font-bold border border-blue-100">
                  2
                </div>
                <h3 className="font-bold text-sm text-[#111827]">
                  Scan & Process Inbound
                </h3>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#6B7280] select-none">
                <input
                  type="checkbox"
                  checked={autoScan}
                  onChange={(e) => setAutoScan(e.target.checked)}
                  className="rounded border-[#D1D5DB] text-[#EA4335] focus:ring-0"
                />
                <span>Auto-Scan</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={scanInbox}
                disabled={isScanning}
                className="py-3 px-3 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E5E7EB] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-[#EA4335]" : "text-[#6B7280]"}`} />
                <span>Check Inbox</span>
              </button>

              <button
                onClick={() => scanAndProcess(false)}
                disabled={isScanning}
                className="py-3 px-3 rounded-xl bg-[#EA4335] hover:bg-[#D93025] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(234,67,53,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5" />
                    <span>Scan & Resolve</span>
                  </>
                )}
              </button>
            </div>

            {lastScannedTime && (
              <div className="text-[11px] text-[#9CA3AF] text-center font-mono">
                Last checked at {lastScannedTime}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && !errorMsg && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
                <Inbox className="w-4 h-4 shrink-0 text-blue-500" />
                <span>{infoMsg}</span>
              </div>
            )}
          </div>

          {/* Pending Unread Emails List */}
          {unreadEmails.length > 0 && (
            <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <Inbox className="w-3.5 h-3.5 text-amber-700" />
                  <span>Found Unread Complaint ({unreadEmails.length})</span>
                </span>
                <span className="text-[10px] font-mono text-amber-700 font-semibold">
                  gmail.user.messages.get
                </span>
              </div>

              {unreadEmails.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[#111827] truncate">{msg.subject}</div>
                    <div className="text-[#6B7280] text-[11px] truncate mt-0.5">{msg.snippet}</div>
                  </div>
                  <button
                    onClick={() => processSpecificEmail(msg.id)}
                    disabled={isScanning}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Real-time Autonomous Resolution (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {processedResult ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-5 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6]">
                <div>
                  <div className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider mb-0.5">
                    Case Resolved Autonomous Pipeline
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#111827]">
                      {processedResult.outcome.case_id || "AEGIS-GMAIL-RESOLVED"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase border ${
                        getDecisionStyle(processedResult.outcome.decision || "Escalated").chip
                      }`}
                    >
                      {processedResult.outcome.decision || "Escalated"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real Mailbox Marked As Read</span>
                </div>
              </div>

              {/* Received Message Card */}
              <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span className="font-semibold text-[#374151]">Ingested Message</span>
                  <span className="font-mono text-[#EA4335] text-[10px]">
                    swy exec gmail.user.messages.get1
                  </span>
                </div>
                <div className="font-bold text-sm text-[#111827]">
                  {processedResult.email.subject}
                </div>
                <div className="text-xs text-[#4B5563] leading-relaxed">
                  {processedResult.email.snippet}
                </div>
                <div className="text-[10px] text-[#9CA3AF] pt-1">
                  From: {processedResult.email.from || "Customer"}
                </div>
              </div>

              {/* Agent Reasoning */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold">
                  Aegis Agent Decision & Reasoning
                </div>
                <div className="text-xs text-[#374151] bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] leading-relaxed">
                  {processedResult.outcome.final_reasoning ||
                    "Customer claim for duplicate deduction verified with PayPal sandbox capture. No anomaly detected by Leak Radar. Refund approved, Slack notification dispatched, and permanent record committed to Notion."}
                </div>
              </div>

              {/* Execution steps */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold">
                  Execution steps ({(processedResult.outcome.steps?.length || 0) + 1 + (processedResult.marked_read ? 1 : 0)})
                </div>

                <div className="space-y-2">
                  {/* Step 1: real Gmail fetch that started this case */}
                  <div className="p-3 rounded-xl border bg-white border-[#E4E6EA] shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 bg-emerald-100 text-emerald-800 font-bold">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </span>
                        <Mail className="w-3.5 h-3.5 text-[#EA4335] shrink-0" />
                        <span className="text-xs font-semibold text-[#16171B] truncate">Gmail Message Fetched</span>
                      </div>
                    </div>
                    <div className="mb-1 text-[10px] font-mono text-[#EA4335] bg-rose-50 px-2 py-0.5 rounded inline-block ml-7">
                      tool: gmail.user.messages.get1
                    </div>
                    <p className="text-[11px] text-[#4B5563] pl-7 font-mono leading-relaxed break-words">
                      "{processedResult.email.subject}"
                    </p>
                  </div>

                  {/* Steps 2..N: the real agent's own tool calls for this case */}
                  {(processedResult.outcome.steps || []).map((s, idx) => {
                    const Icon = s.tool.includes("slack")
                      ? SlackLogo
                      : s.tool.includes("notion")
                      ? NotionLogo
                      : s.tool.includes("jira")
                      ? Ticket
                      : s.tool.includes("paypal")
                      ? PayPalLogo
                      : Sparkles;
                    const failed = s.status === "blocked";
                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border shadow-xs ${
                          failed ? "bg-rose-50 border-rose-200" : "bg-white border-[#E4E6EA]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 font-bold ${
                                failed ? "bg-rose-200 text-rose-800" : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {failed ? idx + 2 : <Check className="w-3 h-3 stroke-[2.5]" />}
                            </span>
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-semibold text-[#16171B] truncate">{s.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#6B7280] shrink-0">{s.timestamp}</span>
                        </div>
                        <div className="mb-1 text-[10px] font-mono text-[#5E6AD2] bg-indigo-50/70 px-2 py-0.5 rounded inline-block ml-7">
                          tool: {s.tool}
                        </div>
                        <p className="text-[11px] text-[#4B5563] pl-7 font-mono leading-relaxed break-words">
                          {s.detail}
                        </p>
                      </div>
                    );
                  })}

                  {/* Final step: real mark-as-read */}
                  {processedResult.marked_read && (
                    <div className="p-3 rounded-xl border bg-white border-[#E4E6EA] shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 bg-emerald-100 text-emerald-800 font-bold">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </span>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-[#16171B]">Marked Email as Read</span>
                      </div>
                      <div className="mb-1 text-[10px] font-mono text-[#5E6AD2] bg-indigo-50/70 px-2 py-0.5 rounded inline-block ml-7">
                        tool: gmail.user.modify.create
                      </div>
                      <p className="text-[11px] text-[#4B5563] pl-7 font-mono leading-relaxed">
                        UNREAD label removed from the real mailbox.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation Banner */}
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  processedResult.marked_read
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${processedResult.marked_read ? "text-emerald-600" : "text-amber-600"}`}
                  />
                  <span>
                    {processedResult.marked_read
                      ? "The email in your Gmail app has been marked as read automatically."
                      : "Case resolved, but the email couldn't be marked as read (dry-run, or the Gmail call failed)."}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Standby State */
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-center space-y-4 flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#EA4335] flex items-center justify-center shadow-xs border border-rose-100">
                <Radio className="w-7 h-7 text-[#EA4335] animate-pulse" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="font-bold text-base text-[#111827]">
                  Listening for Inbound Support Emails
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Send an email to <strong className="text-[#111827] font-mono">{profile?.emailAddress || "saad.saad737@gmail.com"}</strong> with subject containing <code className="bg-rose-50 text-[#EA4335] font-mono px-1 py-0.5 rounded font-semibold text-[11px]">AEGIS TEST</code>.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => scanAndProcess(false)}
                  disabled={isScanning}
                  className="py-2.5 px-5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] border border-[#D1D5DB] font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-[#EA4335]" : "text-[#6B7280]"}`} />
                  <span>Scan Mailbox Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Full-width Collapsible Working CI Terminal Logs */}
        <div className="col-span-1 lg:col-span-12 w-full mt-2">
          <div className="rounded-2xl overflow-hidden border border-[#1F2937] bg-[#0A0D14] shadow-2xl shadow-black/15 transition-all">
            {/* Terminal Window Header Bar */}
            <div className="bg-[#111827] px-4 py-3 flex items-center justify-between border-b border-[#1F2937] select-none">
              {/* Left: Window Controls & Title */}
              <div className="flex items-center gap-3">
                {/* macOS Window Dots */}
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444] opacity-80 hover:opacity-100 transition-opacity" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B] opacity-80 hover:opacity-100 transition-opacity" />
                  <div className="w-3 h-3 rounded-full bg-[#10B981] opacity-80 hover:opacity-100 transition-opacity" />
                </div>

                <div className="h-4 w-px bg-[#374151]" />

                {/* Terminal Title */}
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-[#F3F4F6]">
                    aegis@runner: ~/gmail-live-ci
                  </span>
                </div>

                {/* Live Daemon Status Badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F2937] border border-[#374151] text-[10px] font-mono text-[#9CA3AF]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isScanning
                        ? "bg-amber-400 animate-ping"
                        : autoScan
                        ? "bg-indigo-400 animate-pulse"
                        : serviceOnline
                        ? "bg-emerald-400"
                        : "bg-rose-400"
                    }`}
                  />
                  <span className="font-semibold text-[#E5E7EB]">
                    {isScanning
                      ? "PROCESSING"
                      : autoScan
                      ? "AUTOPILOT POLLING"
                      : serviceOnline
                      ? "LISTENER ACTIVE"
                      : "OFFLINE"}
                  </span>
                </div>
              </div>

              {/* Center / Collapsed Quick Preview */}
              {!isTerminalOpen && logs.length > 0 && (
                <div
                  onClick={() => setIsTerminalOpen(true)}
                  className="hidden md:flex items-center gap-2 text-xs font-mono text-[#9CA3AF] cursor-pointer hover:text-white transition-colors truncate max-w-md"
                >
                  <span className="text-[10px] text-[#64748B]">
                    [{logs[logs.length - 1].timestamp}]
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getTagBadgeStyle(
                      logs[logs.length - 1].level
                    )}`}
                  >
                    {logs[logs.length - 1].tag}
                  </span>
                  <span className="truncate text-[11px] text-[#CBD5E1]">
                    {logs[logs.length - 1].message}
                  </span>
                </div>
              )}

              {/* Right: Actions & Collapse Toggle */}
              <div className="flex items-center gap-2">
                {/* Event Count */}
                <span className="text-[11px] font-mono text-[#64748B] bg-[#1F2937]/60 px-2 py-0.5 rounded border border-[#374151]/50">
                  {logs.length} logs
                </span>

                {/* Copy logs */}
                <button
                  onClick={copyTerminalLogs}
                  title="Copy terminal logs"
                  className="p-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-white transition-colors border border-[#374151] flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                >
                  {terminalCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>

                {/* Clear logs */}
                <button
                  onClick={clearTerminalLogs}
                  title="Clear terminal buffer"
                  className="p-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-rose-400 transition-colors border border-[#374151] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Collapse / Expand Toggle */}
                <button
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] hover:text-white text-xs font-semibold transition-colors border border-[#374151] cursor-pointer"
                >
                  {isTerminalOpen ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] font-mono">Collapse</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] font-mono">Expand</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Terminal Log Stream Area */}
            {isTerminalOpen && (
              <div className="p-4 bg-[#0A0D14] font-mono text-xs leading-relaxed max-h-72 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {logs.length === 0 ? (
                  <div className="text-[#64748B] py-6 text-center italic">
                    Terminal buffer empty. Inbound events and tool executions will appear here.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 hover:bg-[#111827]/40 py-0.5 px-1.5 rounded transition-colors group"
                    >
                      {/* Timestamp */}
                      <span className="text-[#64748B] text-[11px] select-none shrink-0 pt-0.5">
                        [{log.timestamp}]
                      </span>

                      {/* Level / Tag badge */}
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold tracking-wide shrink-0 border ${getTagBadgeStyle(
                          log.level
                        )}`}
                      >
                        {log.tag}
                      </span>

                      {/* Log text */}
                      <span className="text-[#E2E8F0] break-all group-hover:text-white transition-colors">
                        {log.message}
                      </span>
                    </div>
                  ))
                )}

                {/* Live cursor prompt */}
                <div className="flex items-center gap-2 pt-2 text-[#64748B] text-xs">
                  <span className="text-emerald-400 font-bold">$</span>
                  <span>
                    {isScanning
                      ? "Executing Swytchcode tool chain..."
                      : autoScan
                      ? "Aegis daemon active (auto-polling)..."
                      : "Aegis listener awaiting inbound webhook or scan trigger..."}
                  </span>
                  <span className="w-2 h-4 bg-emerald-400 inline-block animate-pulse" />
                </div>

                <div ref={terminalEndRef} />
              </div>
            )}

            {/* Bottom Mini Status Bar when Open */}
            {isTerminalOpen && (
              <div className="bg-[#0D111A] px-4 py-2 border-t border-[#1F2937] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>stdout / stderr</span>
                  </span>
                  <span>CLI: Swytchcode v0.1.0</span>
                  <span>Account: saad.saad737@gmail.com</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#9CA3AF] select-none">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="rounded border-[#374151] bg-[#1F2937] text-emerald-500 focus:ring-0 w-3 h-3"
                    />
                    <span>Auto-scroll</span>
                  </label>
                  <span className="text-[#475569]">UTF-8</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
