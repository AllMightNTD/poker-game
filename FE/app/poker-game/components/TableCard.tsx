import React from "react";
import { motion } from "framer-motion";
import { Users, Flame, ChevronRight, Eye } from "lucide-react";
import { formatChips, SUITS } from "./utils";

interface TableCardProps {
  table: any;
  idx: number;
  onJoinTable: (table: any) => void;
  onSpectateTable: (table: any) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  idx,
  onJoinTable,
  onSpectateTable,
}) => {
  const isFull = table.current_players >= table.max_players;
  const isHot = table.current_players / table.max_players >= 0.7 && !isFull;
  const suit = SUITS[idx % SUITS.length];
  const suitColor = suit === "♥" || suit === "♦" ? "text-[#E23744]" : "text-[#F7EFDD]/80";

  // Phân loại mức cược (blind category) để hiển thị màu sắc chuyên nghiệp
  const bb = parseInt(table.big_blind);
  let stakeColor = "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/20";
  let stakeLabel = "Micro";

  if (bb > 2000 && bb <= 10000) {
    stakeColor = "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20";
    stakeLabel = "Low";
  } else if (bb > 10000 && bb <= 50000) {
    stakeColor = "bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20";
    stakeLabel = "Medium";
  } else if (bb > 50000) {
    stakeColor = "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/20";
    stakeLabel = "High";
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative bg-gradient-to-br from-[#0b1612]/95 via-[#08120e]/80 to-[#040907]/95 border border-[#F4B942]/15 hover:border-[#F4B942]/60 rounded-[1.75rem] p-5 flex flex-col justify-between gap-4.5 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(244,185,66,0.06)] group overflow-hidden backdrop-blur-xl"
    >
      {/* corner suit watermark */}
      <span className={`absolute -right-3 -top-5 text-8xl font-black opacity-[0.035] group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none select-none ${suitColor}`}>
        {suit}
      </span>

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Stake Category Tag */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${stakeColor}`}>
              {stakeLabel}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] text-[#F7EFDD]/90 text-[10px] font-bold uppercase tracking-wider border border-white/[0.06]">
              <span className={suitColor}>{suit}</span>
              {table.game_type}
            </span>
            {table.status === "RUNNING" && (
              <span className="inline-flex px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/20">
                ● Playing
                                            </span>
            )}
            {table.status === "WAITING" && (
              <span className="inline-flex px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase border border-amber-500/20">
                ○ Waiting
                                            </span>
            )}
          </div>
          <h3 className="font-black text-[#F7EFDD] group-hover:text-[#F4B942] transition-colors text-base md:text-lg tracking-tight">
            {table.name}
          </h3>
          {isHot && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#E23744] uppercase tracking-wider animate-pulse">
              <Flame size={12} /> Hot Tables
                                      </span>
          )}
        </div>

        <div className="flex items-center gap-2 bg-[#050b08]/85 px-3 py-2 rounded-xl border border-white/[0.05]">
          <Users size={14} className="text-[#F7EFDD]/50" />
          <span className="text-xs font-black text-[#F7EFDD]">
            {table.current_players}/{table.max_players}
          </span>
        </div>
      </div>

      {/* Seat dots — friendly at-a-glance occupancy */}
      <div className="flex items-center gap-2 relative z-10 bg-black/20 p-2.5 rounded-xl border border-white/[0.03]">
        {Array.from({ length: table.max_players }).map((_, seatIdx) => (
          <span
            key={seatIdx}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              seatIdx < table.current_players
                ? "bg-gradient-to-br from-[#F4B942] to-[#E0942A] shadow-md shadow-[#F4B942]/30 scale-110 border border-[#F4B942]/20"
                : "bg-[#0b1612] border border-white/10"
            }`}
          />
        ))}
        <span className="text-[9px] font-bold uppercase text-[#F7EFDD]/30 tracking-widest ml-auto">Open Seats</span>
      </div>

      {/* Blinds & Buyin Area */}
      <div className="grid grid-cols-2 gap-4 bg-[#050b08]/60 rounded-2xl p-4 border border-white/[0.04] relative z-10">
        <div className="text-left">
          <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider mb-0.5">Blinds</span>
          <span className="text-base font-black text-[#F4B942] tracking-tight">
            {formatChips(table.small_blind)} / {formatChips(table.big_blind)}
          </span>
        </div>
        <div className="text-left">
          <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider mb-0.5">Buy-in</span>
          <span className="text-xs font-bold text-[#F7EFDD]/90">
            {formatChips(table.min_buyin)} - {formatChips(table.max_buyin)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 pt-1 relative z-10">
        <motion.button
          whileHover={!isFull ? { scale: 1.02 } : {}}
          whileTap={!isFull ? { scale: 0.98 } : {}}
          onClick={() => onJoinTable(table)}
          disabled={isFull}
          className={`flex-1 py-3.5 px-4 rounded-xl font-black text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group/joinbtn ${
            isFull
              ? "bg-[#08121a]/60 text-[#F7EFDD]/30 border border-white/5 cursor-not-allowed"
              : "bg-gradient-to-r from-[#F4B942] via-[#E0942A] to-[#B07316] text-[#060e0a] shadow-lg shadow-[#F4B942]/10"
          }`}
        >
          {!isFull && (
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/joinbtn:animate-[shimmer_1.5s_infinite]" />
          )}
          <span>{isFull ? "Table Full" : "Join Table"}</span>
          {!isFull && <ChevronRight size={14} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#0d2118" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSpectateTable(table)}
          className="p-3.5 rounded-xl bg-[#08121a]/90 hover:bg-[#0d2118] border border-[#F4B942]/30 text-[#F7EFDD]/70 hover:text-[#F4B942] transition-all flex items-center justify-center cursor-pointer shadow-md"
          title="Spectate Table"
        >
          <Eye size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};
