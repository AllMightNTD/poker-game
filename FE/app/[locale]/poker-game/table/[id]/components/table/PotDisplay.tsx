"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";

export const PotDisplay = memo(function PotDisplay() {
  const { pot, formatChipsVal, smallBlind, bigBlind } = usePokerGame();

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      {/* Blinds info */}
      <div className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">
        Blinds: {formatChipsVal(smallBlind)} / {formatChipsVal(bigBlind)}
      </div>

      {/* Pot chip */}
      <div className="bg-slate-950/90 border border-amber-500/30 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_24px_rgba(245,158,11,0.12)]">
        <Coins size={13} className="text-amber-400 shrink-0" style={{ animation: "spin 3s linear infinite" }} />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[7px] font-black uppercase text-slate-500 tracking-[0.2em]">Tổng Pot</span>
          <motion.span
            key={pot}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-black text-amber-300 tracking-wide tabular-nums"
          >
            {formatChipsVal(pot)}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
});
