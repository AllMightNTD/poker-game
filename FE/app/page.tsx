"use client";

import { useCurrentUser } from "@/core/providers/user-provider";
import { motion } from "framer-motion";
import {
  Club,
  Cpu,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [jackpot, setJackpot] = useState(7891452);
  const [activePlayers, setActivePlayers] = useState(124567);
  const activeTournaments = 1894;

  const { currentUser, isLoadingUser } = useCurrentUser();
  const router = useRouter();

  // Redirect authenticated users to the game
  useEffect(() => {
    if (!isLoadingUser && currentUser) {
      router.push("/poker-game");
    }
  }, [currentUser, isLoadingUser, router]);

  // Live Jackpot growth simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + Math.floor(Math.random() * 150) + 10);
      setActivePlayers((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05090e]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#F4B942]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F4B942] animate-spin" />
            <Club size={22} className="absolute inset-0 m-auto text-[#F4B942] animate-pulse" />
          </div>
          <p className="text-[#F7EFDD]/80 font-black tracking-widest text-xs uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#05090e] text-[#F7EFDD] overflow-x-hidden font-sans relative">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#F4B942]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ── PREMIUM HEADER ── */}
      <header className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#F4B942]/30 flex items-center justify-center bg-black relative">
            <Image src="/logo.png" alt="Aurora Poker Logo" width={40} height={40} className="object-cover" />
          </div>
          <span className="text-sm font-black tracking-[0.2em] uppercase text-white">
            CG <span className="text-[#F4B942]">POKER</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[#F7EFDD]/60">
          <a href="#features" className="hover:text-[#F4B942] transition-colors">Features</a>
          <a href="#stats" className="hover:text-[#F4B942] transition-colors">Tournaments</a>
          <a href="#clubs" className="hover:text-[#F4B942] transition-colors">VIP Clubs</a>
          <a href="mailto:support@aurorapoker.com" className="hover:text-[#F4B942] transition-colors">Support</a>
        </nav>

        <div className="flex gap-2">
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gradient-to-r from-[#F4B942] to-[#D08B1B] text-[#05090e] text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(244,185,66,0.3)] cursor-pointer"
            >
              Log In
            </motion.button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full px-6 py-4 bg-[#10b981] text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer border border-emerald-300/20"
            >
              Register
            </motion.button>
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column text */}
        <div className="text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-[#10b981]">
            <Sparkles size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
            The Future of Online Poker
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
            EXPERIENCE THE <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-[#F4B942] bg-clip-text text-transparent">
              NEXT GEN LOBBY
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#F7EFDD]/70 max-w-lg font-medium leading-relaxed">
            High-Stakes Thrills, Strategic Multiplayer, and Custom VIP Clubs. Play with real-time sync, dynamic seat distributions, and robust side-pot operations.
          </p>
        </div>

        {/* Right column graphic design mockup */}
        <div className="relative flex justify-center items-center">
          {/* Main glowing background shape */}
          <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse" style={{ animationDuration: '6s' }}>
            <div className="w-[85%] h-[85%] rounded-full bg-[#05090e] border border-emerald-500/20 flex items-center justify-center">
              <Club size={120} className="text-[#10b981] opacity-20" />
            </div>
          </div>

          {/* Cards floating left */}
          <motion.div
            initial={{ y: 20, rotate: -15, opacity: 0 }}
            animate={{ y: 0, rotate: -12, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute left-4 sm:left-12 -top-12 z-20 w-32 h-48 bg-gradient-to-b from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-xl font-bold text-emerald-400">A</span>
              <Club size={16} className="text-emerald-400" />
            </div>
            <div className="flex justify-center">
              <Club size={36} className="text-emerald-400" />
            </div>
            <div className="flex justify-between items-end rotate-180">
              <span className="text-xl font-bold text-emerald-400">A</span>
              <Club size={16} className="text-emerald-400" />
            </div>
          </motion.div>

          {/* Cards floating right */}
          <motion.div
            initial={{ y: 30, rotate: 15, opacity: 0 }}
            animate={{ y: 0, rotate: 12, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute right-4 sm:right-12 top-6 z-20 w-32 h-48 bg-gradient-to-b from-[#1b120c] to-[#0d0906] border border-[#F4B942]/20 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-xl font-bold text-[#F4B942]">K</span>
              <Club size={16} className="text-[#F4B942]" />
            </div>
            <div className="flex justify-center">
              <Club size={36} className="text-[#F4B942]" />
            </div>
            <div className="flex justify-between items-end rotate-180">
              <span className="text-xl font-bold text-[#F4B942]">K</span>
              <Club size={16} className="text-[#F4B942]" />
            </div>
          </motion.div>

          {/* Center glowing spade logo element */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-30 w-44 h-44 rounded-full bg-gradient-to-b from-emerald-500/20 to-emerald-900/40 backdrop-blur-md border border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center justify-center"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]">
              <path fill="currentColor" d="M50,15 C62.5,35 85,45 85,62.5 C85,77.5 72.5,85 57.5,85 C55,85 52.5,82.5 52.5,80 L52.5,67.5 L47.5,67.5 L47.5,80 C47.5,82.5 45,85 42.5,85 C27.5,85 15,77.5 15,62.5 C15,45 37.5,35 50,15 Z" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ── LIVE STATS & JACKPOT ── */}
      <section id="stats" className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active players */}
          <div className="p-6 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.04] rounded-3xl text-left flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-[10px] text-[#F7EFDD]/40 font-black uppercase tracking-widest block mb-1">Active Players</span>
              <h3 className="text-3xl font-black text-white">{activePlayers.toLocaleString()}+</h3>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Users size={14} /> Live globally & growing
            </div>
          </div>

          {/* Active tournaments */}
          <div className="p-6 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.04] rounded-3xl text-left flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-[10px] text-[#F7EFDD]/40 font-black uppercase tracking-widest block mb-1">Ongoing Tables</span>
              <h3 className="text-3xl font-black text-white">{activeTournaments.toLocaleString()}</h3>
            </div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Trophy size={14} /> Low stakes to high stakes
            </div>
          </div>

          {/* Progressive Jackpot counter */}
          <div className="p-6 bg-gradient-to-b from-emerald-950/20 to-transparent border border-emerald-500/20 rounded-3xl text-left flex flex-col justify-between min-h-[140px] relative overflow-hidden shadow-[0_10px_30px_rgba(16,185,129,0.05)]">
            <div>
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block mb-1">Progressive Jackpot</span>
              <h3 className="text-3xl font-black text-[#F4B942] tracking-wide font-mono">
                ${jackpot.toLocaleString()}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
              <Zap size={14} className="text-[#F4B942]" /> Ready to drop soon
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES SECTION ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase text-[#F4B942] tracking-widest">Designed for Players</span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white">Elite Features & Customizations</h2>
          <p className="text-sm text-[#F7EFDD]/60">
            Engineered using modern standards, offering lag-free socket connections and custom UI layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Custom Seats */}
          <div className="p-8 bg-[#0b1219]/90 border border-white/[0.04] rounded-3xl space-y-4 text-left transition-all hover:border-[#F4B942]/20 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#F4B942]/10 border border-[#F4B942]/30 flex items-center justify-center text-[#F4B942]">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-black uppercase text-white">Dynamic Seat Layout</h3>
            <p className="text-xs text-[#F7EFDD]/60 leading-relaxed">
              No more empty seat placeholders. Real-time seats are automatically aligned depending on custom tables (2-10 players) using symmetric math equations.
            </p>
          </div>

          {/* Card 2: Security & Integrity */}
          <div className="p-8 bg-[#0b1219]/90 border border-white/[0.04] rounded-3xl space-y-4 text-left transition-all hover:border-[#F4B942]/20 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-black uppercase text-white">Secure Game Integrity</h3>
            <p className="text-xs text-[#F7EFDD]/60 leading-relaxed">
              Anti-collusion and card randomization engine strictly processed in isolated, stateless backend processors with real-time watchdog monitors.
            </p>
          </div>

          {/* Card 3: AI Bot Support */}
          <div className="p-8 bg-[#0b1219]/90 border border-white/[0.04] rounded-3xl space-y-4 text-left transition-all hover:border-[#F4B942]/20 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Cpu size={20} />
            </div>
            <h3 className="text-lg font-black uppercase text-white">AI-Powered Bots</h3>
            <p className="text-xs text-[#F7EFDD]/60 leading-relaxed">
              Seamlessly fill vacant seats with smart bots. Manage their buy-ins and synchronization settings instantly with state service channels.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-12 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#F4B942]/20 flex items-center justify-center bg-black relative">
              <Image src="/logo.png" alt="Aurora Poker Logo" width={32} height={32} className="object-cover" />
            </div>
            <span className="text-xs font-black tracking-[0.15em] uppercase text-white">
              AURORA <span className="text-[#F4B942]">POKER</span>
            </span>
          </div>

          <span className="text-[10px] text-[#F7EFDD]/40 font-bold uppercase tracking-widest">
            © 2026 Aurora VIP Clubs. All Rights Reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
