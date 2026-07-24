import React from 'react';
import { Crown } from 'lucide-react';

interface SeatAvatarProps {
  avatarUrl: string;
  isFolded: boolean;
  isActive: boolean;
  isHero: boolean;
  sizeClass: string;
  isSittingOut?: boolean;
}

const SeatAvatar: React.FC<SeatAvatarProps> = React.memo(({ avatarUrl, isFolded, isActive, sizeClass, isSittingOut }) => {
  return (
    <div className="relative">
      {/* Premium Gold Crown */}
      {!isFolded && !isSittingOut && (
        <div className="absolute -top-2 -left-2 text-[#F4B942] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] rotate-[-15deg] z-30">
          <Crown className="w-5 h-5 fill-current" />
        </div>
      )}
      <div className={`relative rounded-full p-[2.5px] z-20 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-b from-[#ffe58f] to-[#F4B942] shadow-[0_0_25px_rgba(244,185,66,0.9),_inset_0_0_10px_rgba(0,0,0,0.5)] scale-110' 
          : isSittingOut
            ? 'bg-slate-700/50 shadow-none'
            : 'bg-gradient-to-b from-[#F4B942]/70 to-[#E0942A]/40 shadow-[0_0_8px_rgba(244,185,66,0.25)]'
        }
      `}>
        <div className={`${sizeClass} rounded-full overflow-hidden bg-[#111] flex items-center justify-center border-[2px] border-black relative`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className={`w-full h-full object-cover transition-all duration-300 ${isFolded || isSittingOut ? 'grayscale opacity-35' : ''}`}
          />
          {isSittingOut && (
            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center z-10">
              <span className="text-[7px] sm:text-[8px] font-black text-amber-400 tracking-wider bg-slate-900/90 border border-amber-500/30 px-1 py-0.5 rounded-full uppercase leading-none scale-90 sm:scale-100">
                AWAY
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
SeatAvatar.displayName = 'SeatAvatar';
export default SeatAvatar;
