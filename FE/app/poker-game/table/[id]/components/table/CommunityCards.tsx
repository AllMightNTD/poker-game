"use client";

import React, { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePokerGame } from "../hooks/usePokerGame";
import { PokerCard } from "../ui/PokerCard";
import { audioEngine } from "../utils/audio";

export const CommunityCards = memo(function CommunityCards() {
  const { communityCards, cardDeckStyle } = usePokerGame();

  useEffect(() => {
    if (communityCards && communityCards.length > 0) {
      // Play a sound for the newly dealt cards. We only play one sound to avoid overlapping mess.
      audioEngine.playDealCard();
    }
  }, [communityCards.length]);

  const TOTAL_SLOTS = 5;
  const emptyCount = TOTAL_SLOTS - communityCards.length;

  return (
    <div className="flex items-center gap-2 md:gap-2.5 py-2">
      <AnimatePresence mode="popLayout">
        {communityCards.map((card, idx) => (
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
            className="w-[56px] h-[80px] sm:w-[64px] sm:h-[90px] md:w-[84px] md:h-[120px] rounded-lg border-2 border-[#FDF1BA]/20 bg-black/20 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),_0_0_10px_rgba(253,241,186,0.1)] flex items-center justify-center backdrop-blur-sm transition-all"
          >
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
});
