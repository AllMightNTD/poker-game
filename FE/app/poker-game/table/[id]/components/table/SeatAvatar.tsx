import React from 'react';
import { Crown } from 'lucide-react';

interface SeatAvatarProps {
  avatarUrl: string;
  isFolded: boolean;
  isActive: boolean;
  isHero: boolean;
  sizeClass: string;
}

const SeatAvatar: React.FC<SeatAvatarProps> = React.memo(({ avatarUrl, isFolded, isActive, sizeClass }) => {
  return (
    <div className="relative">
      {/* Premium Gold Crown */}
      {!isFolded && (
        <div className="absolute -top-2 -left-2 text-[#F4B942] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] rotate-[-15deg] z-30">
          <Crown className="w-5 h-5 fill-current" />
        </div>
      )}
      <div className={`relative rounded-full p-[2.5px] z-20 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-b from-[#4ade80] to-[#16a34a] shadow-[0_0_20px_rgba(74,222,128,0.8),_inset_0_0_10px_rgba(0,0,0,0.5)] scale-110' 
          : 'bg-gradient-to-b from-[#F4B942] to-[#E0942A] shadow-[0_0_12px_rgba(244,185,66,0.5)]'
        }
      `}>
        <div className={`${sizeClass} rounded-full overflow-hidden bg-[#111] flex items-center justify-center border-[2px] border-black`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className={`w-full h-full object-cover transition-all duration-300 ${isFolded ? 'grayscale opacity-40' : ''}`}
          />
        </div>
      </div>
    </div>
  );
});
SeatAvatar.displayName = 'SeatAvatar';
export default SeatAvatar;
