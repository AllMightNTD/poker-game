import React from 'react';

interface SeatInfoProps {
  name: string;
  chips: number;
  isHero: boolean;
  isMobile: boolean;
  status: string;
  isBot: boolean;
}

const SeatInfo: React.FC<SeatInfoProps> = React.memo(({ name, chips, isHero, isMobile, status, isBot }) => {
  const formatChipsVal = (val: string | number) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(num)) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return num.toString();
  };

  return (
    <div className="relative z-10 -mt-2 bg-[#1a1a1a]/90 border border-[#4FC3F7] rounded-full px-3 py-1 flex flex-col items-center justify-center min-w-[80px] shadow-lg backdrop-blur-md">
      <span className={`font-bold truncate leading-none uppercase
        ${isHero ? "text-amber-400" : "text-white"}
        ${isMobile ? "text-[8px]" : "text-[10px]"}`}
      >
        {name}
        {isBot && <span className="ml-1 px-1 py-0.5 rounded text-[7px] bg-slate-700 text-slate-300">BOT</span>}
      </span>
      <span className={`font-black text-[#4FC3F7] truncate leading-none mt-0.5
        ${isMobile ? "text-[9px]" : "text-[11px]"}`}
      >
        {status === 'sitting_out' ? 'Sit Out' : status === 'disconnected' ? 'Mất mạng' : formatChipsVal(chips)}
      </span>
    </div>
  );
});
SeatInfo.displayName = 'SeatInfo';
export default SeatInfo;
