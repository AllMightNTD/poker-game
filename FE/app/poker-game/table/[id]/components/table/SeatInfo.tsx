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

  const isSittingOut = status === 'Sit Out';
  const isDisconnected = status === 'Mất mạng';
  const isWaiting = status === 'Waiting';

  return (
    <div className="relative z-10 -mt-2 bg-[#0a0a0a]/95 border border-[#F4B942]/60 rounded-md px-3 py-1 flex flex-col items-center justify-center min-w-[85px] shadow-[0_0_8px_rgba(244,185,66,0.15)] backdrop-blur-md">
      <span className={`font-bold truncate leading-none uppercase max-w-[80px] md:max-w-[100px]
        ${isHero ? "text-amber-300" : "text-white"}
        ${isMobile ? "text-[8px]" : "text-[10px]"}`}
      >
        {name}
        {isBot && <span className="ml-1 px-1 py-0.5 rounded text-[7px] bg-amber-950 text-amber-300 border border-amber-500/20">BOT</span>}
      </span>
      <span className={`font-black text-[#F4B942] truncate leading-none mt-1
        ${isMobile ? "text-[9px]" : "text-[11px]"}`}
      >
        ${formatChipsVal(chips)}
      </span>

      {(isSittingOut || isDisconnected || isWaiting) && (
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[7px] font-black uppercase whitespace-nowrap shadow-md
          ${isSittingOut ? 'bg-slate-700 text-slate-300' : isDisconnected ? 'bg-rose-700 text-rose-200' : 'bg-amber-600 text-amber-100'}
        `}>
          {isSittingOut ? 'SIT OUT' : isDisconnected ? 'DISCONNECTED' : 'WAITING'}
        </div>
      )}
    </div>
  );
});
SeatInfo.displayName = 'SeatInfo';
export default SeatInfo;
