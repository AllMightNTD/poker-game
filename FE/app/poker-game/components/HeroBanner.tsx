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
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left Side: Brand, Title and Description */}
        <div className="flex flex-col">
          {/* Logo & Category */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F4B942] to-[#E0942A] flex items-center justify-center text-[#142019] text-xs font-black shadow-md shadow-[#F4B942]/20">
              CG
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-[#F7EFDD]">
                POKER <span className="text-[#F4B942]">PRO</span>
              </span>
              <span className="text-[9px] text-[#F7EFDD]/40 font-bold uppercase tracking-widest">
                SẢNH GAME POKER
              </span>
            </div>
          </div>

          <h1
            className="text-4xl md:text-5xl font-medium tracking-tight text-[#F7EFDD] mt-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Texas Hold&apos;em Club
          </h1>
          <p className="text-[#F7EFDD]/60 text-xs md:text-sm max-w-lg mt-3 leading-relaxed">
            Ngồi vào bàn, rút bài, và để may mắn dẫn lối.
            <br />
            Âm thanh sống động, đối thủ thứ thiệt, chiến thắng chờ bạn.
          </p>
        </div>

        {/* Right Side: Wallet Widget */}
        <div className="bg-[#0b141d]/75 border border-[#F4B942]/10 rounded-[1.5rem] p-4 flex items-center gap-4 w-full md:w-auto backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
            {/* Custom Premium Overlapping Coins Icon */}
            <div className="w-11 h-11 bg-[#E0942A] rounded-full flex items-center justify-center text-[#142019] shrink-0 shadow-lg relative">
              <div className="w-7 h-7 rounded-full border border-[#142019]/25 bg-gradient-to-br from-[#F4B942] to-[#C9861C] flex items-center justify-center font-black text-xs shadow-md">
                ¢
              </div>
              <div className="w-5.5 h-5.5 rounded-full border border-[#142019]/25 bg-gradient-to-br from-[#F4B942] to-[#C9861C] flex items-center justify-center font-black text-[9px] absolute right-1 bottom-1 shadow-md">
                ¢
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-[#F7EFDD]/40 font-bold uppercase tracking-wider">Số dư của bạn</span>
              <span className="text-xl font-black text-[#F4B942] tracking-tight">
                {parseInt(chipsBalance).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto sm:ml-4">
            <button
              onClick={onClaimFreeChips}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F4B942] to-[#E0942A] hover:brightness-110 text-[#142019] font-black text-xs transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              🔥 Nhận Chips Free
            </button>
            <button
              onClick={onCreateTableClick}
              className="w-10 h-10 rounded-xl bg-[#08121a]/80 hover:bg-[#08121a] text-[#F7EFDD] border border-[#F4B942]/10 flex items-center justify-center font-bold text-sm transition-all"
              title="Tạo bàn chơi"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Divider line */}
      <div className="w-full h-[1px] bg-white/5 my-7" />

      {/* Stats Row */}
      <div className="flex flex-col sm:flex-row justify-start gap-8 md:gap-16">
        {/* Stat 1: Online */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F4B942]/10 flex items-center justify-center text-[#F4B942] border border-[#F4B942]/15">
            <Users size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-widest">Trực tuyến</span>
            <span className="text-sm font-bold text-[#F7EFDD] tracking-wide">
              {lobbyStats.online_players.toLocaleString()} cao thủ
            </span>
          </div>
        </div>

        {/* Stat 2: Active Tables */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F4B942]/10 flex items-center justify-center text-[#F4B942] border border-[#F4B942]/15">
            <Activity size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-widest">Bàn đang mở</span>
            <span className="text-sm font-bold text-[#F7EFDD] tracking-wide">
              {lobbyStats.active_tables} bàn
            </span>
          </div>
        </div>

        {/* Stat 3: Daily Pot */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F4B942]/10 flex items-center justify-center text-[#F4B942] border border-[#F4B942]/15">
            <Trophy size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-widest">Hũ pot hôm nay</span>
            <span className="text-sm font-bold text-[#F7EFDD] tracking-wide">
              {formatChips(lobbyStats.total_jackpot_pot.toString())} Chips
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
