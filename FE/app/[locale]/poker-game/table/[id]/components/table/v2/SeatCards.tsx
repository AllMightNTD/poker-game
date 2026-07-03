import React, { useEffect } from 'react';
import { PokerCard } from '../../ui/PokerCard';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from '../../utils/audio';

interface Card {
  suit: 'H' | 'D' | 'S' | 'C' | 'back' | '?' | string;
  rank: string;
}

interface SeatCardsProps {
  cards: Card[];
  isFolded: boolean;
  isHero: boolean;
  gameStage: string;
  isMobile: boolean;
  flyVector?: { x: number, y: number };
  seatIndex?: number;
}

const SeatCards: React.FC<SeatCardsProps> = React.memo(({ cards, isFolded, isHero, gameStage, isMobile, flyVector = { x: 0, y: 0 }, seatIndex = 1 }) => {
  // Play sound when cards are dealt
  useEffect(() => {
    if (cards && cards.length > 0) {
      setTimeout(() => audioEngine.playDealCard(), seatIndex * 100);
    }
  }, [cards, seatIndex]);

  useEffect(() => {
    if (isFolded) {
      audioEngine.playFold();
    }
  }, [isFolded]);

  if (!cards || cards.length === 0) return null;

  const cardSize = isHero ? (isMobile ? "md" : "lg") : (isMobile ? "sm" : "md");

  return (
    <div className={`absolute -top-[22px] md:-top-[40px] left-1/2 -translate-x-1/2 flex -space-x-2.5 md:-space-x-6 z-30 pointer-events-none transition-all duration-300 ${isFolded ? 'opacity-40 grayscale translate-y-2' : ''}`}>
      <AnimatePresence>
        {cards.map((card, cIdx) => (
          <motion.div
            key={`hole-${cIdx}-${card.suit}-${card.rank}`}
            initial={{ opacity: 0, x: flyVector.x, y: flyVector.y, scale: 0.2, rotate: 180 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: cIdx === 0 ? -6 : 6 }}
            exit={{ opacity: 0, y: -20, scale: 0.5 }}
            transition={{ 
              duration: 0.4, 
              delay: (seatIndex * 0.1) + (cIdx * 0.15), // Deal around the table
              ease: "easeOut" 
            }}
            style={{ y: cIdx === 0 ? 2 : 0 }} // The translate-y from original CSS
            className="shadow-[0_5px_15px_rgba(0,0,0,0.5)] rounded-lg"
          >
            <PokerCard
              suit={card.suit as any}
              rank={card.rank}
              isFaceUp={isHero || card.suit !== "back"}
              size={cardSize}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
SeatCards.displayName = 'SeatCards';
export default SeatCards;
