import React from 'react';

interface SeatNameProps {
  name: string;
  isHero: boolean;
  isMobile: boolean;
  isBot: boolean;
  status: string;
}

const SeatName: React.FC<SeatNameProps> = React.memo(({ name, isHero, isMobile, isBot, status }) => {
  const isSittingOut = status === 'Sit Out';
  const isDisconnected = status === 'Disconnected';
  const isWaiting = status === 'Waiting';
  const showStatus = isSittingOut || isDisconnected || isWaiting;

  return (
    <div className="flex flex-col items-center justify-center min-w-[80px] md:min-w-[100px] mb-1 z-20">
      <div className={`font-black tracking-wider truncate leading-none uppercase max-w-[90px] md:max-w-[110px] text-center px-2 py-1 rounded-md shadow-sm border border-white/5
        ${isHero ? "text-[#F5C86C] bg-[#070b09]/90" : "text-white/90 bg-[#070b09]/80"}
        ${isMobile ? "text-[8.5px]" : "text-[10.5px]"}`}
      >
        {name}
        {isBot && <span className="ml-1 px-1 py-0.5 rounded text-[7px] bg-amber-950 text-amber-300 border border-amber-500/20">BOT</span>}
      </div>

      {showStatus && (
        <div className={`mt-0.5 px-2 py-0.5 rounded text-[7px] font-black uppercase whitespace-nowrap shadow-md border border-[#F4B942]/20
          ${isSittingOut ? 'bg-slate-700 text-slate-300' : isDisconnected ? 'bg-rose-700 text-rose-200' : 'bg-amber-600 text-amber-100'}
        `}>
          {isSittingOut ? 'SIT OUT' : isDisconnected ? 'DISCONNECTED' : 'WAITING'}
        </div>
      )}
    </div>
  );
});
SeatName.displayName = 'SeatName';
export default SeatName;
