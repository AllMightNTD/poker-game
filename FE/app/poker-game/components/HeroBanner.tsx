import React from "react";
import { Plus, Users, Activity, Trophy } from "lucide-react";
import { formatChips } from "./utils";

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
      {/* Top Banner Row (Flat, no card container wrapper) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left Side: Brand, Title and Description */}
        <div className="flex flex-col text-left">
          {/* Logo & Category Label */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F4B942] via-[#E0942A] to-[#B07316] flex items-center justify-center text-[#060e0a] text-xs font-black shadow-lg shadow-[#F4B942]/10 border border-[#F4B942]/30">
              CG
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-[#F7EFDD]/40 font-bold uppercase tracking-widest leading-none mb-1">
                SẢNH GAME POKER
              </span>
              <span className="text-[10px] font-black tracking-widest text-[#F7EFDD] uppercase leading-none">
                POKER <span className="text-[#F4B942]">PRO</span>
              </span>
            </div>
          </div>

          <h1
            className="text-4xl md:text-5xl font-medium tracking-tight text-[#F7EFDD] mt-3"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Texas Hold&apos;em Club
          </h1>
          <p className="text-[#F7EFDD]/60 text-xs md:text-sm max-w-xl mt-3 leading-relaxed">
            Ngồi vào bàn, rút bài, và để bản lĩnh dẫn lối.
            <br />
            Trải nghiệm đẳng cấp sòng bài thượng lưu với đối thủ thực tế và cơ hội chinh phục jackpot.
          </p>
        </div>

        {/* Right Side: Premium Balance Widget */}
        <div className="bg-[#0B151F]/40 border border-[#F4B942]/15 rounded-[1.75rem] p-4 flex items-center justify-between gap-6 w-full lg:w-auto backdrop-blur-md shadow-2xl relative overflow-hidden group">
          {/* Subtle golden ambient glow inside widget */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4B942]/0 via-[#F4B942]/5 to-[#F4B942]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            {/* Custom Premium Overlapping Coins Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-[#F4B942] to-[#C9861C] rounded-full flex items-center justify-center text-[#142019] shrink-0 shadow-lg shadow-[#F4B942]/10 relative border border-[#F4B942]/30">
              <div className="w-8 h-8 rounded-full border border-[#142019]/20 bg-gradient-to-br from-[#F5C25D] to-[#B07513] flex items-center justify-center font-black text-sm shadow-md">
                $
              </div>
              <div className="w-6 h-6 rounded-full border border-[#142019]/20 bg-gradient-to-br from-[#F5C25D] to-[#B07513] flex items-center justify-center font-black text-[10px] absolute -right-1 -bottom-1 shadow-md">
                $
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-[#F7EFDD]/40 font-bold uppercase tracking-widest leading-none mb-1">
                SỐ DƯ CỦA BẠN
              </span>
              <span className="text-2xl font-black text-[#F4B942] tracking-tight leading-none">
                {parseInt(chipsBalance).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 ml-auto lg:ml-2">
            <button
              onClick={onClaimFreeChips}
              className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-[#F4B942] via-[#E0942A] to-[#B07316] hover:brightness-110 text-[#060e0a] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#F4B942]/10 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              🔥 Nhận Chips Free
            </button>
            <button
              onClick={onCreateTableClick}
              className="w-10 h-10 rounded-xl bg-[#08121a]/80 hover:bg-[#0c1a26] text-[#F7EFDD] border border-[#F4B942]/20 flex items-center justify-center font-bold text-sm transition-all hover:border-[#F4B942]/40 cursor-pointer shadow-md active:scale-95"
              title="Tạo bàn chơi"
            >
              <Plus size={16} className="text-[#F4B942]" />
            </button>
          </div>
        </div>
      </div>

      {/* Thin elegant gold-tinted divider line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-[#F4B942]/10 via-white/5 to-[#F4B942]/10 my-6" />

      {/* Stats Row (Flat layout, matching design) */}
      <div className="flex flex-col sm:flex-row justify-start gap-6 sm:gap-12 lg:gap-16">
        {/* Stat 1: Online Players */}
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#F4B942]/5 border border-[#F4B942]/15 flex items-center justify-center text-[#F4B942] transition-colors group-hover:bg-[#F4B942]/10 group-hover:border-[#F4B942]/30 shadow-md">
            <Users size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-widest leading-none mb-1">
              Trực tuyến
            </span>
            <span className="text-sm font-bold text-[#F7EFDD] tracking-wide leading-none">
              {lobbyStats.online_players.toLocaleString()} cao thủ
            </span>
          </div>
        </div>

        {/* Stat 2: Active Tables */}
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#F4B942]/5 border border-[#F4B942]/15 flex items-center justify-center text-[#F4B942] transition-colors group-hover:bg-[#F4B942]/10 group-hover:border-[#F4B942]/30 shadow-md">
            <Activity size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-widest leading-none mb-1">
              Bàn đang mở
            </span>
            <span className="text-sm font-bold text-[#F7EFDD] tracking-wide leading-none">
              {lobbyStats.active_tables} bàn
            </span>
          </div>
        </div>

        {/* Stat 3: Daily Pot */}
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#F4B942]/5 border border-[#F4B942]/15 flex items-center justify-center text-[#F4B942] transition-colors group-hover:bg-[#F4B942]/10 group-hover:border-[#F4B942]/30 shadow-md">
            <Trophy size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-widest leading-none mb-1">
              Hũ pot hôm nay
            </span>
            <span className="text-sm font-bold text-[#F4B942] tracking-wide leading-none">
              {formatChips(lobbyStats.total_jackpot_pot.toString())} Chips
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
