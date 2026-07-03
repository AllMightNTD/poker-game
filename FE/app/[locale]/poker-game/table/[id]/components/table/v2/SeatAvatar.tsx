import React from 'react';

interface SeatAvatarProps {
  avatarUrl: string;
  isFolded: boolean;
  isActive: boolean;
  isHero: boolean;
  sizeClass: string;
}

const SeatAvatar: React.FC<SeatAvatarProps> = React.memo(({ avatarUrl, isFolded, isActive, isHero, sizeClass }) => {
  return (
    <div className={`relative rounded-full p-[3px] z-20 transition-all duration-300
      ${isActive 
        ? 'bg-gradient-to-b from-[#F4B942] to-[#E0942A] shadow-[0_0_20px_rgba(244,185,66,0.8),_inset_0_0_10px_rgba(0,0,0,0.5)] scale-110' 
        : 'bg-gradient-to-b from-[#4FC3F7] to-[#0288D1] shadow-[0_0_15px_rgba(79,195,247,0.6)]'
      }
    `}>
      <div className={`${sizeClass} rounded-full overflow-hidden bg-[#111] flex items-center justify-center border-[2px] border-black`}>
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className={`w-full h-full object-cover transition-all duration-300 ${isFolded ? 'grayscale opacity-40' : ''}`}
        />
      </div>
    </div>
  );
});
SeatAvatar.displayName = 'SeatAvatar';
export default SeatAvatar;
