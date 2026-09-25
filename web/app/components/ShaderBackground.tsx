"use client";

import React, { useEffect, useState } from "react";

export default function ShaderBackground() {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050506]">
      {/* Layer 1: Base Deep Space Radial Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, #0a0a0f 0%, #050506 50%, #020203 100%)",
        }}
      />

      {/* Layer 2: 64px Technical Grid Overlay */}
      <div className="absolute inset-0 grid-bg opacity-70" />

      {/* Layer 3: Cinematic Floating Ambient Light Blobs */}
      {/* Primary Top-Center Light Pool */}
      <div
        className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-[1000px] h-[700px] rounded-full blur-[150px] opacity-25 animate-blob-float pointer-events-none"
        style={{
          background: "radial-gradient(circle, #5E6AD2 0%, rgba(94, 106, 210, 0.4) 50%, transparent 70%)",
        }}
      />

      {/* Secondary Left Ambient Pool */}
      <div
        className="absolute top-1/3 -left-48 w-[700px] h-[800px] rounded-full blur-[140px] opacity-15 animate-blob-float pointer-events-none"
        style={{
          animationDelay: "-3s",
          background: "radial-gradient(circle, #7c3aed 0%, rgba(124, 58, 237, 0.3) 50%, transparent 70%)",
        }}
      />

      {/* Tertiary Right Ambient Pool */}
      <div
        className="absolute top-2/3 -right-48 w-[600px] h-[700px] rounded-full blur-[130px] opacity-12 animate-blob-float pointer-events-none"
        style={{
          animationDelay: "-6s",
          background: "radial-gradient(circle, #4f46e5 0%, rgba(79, 70, 229, 0.3) 50%, transparent 70%)",
        }}
      />

      {/* Interactive Subtle Cursor Spotlight */}
      <div
        className="absolute w-[450px] h-[450px] rounded-full pointer-events-none transition-transform duration-75 ease-out blur-[90px] opacity-15"
        style={{
          transform: `translate(${mousePos.x - 225}px, ${mousePos.y - 225}px)`,
          background: "radial-gradient(circle, #5E6AD2 0%, rgba(94, 106, 210, 0.2) 60%, transparent 80%)",
        }}
      />

      {/* Subtle Noise Texture */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.018] mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
