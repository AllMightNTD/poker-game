"use client";

import React from "react";
import { motion } from "framer-motion";

export const PokerAuthBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* ── Background Casino Vibe ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a2421_0%,_#050806_100%)]" />
      
      {/* Subtle glowing felt table effect */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_bottom,_rgba(244,185,66,0.1)_0%,_transparent_60%)] pointer-events-none" />

      {/* Floating Elements (Cards/Chips) using Framer Motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Spade */}
        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[15%] left-[10%] text-white/5 md:text-white/10 text-9xl"
        >
          ♠
        </motion.div>

        {/* Floating Heart */}
        <motion.div
          animate={{
            y: [20, -20, 20],
            rotate: [0, -15, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-[20%] right-[10%] text-rose-500/5 md:text-rose-500/10 text-9xl"
        >
          ♥
        </motion.div>

        {/* Floating Diamond */}
        <motion.div
          animate={{
            y: [-15, 15, -15],
            rotate: [15, -15, 15],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-[20%] right-[20%] text-rose-500/5 md:text-rose-500/10 text-8xl"
        >
          ♦
        </motion.div>

        {/* Floating Club */}
        <motion.div
          animate={{
            y: [15, -15, 15],
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-[15%] left-[20%] text-white/5 md:text-white/10 text-8xl"
        >
          ♣
        </motion.div>
      </div>

      {/* ── Glassmorphic Container for Form ── */}
      <div className="relative z-10 w-full max-w-md px-6 py-10 sm:p-10 mx-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
        
        <div className="relative z-20">
          {/* Logo / Branding Placeholder */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#F4B942] to-[#B07D1B] flex items-center justify-center shadow-[0_0_20px_rgba(244,185,66,0.3)] mb-4 border-2 border-black">
              <span className="text-black text-3xl font-black tracking-tighter">CG</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest">
              Poker <span className="text-[#F4B942]">Pro</span>
            </h1>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
