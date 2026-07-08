import React from "react";
import { Sparkles, Coins, Flame, Plus, Users, Activity, Trophy } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#16594A] via-[#0F4438] to-[#0B3D2E] border-2 border-[#F4B942]/20 p-6 md:p-9 shadow-2xl">
      {/* subtle felt weave texture */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #F7EFDD 0, #F7EFDD 1px, transparent 1px, transparent 12px)",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4B942]/15 border border-[#F4B942]/30 text-[#F4B942] text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} className="animate-pulse" />
            Sảnh Game Poker
          </div>
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight text-[#F7EFDD]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Texas Hold&apos;em Club
          </h1>
          <p className="text-[#F7EFDD]/70 text-sm md:text-base max-w-md leading-relaxed">
            Ngồi vào bàn, rút bài, và để may mắn dẫn lối. Âm thanh sống động, đối thủ thứ thiệt, chiến thắng chờ bạn.
          </p>
        </div>

        {/* User Chips Wallet Status Widget */}
        <div className="bg-[#0B3D2E]/70 border border-[#F4B942]/25 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F4B942] to-[#C9861C] rounded-full flex items-center justify-center text-[#142019] shrink-0 shadow-lg shadow-[#F4B942]/20 ring-2 ring-[#F4B942]/30">
              <Coins size={22} />
            </div>
            <div>
              <span className="text-[10px] text-[#F7EFDD]/50 font-bold block uppercase tracking-wider">Số dư của bạn</span>
              <span className="text-xl font-black text-[#F4B942] tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {parseInt(chipsBalance).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClaimFreeChips}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F4B942] to-[#E0942A] hover:brightness-110 text-[#142019] font-black text-xs transition-all shadow-md shadow-[#F4B942]/20 active:scale-95 whitespace-nowrap flex items-center gap-1.5"
            >
              <Flame size={13} />
              Nhận Chips Free
            </button>
            <button
              onClick={onCreateTableClick}
              className="px-3 py-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#0B3D2E]/70 text-[#F7EFDD] border border-[#F4B942]/25 font-bold text-xs transition-all flex items-center justify-center"
              title="Tạo bàn chơi"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mt-7 pt-6 border-t border-[#F4B942]/15 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#F4B942]/10 flex items-center justify-center text-[#F4B942]">
            <Users size={15} />
          </div>
          <div>
            <span className="text-[10px] text-[#F7EFDD]/50 block uppercase font-bold tracking-wider">Trực tuyến</span>
            <span className="text-xs md:text-sm font-bold text-[#F7EFDD]">
              {lobbyStats.online_players.toLocaleString()} cao thủ
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#F4B942]/10 flex items-center justify-center text-[#F4B942]">
            <Activity size={15} />
          </div>
          <div>
            <span className="text-[10px] text-[#F7EFDD]/50 block uppercase font-bold tracking-wider">Bàn đang mở</span>
            <span className="text-xs md:text-sm font-bold text-[#F7EFDD]">
              {lobbyStats.active_tables} bàn
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#F4B942]/10 flex items-center justify-center text-[#F4B942]">
            <Trophy size={15} />
          </div>
          <div>
            <span className="text-[10px] text-[#F7EFDD]/50 block uppercase font-bold tracking-wider">Hũ pot hôm nay</span>
            <span className="text-xs md:text-sm font-bold text-[#F7EFDD]">
              {formatChips(lobbyStats.total_jackpot_pot.toString())} Chips
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
