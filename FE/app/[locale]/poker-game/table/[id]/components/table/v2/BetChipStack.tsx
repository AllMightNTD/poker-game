import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from '../../utils/audio';

interface BetChipStackProps {
  amount: number;
  throwVector?: { x: number, y: number };
}

// Convert amount into physical chip denominations
const getChipStack = (amount: number) => {
  const stack = [];
  let remaining = amount;
  const denoms = [10000, 5000, 1000, 500, 100, 50, 10]; // High to low
  const colors: Record<number, string> = {
    10000: "bg-fuchsia-600 border-fuchsia-400",
    5000: "bg-cyan-600 border-cyan-400",
    1000: "bg-amber-500 border-amber-300",
    500: "bg-purple-600 border-purple-400",
    100: "bg-slate-800 border-slate-600",
    50: "bg-blue-600 border-blue-400",
    10: "bg-rose-600 border-rose-400"
  };

  for (const d of denoms) {
    while (remaining >= d && stack.length < 10) { // Limit max 10 chips visually
      stack.push({ value: d, color: colors[d] });
      remaining -= d;
    }
  }
  // If anything remains (e.g. smaller than 10) or stack is empty but amount > 0
  if (remaining > 0 && stack.length === 0) {
    stack.push({ value: remaining, color: "bg-emerald-600 border-emerald-400" });
  }

  return stack;
};

const BetChipStack: React.FC<BetChipStackProps> = React.memo(({ amount, throwVector = { x: 0, y: -40 } }) => {
  const formatVal = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return val.toString();
  };

  const chips = useMemo(() => getChipStack(amount), [amount]);

  // Play sound when amount changes (i.e., new bet thrown)
  useEffect(() => {
    if (amount > 0) {
      audioEngine.playChipClink();
    }
  }, [amount]);

  return (
    <AnimatePresence>
      {amount > 0 && (
        <motion.div 
          key={amount}
          initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            x: throwVector.x, 
            // Parabol effect: arc upwards by 60px then land
            y: [0, throwVector.y < 0 ? throwVector.y - 40 : throwVector.y - 60, throwVector.y] 
          }}
          exit={{ opacity: 0, scale: 0, y: throwVector.y + 20 }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut",
            times: [0, 0.4, 1] // 40% time spent going up, 60% falling down
          }}
          className="absolute flex flex-col items-center justify-center -translate-x-1/2 left-1/2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
        >
           {/* 3D Physical Chip Stack */}
           <div className="relative w-5 h-5 md:w-6 md:h-6">
             {chips.map((chip, i) => (
               <div 
                 key={i}
                 className={`absolute inset-0 rounded-full ${chip.color} border shadow-[0_2px_0_rgba(0,0,0,0.6)] flex items-center justify-center`}
                 style={{ transform: `translateY(-${i * 3}px)`, zIndex: i }}
               >
                 <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-dashed border-white/40 opacity-70" />
               </div>
             ))}
           </div>
           
           <div className="bg-slate-950/90 rounded-md px-2 py-0.5 mt-4 border border-amber-500/30 backdrop-blur shadow-md z-20 flex items-center gap-1">
             <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Bet</span>
             <span className="text-[9px] md:text-[11px] font-black text-amber-400 tracking-wider">
               ${formatVal(amount)}
             </span>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
BetChipStack.displayName = 'BetChipStack';
export default BetChipStack;
