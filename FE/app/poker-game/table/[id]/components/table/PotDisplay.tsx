"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { usePokerGame } from "../hooks/usePokerGame";

export const PotDisplay = memo(function PotDisplay() {
  const { pot, formatChipsVal } = usePokerGame();

  if (!pot || Number(pot) <= 0) return null;

  return (
    <motion.div
      className="flex items-center justify-center z-30 pointer-events-none select-none py-1 px-4 bg-[#14261d]/60 border border-[#E7C678]/15 rounded-full backdrop-blur-[1px] shadow-sm"
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
    >
      <span className="text-[10px] md:text-xs font-black text-[#E7C678] uppercase tracking-[0.18em] mr-1.5 drop-shadow-md">
        POT:
      </span>
      <motion.span
        key={pot}
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.12 }}
        className="text-xs md:text-sm font-black text-white tracking-wider tabular-nums drop-shadow-md"
      >
        ${formatChipsVal(pot)}
      </motion.span>
    </motion.div>
  );
});
