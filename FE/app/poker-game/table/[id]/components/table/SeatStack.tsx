import React from 'react';
import { GoldPanel } from '../ui/GoldPanel';

interface SeatStackProps {
  chips: number;
  isMobile: boolean;
  isActive?: boolean;
}

const SeatStack: React.FC<SeatStackProps> = React.memo(({ chips, isMobile, isActive }) => {
  const formatChipsVal = (val: string | number) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(num)) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return num.toString();
  };

  return (
    <GoldPanel 
      active={isActive}
      className="relative z-20 mt-1 px-3 py-1 flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px] bg-[#070b09]/95 border-[#F4B942]/40 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.85)]"
    >
      <span className={`font-black text-[#F4B942] truncate leading-none tracking-wide
        ${isMobile ? "text-[9.5px]" : "text-[11.5px]"}`}
      >
        ${formatChipsVal(chips)}
      </span>
    </GoldPanel>
  );
});
SeatStack.displayName = 'SeatStack';
export default SeatStack;
