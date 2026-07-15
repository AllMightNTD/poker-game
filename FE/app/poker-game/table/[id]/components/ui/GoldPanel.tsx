import React from 'react';

interface GoldPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
}

export const GoldPanel: React.FC<GoldPanelProps> = ({ children, active, className = '', ...props }) => {
  return (
    <div
      className={`bg-black/80 backdrop-blur-md border border-[#F4B942]/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] transition-all duration-300 ${
        active ? 'border-[#F4B942]/80 shadow-[0_0_20px_rgba(244,185,66,0.45)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
