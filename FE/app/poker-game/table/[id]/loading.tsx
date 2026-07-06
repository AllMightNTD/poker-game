"use client";

import React from "react";
import { motion } from "framer-motion";
import { Coins, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-90 z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Rotating premium dealer chip loader */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="w-20 h-20 rounded-full border-[6px] border-dashed border-emerald-500/40 flex items-center justify-center p-2 bg-slate-900 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
          >
            <div className="w-full h-full rounded-full border border-emerald-500/20 bg-slate-950 flex items-center justify-center">
              <Coins className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>
          {/* Pulsing glow */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl animate-pulse -z-10" />
        </div>

        {/* Text indicators */}
        <div className="text-center space-y-2">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-emerald-500 animate-pulse" />
            Đang vào bàn chơi
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Loading Gaming Table...
          </p>
        </div>
      </div>
    </div>
  );
}
