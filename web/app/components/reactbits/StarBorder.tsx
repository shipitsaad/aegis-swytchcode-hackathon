"use client";

import React from "react";

interface StarBorderProps extends React.PropsWithChildren {
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  backgroundColor?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function StarBorder({
  children,
  className = "",
  color = "rgba(94, 106, 210, 0.9)",
  speed = "5s",
  thickness = 1,
  backgroundColor = "rgba(12, 13, 18, 0.95)",
  onClick,
  disabled = false,
}: StarBorderProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl cursor-pointer p-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        padding: `${thickness}px`,
      }}
    >
      <div
        className="absolute w-[300%] h-[300%] opacity-85 -top-[100%] -left-[100%] rounded-full animate-spin-slow pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent 0 340deg, ${color} 360deg)`,
          animationDuration: speed,
        }}
      />
      <div
        className="relative z-10 w-full h-full rounded-[inherit] flex items-center justify-center"
        style={{ background: backgroundColor }}
      >
        {children}
      </div>
      <style jsx>{`
        @keyframes spinSlow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spinSlow linear infinite;
        }
      `}</style>
    </button>
  );
}
