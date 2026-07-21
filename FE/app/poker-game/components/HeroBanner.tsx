import React from "react";
import { Plus, Users, Activity, Trophy } from "lucide-react";
import { formatChips } from "./utils";
import { motion } from "framer-motion";

interface HeroBannerProps {
  chipsBalance: string;
  lobbyStats: {
    online_players: number;
    active_tables: number;
    total_jackpot_pot: number;
  };
  onClaimFreeChips: () => void;
  onCreateTableClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  chipsBalance,
  lobbyStats,
  onClaimFreeChips,
  onCreateTableClick,
}) => {
  return (
    <div className="relative z-10 w-full">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left Side: Brand, Title and Description */}
        <div className="flex flex-col text-left">
          {/* Logo & Category Label */}
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F4B942] via-[#E0942A] to-[#B07316] flex items-center justify-center text-[#060e0a] text-xs font-black shadow-lg shadow-[#F4B942]/20 border border-[#F4B942]/40"
            >
              CG
            </motion.div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-[#F7EFDD]/50 font-black uppercase tracking-widest leading-none mb-1">
                POKER LOBBY
                                            </span>
              <span className="text-[10px] font-black tracking-widest text-[#F7EFDD] uppercase leading-none">
                POKER <span className="text-[#F4B942]">VIP CLUB</span>
              </span>
            </div>
          </div>

          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#F7EFDD] mt-3 bg-clip-text bg-gradient-to-r from-[#F7EFDD] via-[#f7efdd]/90 to-[#F4B942]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Texas Hold&apos;em Arena
          </h1>
          <p className="text-[#F7EFDD]/70 text-xs md:text-sm max-w-xl mt-3 leading-relaxed">
            Take a seat, test your wits, and let your skills lead the way.
                                  <br />
            Experience a high-end casino atmosphere with real opponents and the chance to win massive jackpots.
                                </p>
        </div>

        {/* Right Side: Premium Balance Widget */}
        <div className="bg-gradient-to-br from-[#0b1612]/90 via-[#0d2118]/80 to-[#060e0a]/95 border border-[#F4B942]/25 rounded-[2rem] p-5 flex items-center justify-between gap-6 w-full lg:w-auto backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* Subtle golden ambient glow inside widget */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4B942]/0 via-[#F4B942]/8 to-[#F4B942]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          {/* Shimmer effect across the widget */}
          <div className="absolute -inset-y-0 -inset-x-20 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

          <div className="flex items-center gap-4.5 relative z-10">
            {/* Custom Premium Overlapping Coins Icon */}
            <div className="w-13 h-13 bg-gradient-to-br from-[#F4B942] via-[#E0942A] to-[#B07316] rounded-full flex items-center justify-center text-[#142019] shrink-0 shadow-lg shadow-[#F4B942]/30 relative border border-[#F4B942]/40">
              <div className="w-9 h-9 rounded-full border border-[#142019]/20 bg-gradient-to-br from-[#F5C25D] via-[#E0942A] to-[#B07513] flex items-center justify-center font-black text-base shadow-md">
                $
              </div>
              <div className="w-6.5 h-6.5 rounded-full border border-[#142019]/20 bg-gradient-to-br from-[#F5C25D] via-[#E0942A] to-[#B07513] flex items-center justify-center font-black text-[10px] absolute -right-1 -bottom-1 shadow-md">
                $
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-[#F7EFDD]/40 font-black uppercase tracking-widest leading-none mb-1.5">
                YOUR BALANCE
                                            </span>
              <span className="text-3xl font-black text-[#F4B942] tracking-tight leading-none drop-shadow-[0_2px_10px_rgba(244,185,66,0.2)]">
                {parseInt(chipsBalance).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 ml-auto lg:ml-4">
            <motion.button
              whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onClaimFreeChips}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#F4B942] via-[#E0942A] to-[#B07316] text-[#060e0a] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#F4B942]/20 whitespace-nowrap cursor-pointer relative overflow-hidden group/btn"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              🔥 Get Free Chips
                                      </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateTableClick}
              className="w-11 h-11 rounded-xl bg-[#08121a]/90 hover:bg-[#0c1a26] text-[#F7EFDD] border border-[#F4B942]/30 flex items-center justify-center font-bold text-sm transition-all hover:border-[#F4B942]/60 cursor-pointer shadow-md"
              title="Create Table"
            >
              <Plus size={18} className="text-[#F4B942]" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Thin elegant gold-tinted divider line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-[#F4B942]/20 via-white/5 to-[#F4B942]/20 my-6" />

      {/* Stats Row */}
      <div className="flex flex-wrap justify-start gap-6 sm:gap-12 lg:gap-16">
        {/* Stat 1: Online Players */}
        <div className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-full bg-[#F4B942]/5 border border-[#F4B942]/20 flex items-center justify-center text-[#F4B942] transition-all group-hover:bg-[#F4B942]/10 group-hover:border-[#F4B942]/40 shadow-md group-hover:shadow-[#F4B942]/10 group-hover:scale-105">
            <Users size={18} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-widest leading-none mb-1.5">
              Online
                                      </span>
            <span className="text-sm font-bold text-[#F7EFDD] tracking-wide leading-none">
              {lobbyStats.online_players.toLocaleString()} pro players
                                      </span>
          </div>
        </div>

        {/* Stat 2: Active Tables */}
        <div className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-full bg-[#F4B942]/5 border border-[#F4B942]/20 flex items-center justify-center text-[#F4B942] transition-all group-hover:bg-[#F4B942]/10 group-hover:border-[#F4B942]/40 shadow-md group-hover:shadow-[#F4B942]/10 group-hover:scale-105">
            <Activity size={18} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-widest leading-none mb-1.5">
              Active Tables
                                      </span>
            <span className="text-sm font-bold text-[#F7EFDD] tracking-wide leading-none">
              {lobbyStats.active_tables} tables
                                      </span>
          </div>
        </div>

        {/* Stat 3: Daily Pot */}
        <div className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-full bg-[#F4B942]/5 border border-[#F4B942]/20 flex items-center justify-center text-[#F4B942] transition-all group-hover:bg-[#F4B942]/10 group-hover:border-[#F4B942]/40 shadow-md group-hover:shadow-[#F4B942]/10 group-hover:scale-105">
            <Trophy size={18} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-widest leading-none mb-1.5">
              Today&apos;s Pot
                                      </span>
            <span className="text-sm font-black text-[#F4B942] tracking-wide leading-none drop-shadow-[0_1px_5px_rgba(244,185,66,0.1)]">
              {formatChips(lobbyStats.total_jackpot_pot.toString())} Chips
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
