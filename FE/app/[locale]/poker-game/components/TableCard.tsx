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
  const suitColor = suit === "♥" || suit === "♦" ? "text-[#E23744]" : "text-[#F7EFDD]";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-[#0F4438]/80 border border-[#F4B942]/15 hover:border-[#F4B942]/50 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-[#F4B942]/5 group overflow-hidden"
    >
      {/* corner suit watermark */}
      <span className={`absolute -right-2 -top-3 text-7xl font-black opacity-[0.05] pointer-events-none ${suitColor}`}>
        {suit}
      </span>

      <div className="flex justify-between items-start relative">
        <div className="space-y-1.5">
          <div className="flex gap-2 items-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4B942]/10 text-[#F4B942] text-[10px] font-bold uppercase tracking-wider border border-[#F4B942]/15">
              <span className={suitColor}>{suit}</span>
              {table.game_type}
            </span>
            {table.status === "RUNNING" && (
              <span className="inline-flex px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/30">
                ● Đang chơi
              </span>
            )}
            {table.status === "WAITING" && (
              <span className="inline-flex px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase border border-amber-500/30">
                ○ Đang chờ
              </span>
            )}
            {table.status === "CLOSED" && (
              <span className="inline-flex px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 text-[10px] font-bold uppercase border border-slate-500/30">
                Đã đóng
              </span>
            )}
          </div>
          <h3 className="font-black text-[#F7EFDD] group-hover:text-[#F4B942] transition-colors text-base tracking-tight">
            {table.name}
          </h3>
          {isHot && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E23744]">
              <Flame size={11} /> Bàn đang hot
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 bg-[#0B3D2E]/80 px-2.5 py-1.5 rounded-xl border border-[#F4B942]/10">
          <Users size={13} className="text-[#F7EFDD]/50" />
          <span className="text-xs font-bold text-[#F7EFDD]">
            {table.current_players}/{table.max_players}
          </span>
        </div>
      </div>

      {/* Seat dots — friendly at-a-glance occupancy */}
      <div className="flex items-center gap-1.5 relative">
        {Array.from({ length: table.max_players }).map((_, seatIdx) => (
          <span
            key={seatIdx}
            className={`w-2.5 h-2.5 rounded-full ${seatIdx < table.current_players
              ? "bg-[#F4B942] shadow-sm shadow-[#F4B942]/40"
              : "bg-[#F7EFDD]/10"
              }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 bg-[#0B3D2E]/60 rounded-xl p-3.5 border border-[#F4B942]/10 relative">
        <div>
          <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider">Blinds</span>
          <span className="text-sm font-black text-[#F4B942]">
            {formatChips(table.small_blind)} / {formatChips(table.big_blind)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider">Buy-in</span>
          <span className="text-xs font-bold text-[#F7EFDD]/80">
            {formatChips(table.min_buyin)} - {formatChips(table.max_buyin)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 relative">
        <button
          onClick={() => onJoinTable(table)}
          disabled={isFull}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${isFull
            ? "bg-[#0B3D2E]/60 text-[#F7EFDD]/30 border border-[#F4B942]/10 cursor-not-allowed"
            : "bg-gradient-to-r from-[#F4B942] to-[#E0942A] hover:brightness-110 text-[#142019] shadow-md shadow-[#F4B942]/20 active:scale-95"
            }`}
        >
          <span>{isFull ? "Bàn đã đầy" : "Vào Bàn Chơi"}</span>
          {!isFull && <ChevronRight size={14} />}
        </button>

        <button
          onClick={() => onSpectateTable(table)}
          className="p-3 rounded-xl bg-[#0B3D2E]/80 hover:bg-[#0B3D2E] border border-[#F4B942]/15 text-[#F7EFDD]/60 hover:text-[#F7EFDD] transition-all flex items-center justify-center cursor-pointer"
          title="Theo dõi bàn đấu"
        >
          <Eye size={15} />
        </button>
      </div>
    </motion.div>
  );
};
