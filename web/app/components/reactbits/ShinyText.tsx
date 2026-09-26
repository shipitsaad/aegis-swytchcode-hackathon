"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number; // in seconds
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = "",
  color = "#9CA3AF",
  shineColor = "#FFFFFF",
  spread = 120,
}: ShinyTextProps) {
  if (disabled) {
    return <span className={className} style={{ color }}>{text}</span>;
  }

  return (
    <span
      className={`inline-block bg-clip-text text-transparent font-medium ${className}`}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: "220% 100%",
        animation: `shiny-sweep ${speed}s linear infinite`,
      }}
    >
      {text}
      <style jsx>{`
        @keyframes shiny-sweep {
          0% {
            background-position: 180% 0;
          }
          100% {
            background-position: -80% 0;
          }
        }
      `}</style>
    </span>
  );
}
