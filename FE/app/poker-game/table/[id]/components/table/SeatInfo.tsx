import React from 'react';
import { GoldPanel } from '../ui/GoldPanel';

interface SeatInfoProps {
  name: string;
  chips: number;
  isHero: boolean;
  isMobile: boolean;
  status: string;
  isBot: boolean;
  isActive?: boolean;
}

const SeatInfo: React.FC<SeatInfoProps> = React.memo(({ name, chips, isHero, isMobile, status, isBot, isActive }) => {
  const formatChipsVal = (val: string | number) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(num)) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return num.toString();
  };

  const isSittingOut = status === 'Sit Out';
  const isDisconnected = status === 'Disconnected';
  const isWaiting = status === 'Waiting';

  return (
    <GoldPanel 
      active={isActive}
      className="relative z-10 -mt-3 px-4 py-1.5 flex flex-col items-center justify-center min-w-[100px] md:min-w-[125px] bg-[#070b09]/95 border-[#F4B942]/40 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.85)]"
    >
      <span className={`font-black tracking-wider truncate leading-none uppercase max-w-[90px] md:max-w-[110px] text-center
        ${isHero ? "text-[#F5C86C]" : "text-white/90"}
        ${isMobile ? "text-[8.5px]" : "text-[10px]"}`}
      >
        {name}
        {isBot && <span className="ml-1 px-1 py-0.5 rounded text-[7px] bg-amber-950 text-amber-300 border border-amber-500/20">BOT</span>}
      </span>
      <span className={`font-black text-[#F4B942] truncate leading-none mt-1.5 tracking-wide
        ${isMobile ? "text-[10px]" : "text-[12px]"}`}
      >
        ${formatChipsVal(chips)}
      </span>

      {(isSittingOut || isDisconnected || isWaiting) && (
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[7px] font-black uppercase whitespace-nowrap shadow-md border border-[#F4B942]/20
          ${isSittingOut ? 'bg-slate-700 text-slate-300' : isDisconnected ? 'bg-rose-700 text-rose-200' : 'bg-amber-600 text-amber-100'}
        `}>
          {isSittingOut ? 'SIT OUT' : isDisconnected ? 'DISCONNECTED' : 'WAITING'}
        </div>
      )}
    </GoldPanel>
  );
});
SeatInfo.displayName = 'SeatInfo';
export default SeatInfo;
