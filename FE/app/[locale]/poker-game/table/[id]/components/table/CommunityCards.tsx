"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePokerGame } from "../hooks/usePokerGame";
import { PokerCard } from "../ui/PokerCard";

export const CommunityCards = memo(function CommunityCards() {
  const { communityCards, cardDeckStyle } = usePokerGame();

  const TOTAL_SLOTS = 5;
  const emptyCount = TOTAL_SLOTS - communityCards.length;

  return (
    <div className="flex items-center gap-2 md:gap-2.5 py-2">
      <AnimatePresence mode="popLayout">
        {communityCards.map((card, idx) => (
          <motion.div
            key={`${card.rank}-${card.suit}-${idx}`}
            initial={{ scale: 0, rotateY: 90, opacity: 0, y: -10 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 14,
              delay: idx * 0.06,
            }}
            className="relative"
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
            className="w-[56px] h-[80px] md:w-[70px] md:h-[100px] rounded-lg border-2 border-dashed border-emerald-500/10 bg-emerald-950/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center"
          >
            <span className="text-emerald-500/20 text-[9px] font-black uppercase tracking-wider">?</span>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
});
