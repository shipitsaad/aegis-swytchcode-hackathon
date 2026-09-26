"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface DecryptedTextProps {
  text: string;
  speed?: number; // ms per frame
  maxIterations?: number;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  animateOn?: "always" | "hover" | "view";
  sequential?: boolean;
}

const DEFAULT_CHARS = "0123456789ABCDEF!@#$%&*<>/~=";

export default function DecryptedText({
  text,
  speed = 40,
  maxIterations = 10,
  characters = DEFAULT_CHARS,
  className = "",
  encryptedClassName = "text-[#818cf8] font-mono opacity-80",
  animateOn = "always",
  sequential = true,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomChar = useCallback(() => {
    return characters[Math.floor(Math.random() * characters.length)];
  }, [characters]);

  const startAnimation = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnimating(true);
    const newRevealed = new Set<number>();
    setRevealedIndices(newRevealed);

    let iteration = 0;
    const len = text.length;

    timerRef.current = setInterval(() => {
      iteration++;

      if (sequential) {
        const step = Math.max(1, Math.floor(len / maxIterations));
        for (let i = 0; i < step; i++) {
          if (newRevealed.size < len) {
            newRevealed.add(newRevealed.size);
          }
        }
      } else {
        if (iteration >= maxIterations) {
          for (let i = 0; i < len; i++) newRevealed.add(i);
        }
      }

      const nextChars = text
        .split("")
        .map((char, idx) => {
          if (char === " " || char === "\n") return char;
          if (newRevealed.has(idx)) return char;
          return getRandomChar();
        })
        .join("");

      setDisplayText(nextChars);
      setRevealedIndices(new Set(newRevealed));

      if (newRevealed.size >= len || iteration >= maxIterations * 2) {
        if (timerRef.current) clearInterval(timerRef.current);
        setDisplayText(text);
        setIsAnimating(false);
      }
    }, speed);
  }, [text, sequential, maxIterations, speed, getRandomChar]);

  useEffect(() => {
    if (animateOn === "always") {
      startAnimation();
    } else {
      setDisplayText(text);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, animateOn, startAnimation]);

  const handleMouseEnter = () => {
    if (animateOn === "hover" && !isAnimating) {
      startAnimation();
    }
  };

  return (
    <span
      className={`inline-block font-mono tracking-tight ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {displayText.split("").map((char, idx) => {
        const isRevealed = !isAnimating || revealedIndices.has(idx) || char === " ";
        return (
          <span
            key={idx}
            className={isRevealed ? "" : encryptedClassName}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
