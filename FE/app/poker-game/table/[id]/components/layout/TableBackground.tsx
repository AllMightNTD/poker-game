"use client";

import React from "react";
import { usePokerGame } from "../hooks/usePokerGame";

const BG_TINTS: Record<string, string> = {
  classic_green: "from-emerald-950/40 via-slate-950 to-slate-950",
  royal_blue: "from-blue-950/40 via-slate-950 to-slate-950",
  ruby_red: "from-rose-950/40 via-slate-950 to-slate-950",
  shadow_black: "from-slate-900/50 via-slate-950 to-slate-950",
};

export const TableBackground = () => {
  const { tableBackground } = usePokerGame();
  const tint = BG_TINTS[tableBackground] ?? BG_TINTS["classic_green"];

  return (
    <>
      {/* Background Image from AI */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.85] z-0 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: 'url("/images/room_bg.png")' }}
      />
      {/* Base gradient to darken edges */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${tint} z-0 pointer-events-none transition-colors duration-700 mix-blend-multiply`}
      />
      {/* Radial glow at center to focus on the table */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_45%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_100%)] z-0 pointer-events-none"
      />
      {/* Subtle noise/grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
    </>
  );
};
