/**
 * @deprecated Removed in favor of unifying everything under SeatV2.tsx
 */
import React from 'react';
import { Player } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { fmt } from '../formatter';
import { PokerCard } from '../ui/PokerCard';

interface HeroSeatProps {
  player?: Player;
  seatNumber: number;
}

const HeroSeat: React.FC<HeroSeatProps> = ({ player, seatNumber }) => {
  if (!player) return null;

  return (
    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[15%] flex flex-col items-center z-40 pointer-events-auto">
      {/* Khay bọc da đen viền vàng đựng 2 lá bài */}
      <div className="relative w-[180px] h-[90px] md:w-[220px] md:h-[110px] bg-gradient-to-b from-[#2a2a2a] to-[#111] rounded-t-3xl border-t-[3px] border-l-[3px] border-r-[3px] border-[#F4B942] shadow-[0_-10px_25px_rgba(0,0,0,0.8)] flex items-end justify-center pb-4">
        {/* Lòng khay sâu hơn */}
        <div className="absolute inset-2 bg-black/60 rounded-t-xl shadow-[inset_0_5px_15px_rgba(0,0,0,1)] flex items-end justify-center pb-2">
           {player.cards && player.cards.length > 0 ? (
            <div className="flex -space-x-4 md:-space-x-6">
              <AnimatePresence>
                {player.cards.map((card, idx) => (
                  <motion.div
                    key={`hero-card-${idx}`}
                    initial={{ y: 20, rotate: idx === 0 ? -5 : 5, opacity: 0 }}
                    animate={{ y: 0, rotate: idx === 0 ? -10 : 10, opacity: 1 }}
                    className={`drop-shadow-2xl shadow-[0_5px_15px_rgba(0,0,0,0.5)] rounded-lg ${idx === 0 ? 'z-10' : 'z-20'}`}
                  >
                    <PokerCard
                      suit={card.suit as any}
                      rank={card.rank}
                      isFaceUp={true}
                      size="lg"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-white/30 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2">Waiting</div>
          )}
        </div>
      </div>

      {/* Bảng tên và số dư */}
      <div className="relative z-50 -mt-3 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#F4B942] rounded-full px-4 py-1.5 md:px-6 md:py-2 flex items-center gap-3 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-[#F4B942] flex items-center justify-center overflow-hidden">
           <div className="w-full h-full bg-[#333] flex items-center justify-center">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4B942" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
           </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[#F4B942] font-black text-[9px] md:text-[11px] uppercase tracking-wider leading-none">Hero</span>
          <span className="text-white font-bold text-xs md:text-[14px] leading-tight">{fmt(parseInt(player.chips || '0'))}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSeat;
