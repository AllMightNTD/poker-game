"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePokerGame } from "../hooks/usePokerGame";

const STAGE_LABELS: Record<string, string> = {
  preflop: "Pre-Flop",
  flop: "Flop",
  turn: "Turn",
  river: "River",
  showdown: "Show Cards",
};

const STAGE_COLORS: Record<string, string> = {
  preflop: "text-slate-400 bg-slate-500/10 border-slate-600/20",
  flop: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  turn: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  river: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  showdown: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export const BoardStage = memo(function BoardStage() {
  const { gameStage } = usePokerGame();
  const label = STAGE_LABELS[gameStage] ?? gameStage;
  const colorClass = STAGE_COLORS[gameStage] ?? STAGE_COLORS["flop"];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gameStage}
        initial={{ opacity: 0, scale: 0.85, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -4 }}
        transition={{ duration: 0.2 }}
        className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${colorClass}`}
      >
        {label}
      </motion.div>
    </AnimatePresence>
  );
});
