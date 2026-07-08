"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card } from "../types";
import { usePokerGame } from "../hooks/usePokerGame";
import { useCurrentUser } from "@/core/providers/user-provider";
import { useResponsive } from "../hooks/useResponsive";
import { PokerCard } from "../ui/PokerCard";
import { CircularTimer } from "../ui/Timer";

/* ── Simple hand evaluator ── */
const RANK_VAL: Record<string, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 9, "10": 10, J: 11, Q: 12, K: 13, A: 14,
};

function evaluateHand(hole: Card[], board: Card[]): string | null {
  if (hole.length < 2) return null;
  const all = [...hole, ...board];
  const ranks = all.map((c) => c.rank);
  const suits = all.map((c) => c.suit);

  // Count ranks
  const rc: Record<string, number> = {};
  ranks.forEach((r) => (rc[r] = (rc[r] || 0) + 1));
  const counts = Object.values(rc).sort((a, b) => b - a);

  // Count suits
  const sc: Record<string, number> = {};
  suits.forEach((s) => (sc[s] = (sc[s] || 0) + 1));
  const hasFlush = Object.values(sc).some((c) => c >= 5);

  // Straight check
  const uniqueVals = [
    ...new Set(ranks.map((r) => RANK_VAL[r] || 0)),
  ].sort((a, b) => a - b);
  let hasStraight = false;
  for (let i = 0; i <= uniqueVals.length - 5; i++) {
    if (uniqueVals[i + 4] - uniqueVals[i] === 4) { hasStraight = true; break; }
  }
  // Wheel straight A-2-3-4-5
  if (!hasStraight && uniqueVals.includes(14) &&
    [2, 3, 4, 5].every((v) => uniqueVals.includes(v))) hasStraight = true;

  const isBroadway =
    [10, 11, 12, 13, 14].every((v) => uniqueVals.includes(v));

  if (hasFlush && isBroadway) return "Thùng Hoàng Gia 🏆";
  if (hasFlush && hasStraight) return "Thùng Sảnh 🔥";
  if (counts[0] >= 4) return "Tứ Quý (4 of a Kind)";
  if (counts[0] >= 3 && counts[1] >= 2) return "Cù Lũ (Full House)";
  if (hasFlush) return "Thùng (Flush)";
  if (hasStraight) {
    if (isBroadway) return "Sảnh Broadway (A-K-Q-J-10)";
    return "Sảnh (Straight)";
  }
  if (counts[0] >= 3) {
    const rank = Object.entries(rc).find(([, c]) => c >= 3)?.[0];
    return `Bộ Ba ${rank ?? ""}`;
  }
  if (counts[0] >= 2 && counts[1] >= 2) return "Hai Đôi (Two Pair)";
  if (counts[0] >= 2) {
    const rank = Object.entries(rc).find(([, c]) => c >= 2)?.[0];
    return `Đôi ${rank ?? ""}`;
  }
  // High card
  const hi = ranks.reduce((a, b) =>
    (RANK_VAL[a] || 0) >= (RANK_VAL[b] || 0) ? a : b
  );
  return `Bài Cao ${hi}`;
}

export const HeroPanel: React.FC = () => {
  const { currentUser } = useCurrentUser();
  const { isMobile } = useResponsive();
  const { players, timerVal, maxTimerVal, cardDeckStyle, communityCards, formatChipsVal } =
    usePokerGame();

  const hero = players.find((p) => p.id === "hero");
  if (!hero) return null;

  const heroCards = hero.cards ?? [];
  const isHeroActive = hero.isActive;
  const handLabel = evaluateHand(heroCards, communityCards);

  const timerPct = (timerVal / maxTimerVal) * 100;
  const timerColor =
    timerPct > 50 ? "bg-emerald-500" : timerPct > 25 ? "bg-amber-500" : "bg-rose-500";

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`shrink-0 border-t border-slate-800/60 bg-slate-950/98
        ${isMobile ? "px-3 py-2" : "px-4 py-2.5"}`}
    >
      {/* Active turn indicator strip */}
      {isHeroActive && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-0.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className={`h-full ${timerColor} transition-all duration-1000`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider animate-pulse shrink-0">
            Lượt của bạn!
          </span>
          <div className="flex-1 h-0.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className={`h-full ${timerColor} transition-all duration-1000 ml-auto`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Avatar + circular timer */}
        <div className="relative shrink-0">
          <div
            className={`rounded-xl bg-slate-900 border overflow-hidden flex items-center justify-center
              ${isMobile ? "w-9 h-9" : "w-11 h-11"}
              ${isHeroActive ? "border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]" : "border-slate-700"}
            `}
          >
            {currentUser?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentUser.avatar} alt="You" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-400 text-lg">👤</span>
            )}
          </div>
          {isHeroActive && (
            <div className="absolute -bottom-2.5 -right-2.5">
              <CircularTimer value={timerVal} max={maxTimerVal} size="sm" />
            </div>
          )}
        </div>

        {/* Hole cards */}
        {heroCards.length > 0 && !hero.isFolded && (
          <div className="flex -space-x-2 shrink-0">
            {heroCards.map((card, i) => (
              <PokerCard
                key={i}
                suit={card.suit}
                rank={card.rank}
                isFaceUp
                size={isMobile ? "sm" : "md"}
                deckStyle={cardDeckStyle}
                className={`transform shadow-lg hover:z-10 hover:scale-110 transition-transform ${
                  i === 0 ? "-rotate-3" : "rotate-3"
                }`}
              />
            ))}
          </div>
        )}

        {/* Hero info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-black text-slate-100 uppercase tracking-wide truncate
              ${isMobile ? "text-[10px]" : "text-xs"}`}>
              {currentUser?.name || currentUser?.username || "Hero (Bạn)"}
            </p>
            {hero.isBigBlind && (
              <span className="px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[7px] font-black uppercase shrink-0">BB</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className={`font-bold text-amber-400 ${isMobile ? "text-[9px]" : "text-[10px]"}`}>
              💰 {formatChipsVal(hero.chips)}
            </p>

            {/* Hand strength badge */}
            {handLabel && !hero.isFolded && communityCards.length > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 truncate">
                <Sparkles size={9} className="shrink-0" />
                {handLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
