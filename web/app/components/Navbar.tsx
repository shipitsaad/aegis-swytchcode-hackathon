"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Terminal,
  Zap,
  Layers,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Play,
  Mail,
  ShieldCheck,
  Database,
  Compass,
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.05] bg-[#050506]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        {/* Brand: Compact & Crisp */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.05] border border-white/10 shadow-[0_0_8px_rgba(94,106,210,0.2)] group-hover:border-[#5E6AD2]/50 transition-colors">
            <Shield className="w-3 h-3 text-[#818cf8]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-tight text-[#EDEDEF]">
              Aegis
            </span>
            <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.2 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8A8F98]">
              Track 6
            </span>
          </div>
        </Link>

        {/* Center Nav Links: Compact text, smaller icons, tight spacing */}
        <div className="hidden md:flex items-center gap-0.5 text-[11px] text-[#8A8F98]">
          <Link
            href="/showcase"
            className="px-2 py-1 rounded-md text-[#EDEDEF] hover:text-white hover:bg-white/[0.05] transition-all flex items-center gap-1 font-medium"
          >
            <Compass className="w-2.5 h-2.5 text-emerald-400" />
            <span>Demo Hub</span>
          </Link>
          <Link
            href="/demo"
            className="px-2 py-1 rounded-md text-[#EDEDEF] hover:text-white hover:bg-white/[0.05] transition-all flex items-center gap-1 font-medium"
          >
            <Play className="w-2.5 h-2.5 text-[#5E6AD2] fill-[#5E6AD2]/40" />
            <span>Live Demo</span>
          </Link>
          <Link
            href="/console"
            className="px-2 py-1 rounded-md text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] transition-all flex items-center gap-1 font-medium"
          >
            <Terminal className="w-2.5 h-2.5 text-[#8A8F98]" />
            <span>Console</span>
          </Link>
          <Link
            href="/copilot"
            className="px-2 py-1 rounded-md text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] transition-all flex items-center gap-1 font-medium"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#818cf8]" />
            <span>Copilot</span>
          </Link>
          <Link
            href="/gmail"
            className="px-2 py-1 rounded-md text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] transition-all flex items-center gap-1 font-medium"
          >
            <Mail className="w-2.5 h-2.5 text-rose-400" />
            <span>Gmail</span>
          </Link>
          <Link
            href="/database"
            className="px-2 py-1 rounded-md text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] transition-all flex items-center gap-1 font-medium"
          >
            <Database className="w-2.5 h-2.5 text-emerald-400" />
            <span>Test DB</span>
          </Link>

          <div className="h-3 w-px bg-white/10 mx-1" />

          <button
            onClick={() => scrollTo("guardrails")}
            className="px-2 py-1 rounded-md text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] transition-all cursor-pointer font-medium"
          >
            Guardrails
          </button>
          <button
            onClick={() => scrollTo("leak-radar")}
            className="px-2 py-1 rounded-md text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] transition-all cursor-pointer font-medium flex items-center gap-1"
          >
            <Zap className="w-2.5 h-2.5 text-[#818cf8]" />
            <span>Leak Radar</span>
          </button>
          <button
            onClick={() => scrollTo("architecture")}
            className="px-2 py-1 rounded-md text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] transition-all cursor-pointer font-medium flex items-center gap-1"
          >
            <Layers className="w-2.5 h-2.5 text-[#8A8F98]" />
            <span>Architecture</span>
          </button>
        </div>

        {/* Right CTA: Subtle status pill & compact button */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-[#8A8F98]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Swytchcode Live</span>
          </div>

          <Link
            href="/demo"
            className="px-2.5 py-1 rounded-md bg-[#5E6AD2] hover:bg-[#6872D9] active:scale-[0.98] text-white text-[11px] font-medium tracking-tight cursor-pointer flex items-center gap-1 shadow-[0_0_12px_rgba(94,106,210,0.3)] transition-all"
          >
            <span>Launch Demo</span>
            <ArrowRight className="w-2.5 h-2.5 text-white/70" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/[0.05]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.06] bg-[#050506]/98 backdrop-blur-xl px-4 py-3 space-y-2 text-[11px] text-[#8A8F98]">
          <div className="text-[9px] font-mono uppercase tracking-wider text-[#6B7280]">
            Interactive Apps
          </div>
          <div className="space-y-0.5">
            <Link
              href="/showcase"
              className="w-full py-1.5 px-2.5 rounded-md text-[#EDEDEF] hover:bg-white/[0.05] font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>Demo Hub</span>
            </Link>
            <Link
              href="/demo"
              className="w-full py-1.5 px-2.5 rounded-md text-[#EDEDEF] hover:bg-white/[0.05] font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Play className="w-3 h-3 text-[#5E6AD2]" />
              <span>Live Story Demo</span>
            </Link>
            <Link
              href="/console"
              className="w-full py-1.5 px-2.5 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/[0.05] font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Terminal className="w-3 h-3" />
              <span>Operations Console</span>
            </Link>
            <Link
              href="/copilot"
              className="w-full py-1.5 px-2.5 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/[0.05] font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="w-3 h-3 text-[#818cf8]" />
              <span>Copilot Chat</span>
            </Link>
            <Link
              href="/gmail"
              className="w-full py-1.5 px-2.5 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/[0.05] font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Mail className="w-3 h-3 text-rose-400" />
              <span>Gmail Intake</span>
            </Link>
            <Link
              href="/database"
              className="w-full py-1.5 px-2.5 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/[0.05] font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Test Order Database</span>
            </Link>
          </div>

          <div className="h-px bg-white/[0.06] my-1.5" />

          <div className="text-[9px] font-mono uppercase tracking-wider text-[#6B7280]">
            Sections
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => scrollTo("guardrails")}
              className="w-full text-left py-1.5 px-2.5 rounded-md hover:text-white hover:bg-white/[0.05] flex items-center gap-2"
            >
              <ShieldCheck className="w-3 h-3 text-[#8A8F98]" />
              <span>Guardrails</span>
            </button>
            <button
              onClick={() => scrollTo("leak-radar")}
              className="w-full text-left py-1.5 px-2.5 rounded-md hover:text-white hover:bg-white/[0.05] flex items-center gap-2"
            >
              <Zap className="w-3 h-3 text-[#818cf8]" />
              <span>Leak Radar</span>
            </button>
            <button
              onClick={() => scrollTo("architecture")}
              className="w-full text-left py-1.5 px-2.5 rounded-md hover:text-white hover:bg-white/[0.05] flex items-center gap-2"
            >
              <Layers className="w-3 h-3 text-[#8A8F98]" />
              <span>Architecture</span>
            </button>
          </div>

          <div className="pt-1.5">
            <Link
              href="/demo"
              className="w-full py-2 px-3 rounded-lg bg-[#5E6AD2] hover:bg-[#6872D9] text-[11px] font-medium text-white text-center flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(94,106,210,0.3)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Launch Demo</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
