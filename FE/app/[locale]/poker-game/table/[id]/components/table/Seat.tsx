"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Player } from "../types";
import { usePokerGame } from "../hooks/usePokerGame";
import { useResponsive } from "../hooks/useResponsive";
import { PokerCard } from "../ui/PokerCard";
import { seatPositions } from "../constants";

interface SeatProps {
  player: Player;
}

const ACTION_STYLE: Record<string, string> = {
  Fold: "bg-rose-950/90 border-rose-500/60 text-rose-300",
  Check: "bg-slate-800/90 border-slate-600 text-slate-400",
};
function getActionStyle(action: string) {
  if (ACTION_STYLE[action]) return ACTION_STYLE[action];
  if (action.includes("Raise") || action.includes("Bet") || action.includes("All"))
    return "bg-amber-950/90 border-amber-500/60 text-amber-300";
  return "bg-emerald-950/90 border-emerald-500/60 text-emerald-300";
}

/** Position chip: D / SB / BB */
const PositionChip = ({ label, color }: { label: string; color: string }) => (
  <div
    className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black border border-slate-950 shadow-md z-20 ${color}`}
  >
    {label}
  </div>
);

export const Seat = memo(function Seat({ player }: SeatProps) {
  const { gameStage, cardDeckStyle, timerVal, maxTimerVal, formatChipsVal } =
    usePokerGame();
  const { isMobile } = useResponsive();

  const isHero = player.isHero;
  const pos = seatPositions[player.seatIndex];

  const chipDisplay = (() => {
    const n = parseInt(player.chips);
    if (isMobile)
      return n >= 1_000_000
        ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000
        ? `${Math.round(n / 1_000)}K`
        : String(n);
    return formatChipsVal(player.chips);
  })();

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
      style={{ top: pos.top, left: pos.left }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Hole cards — above panel */}
      {!player.isFolded && player.cards && player.cards.length > 0 && (
        <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 flex -space-x-2.5 z-30 pointer-events-none">
          {player.cards.map((card, cIdx) => (
            <PokerCard
              key={`hole-${player.id}-${cIdx}`}
              suit={card.suit}
              rank={card.rank}
              isFaceUp={isHero || gameStage === "showdown"}
              size={isMobile ? "sm" : isHero ? "md" : "sm"}
              deckStyle={cardDeckStyle}
              className={`shadow-lg ${
                cIdx === 0 ? "-rotate-6 translate-y-[2px]" : "rotate-6"
              }`}
            />
          ))}
        </div>
      )}

      {/* Player panel */}
      <div
        className={`
          relative bg-slate-950/95 border rounded-2xl flex items-center shadow-2xl
          transition-all duration-300
          ${isMobile ? "w-[72px] p-1 gap-1" : "w-28 md:w-32 p-1.5 md:p-2 gap-1.5 md:gap-2"}
          ${
            player.isActive
              ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.35)] scale-105"
              : player.isFolded
              ? "border-slate-800 opacity-35 grayscale"
              : player.hasAllIn
              ? "border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              : "border-slate-700"
          }
        `}
      >
        {/* Active timer bar */}
        {player.isActive && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div
              className="absolute bottom-0 left-0 h-[3px] bg-emerald-400 transition-all duration-1000"
              style={{ width: `${(timerVal / maxTimerVal) * 100}%` }}
            />
          </div>
        )}
        {/* Active glow ring animation */}
        {player.isActive && (
          <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/50 animate-pulse pointer-events-none" />
        )}

        {/* Avatar + position badges */}
        <div className="relative shrink-0">
          <div
            className={`rounded-xl bg-slate-900 border overflow-hidden flex items-center justify-center
              ${isMobile ? "w-7 h-7" : "w-8 h-8 md:w-10 md:h-10"}
              ${player.isActive ? "border-emerald-400" : "border-slate-700"}
            `}
          >
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.name}
                className={`w-full h-full object-cover ${player.lastAction === "MẤT MẠNG" ? "opacity-30 blur-[1px]" : ""}`}
              />
            ) : (
              <User size={isMobile ? 10 : 12} className="text-slate-500" />
            )}
            {player.lastAction === "MẤT MẠNG" && (
              <div className="absolute inset-0 bg-rose-950/80 flex items-center justify-center text-[7px] md:text-[8px] font-black text-rose-300 uppercase select-none animate-pulse">
                Offline
              </div>
            )}
          </div>
          {/* D / SB / BB badge — only one can show */}
          {player.isDealer && (
            <PositionChip label="D" color="bg-amber-400 text-slate-950" />
          )}
          {player.isSmallBlind && !player.isDealer && (
            <PositionChip label="SB" color="bg-blue-500 text-white" />
          )}
          {player.isBigBlind && !player.isDealer && (
            <PositionChip label="BB" color="bg-violet-500 text-white" />
          )}
        </div>

        {/* Name + chips */}
        <div className="min-w-0 flex-1">
          {!isMobile && (
            <p className="text-[9px] md:text-[10px] font-black text-slate-200 truncate leading-tight uppercase tracking-wide">
              {player.name}
            </p>
          )}
          <p
            className={`font-bold text-amber-400 leading-tight ${
              isMobile ? "text-[8px]" : "text-[9px] md:text-[10px] mt-0.5"
            }`}
          >
            {chipDisplay}
          </p>
          {player.hasAllIn && (
            <p className="text-[7px] font-black text-amber-500 uppercase">ALL-IN</p>
          )}
        </div>
      </div>

      {/* Action badge — hidden for hero (shown in ActionBar instead) */}
      {player.lastAction && !isHero && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute -bottom-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md
            text-[8px] font-black uppercase tracking-wider border shadow-md whitespace-nowrap
            ${getActionStyle(player.lastAction)}`}
        >
          {player.lastAction}
        </motion.div>
      )}
    </motion.div>
  );
});
