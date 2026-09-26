"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Terminal, Zap, Layers, Menu, X, ArrowRight, Sparkles } from "lucide-react";

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
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#050506]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 shadow-[0_0_12px_rgba(94,106,210,0.25)]">
            <Shield className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-[#EDEDEF]">
              Aegis
            </span>
            <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8A8F98]">
              Track 6
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-[#8A8F98]">
          <Link
            href="/demo"
            className="text-red-300 hover:text-white transition-colors flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-xs"
          >
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>Live Story</span>
          </Link>
          <Link
            href="/console"
            className="text-[#EDEDEF] hover:text-white transition-colors flex items-center gap-1.5 font-medium"
          >
            <Terminal className="w-3.5 h-3.5 text-[#5E6AD2]" />
            Operations Console
          </Link>
          <button
            onClick={() => scrollTo("guardrails")}
            className="hover:text-[#EDEDEF] transition-colors cursor-pointer"
          >
            Guardrails
          </button>
          <button
            onClick={() => scrollTo("leak-radar")}
            className="hover:text-[#EDEDEF] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#818cf8]" />
            Leak Radar
          </button>
          <button
            onClick={() => scrollTo("architecture")}
            className="hover:text-[#EDEDEF] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#8A8F98]" />
            How It Works
          </button>
        </div>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-[#8A8F98]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Swytchcode Gateway Connected
          </div>

          <Link
            href="/console"
            className="btn-linear-primary px-3.5 py-1.5 text-xs font-medium tracking-tight cursor-pointer flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            Launch Console
            <ArrowRight className="w-3 h-3 text-white/70" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.05]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.06] bg-[#050506]/95 backdrop-blur-2xl px-4 py-4 space-y-3 text-sm text-[#8A8F98]">
          <Link
            href="/demo"
            className="block w-full text-left py-1.5 text-red-400 font-medium flex items-center gap-1.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Live Story Demo</span>
          </Link>
          <Link
            href="/console"
            className="block w-full text-left py-1.5 text-[#EDEDEF] font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Operations Console
          </Link>
          <button
            onClick={() => scrollTo("guardrails")}
            className="block w-full text-left py-1.5 hover:text-white"
          >
            Guardrails
          </button>
          <button
            onClick={() => scrollTo("leak-radar")}
            className="block w-full text-left py-1.5 hover:text-white"
          >
            Leak Radar
          </button>
          <button
            onClick={() => scrollTo("architecture")}
            className="block w-full text-left py-1.5 hover:text-white"
          >
            How It Works
          </button>
          <div className="pt-2">
            <Link
              href="/console"
              className="btn-linear-primary w-full py-2 text-xs font-medium text-center flex items-center justify-center gap-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Terminal className="w-3.5 h-3.5" />
              Launch Operations Console
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

