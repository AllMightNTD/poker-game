"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";

export const PotDisplay = memo(function PotDisplay() {
  const { pot, formatChipsVal, smallBlind, bigBlind } = usePokerGame();

  return (
    <motion.div
      className="flex flex-col items-center gap-0.5 md:gap-1 z-30"
      initial={{ y: -15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      {/* Golden Plaque */}
      <div className="relative w-[180px] md:w-[220px] bg-gradient-to-b from-[#E7C678] via-[#C99C3D] to-[#996D1D] rounded-lg border border-[#FDF1BA] p-[2px] shadow-[0_15px_30px_rgba(0,0,0,0.8),_inset_0_2px_4px_rgba(255,255,255,0.6)]">
        <div className="bg-gradient-to-b from-[#302010] to-[#1a1005] rounded-md border border-[#996D1D] flex flex-col items-center py-2 md:py-3 px-4 shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)]">
          <span className="text-[10px] md:text-xs font-black text-[#E7C678] uppercase tracking-[0.2em] mb-1 drop-shadow-md">
            Total Pot
          </span>
          <div className="flex items-center gap-2">
            <Coins size={14} className="text-[#FDF1BA]" />
            <motion.span
              key={pot}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              className="text-lg md:text-2xl font-black text-[#FDF1BA] tracking-wider tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
            >
              {formatChipsVal(pot)}
            </motion.span>
          </div>
        </div>
      </div>
      
      {/* Blinds info below plaque */}
      <div className="mt-1 bg-black/60 rounded-full px-4 py-1 border border-white/5 backdrop-blur-sm">
        <span className="text-[8px] md:text-[10px] font-bold text-[#A8B2A9] tracking-widest uppercase">
          Blinds: {formatChipsVal(smallBlind)} / {formatChipsVal(bigBlind)}
        </span>
      </div>
    </motion.div>
  );
});
