"use client";

import React from "react";
import Link from "next/link";
import { Shield, Terminal, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#020203] py-12 relative z-10 text-xs text-[#8A8F98] font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#818cf8]">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[#EDEDEF] font-medium tracking-tight text-sm">Aegis</span>
            <p className="text-[11px] text-[#8A8F98]">Autonomous Financial Defense</p>
          </div>
        </div>

        {/* Center Attribution */}
        <div className="text-center md:text-left text-[11px]">
          <p className="text-[#EDEDEF]">
            Build with Swytchcode · Gurgaon Edition
          </p>
          <p className="text-[#8A8F98]">
            Track 6: AI Business Operator (PayPal · Slack · Notion)
          </p>
        </div>

        {/* Right CTA & Status */}
        <div className="flex items-center gap-4">
          <Link
            href="/console"
            className="text-xs text-[#818cf8] hover:text-[#EDEDEF] transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3 h-3" />
            Operations Console
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

