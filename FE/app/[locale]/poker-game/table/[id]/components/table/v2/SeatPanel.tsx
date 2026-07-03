import React from 'react';

interface SeatPanelProps {
  children: React.ReactNode;
  isActive: boolean;
  isHero: boolean;
  isFolded: boolean;
}

const SeatPanel: React.FC<SeatPanelProps> = React.memo(({ children, isActive, isHero, isFolded }) => {
  return (
    <div 
      className={`
        relative flex flex-col items-center gap-1 md:gap-2 w-full
        transition-all duration-300
        ${isFolded ? 'opacity-60' : ''}
        ${isActive ? 'z-50' : 'z-20'}
      `}
    >
      {children}
    </div>
  );
});
SeatPanel.displayName = 'SeatPanel';
export default SeatPanel;
