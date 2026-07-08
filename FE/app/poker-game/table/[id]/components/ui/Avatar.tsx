"use client";

import React from "react";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  isActive?: boolean;
  isDealer?: boolean;
  isFolded?: boolean;
  hasAllIn?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 rounded-lg",
  sm: "w-8 h-8 rounded-xl",
  md: "w-10 h-10 rounded-xl",
  lg: "w-14 h-14 rounded-2xl",
};

const iconSizeMap = {
  xs: 10,
  sm: 14,
  md: 16,
  lg: 22,
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md",
  isActive = false,
  isDealer = false,
  isFolded = false,
  hasAllIn = false,
  className = "",
}) => {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`
          ${sizeMap[size]}
          bg-slate-900 border overflow-hidden flex items-center justify-center transition-all duration-300
          ${isActive
            ? "border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)] ring-2 ring-emerald-500/40"
            : isFolded
            ? "border-slate-800 opacity-40 grayscale"
            : hasAllIn
            ? "border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
            : "border-slate-700"
          }
        `}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name || "Player"} className="w-full h-full object-cover" />
        ) : (
          <User size={iconSizeMap[size]} className="text-slate-400" />
        )}
      </div>

      {/* Dealer button */}
      {isDealer && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 border border-slate-950 flex items-center justify-center shadow-md z-10">
          <span className="text-[7px] font-black text-slate-950">D</span>
        </div>
      )}

      {/* All-In badge */}
      {hasAllIn && (
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-amber-500 border border-slate-950 z-10">
          <span className="text-[6px] font-black text-slate-950 uppercase tracking-wider">ALL IN</span>
        </div>
      )}

      {/* Active pulse ring */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl animate-ping border-2 border-emerald-400/30 pointer-events-none" />
      )}
    </div>
  );
};
