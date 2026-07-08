"use client";

import React, { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePokerGame } from "../hooks/usePokerGame";
import { PokerCard } from "../ui/PokerCard";
import { audioEngine } from "../utils/audio";

export const CommunityCards = memo(function CommunityCards() {
  const { communityCards, ritBoard2Cards, cardDeckStyle, isBombPot } = usePokerGame();

  useEffect(() => {
    if (communityCards && communityCards.length > 0) {
      // Play a sound for the newly dealt cards. We only play one sound to avoid overlapping mess.
      audioEngine.playDealCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityCards.length]);

  const TOTAL_SLOTS = 5;

  const renderBoard = (cards: typeof communityCards, label?: string) => {
    const emptyCount = TOTAL_SLOTS - cards.length;
    return (
      <div className="flex flex-col items-center gap-1">
        {label && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FDF1BA]/50 bg-black/40 px-2 py-0.5 rounded">
            {label}
          </span>
        )}
        <div className="flex items-center gap-1.5 md:gap-2 py-1">
          <AnimatePresence mode="popLayout">
            {cards.map((card, idx) => (
              <motion.div
                key={`${card.rank}-${card.suit}-${idx}`}
                initial={{ scale: 0.2, x: 0, y: -150 }} // Start from deck (approximate)
                animate={{ scale: 1, x: 0, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 18,
                  delay: idx * 0.1,
                }}
                className="relative shadow-[0_5px_15px_rgba(0,0,0,0.5)] rounded-lg"
              >
                <PokerCard
                  suit={card.suit}
                  rank={card.rank}
                  isFaceUp={true}
                  size="lg"
                  deckStyle={cardDeckStyle}
                  className="hover:scale-110 transition-transform duration-150"
                />
                {/* Subtle glow on community cards */}
                <div className="absolute inset-0 rounded-lg shadow-[0_0_8px_rgba(245,158,11,0.15)] pointer-events-none" />
              </motion.div>
            ))}

            {/* Empty placeholders */}
            {Array.from({ length: emptyCount }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-[48px] h-[68px] sm:w-[56px] sm:h-[80px] md:w-[72px] md:h-[102px] rounded-lg border border-[#FDF1BA]/20 bg-black/25 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-center backdrop-blur-sm transition-all"
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const hasRit = ritBoard2Cards && ritBoard2Cards.length > 0;

  return (
    <div className="flex flex-col gap-2 py-2 items-center">
      {isBombPot && (
        <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          💣 BOMB POT ACTIVE
        </div>
      )}
      <div className={`flex ${hasRit ? 'flex-col sm:flex-row gap-4 sm:gap-6' : 'flex-row'} items-center justify-center`}>
        {renderBoard(communityCards, hasRit ? "Board 1" : undefined)}
        {hasRit && renderBoard(ritBoard2Cards, "Board 2")}
      </div>
    </div>
  );
});
