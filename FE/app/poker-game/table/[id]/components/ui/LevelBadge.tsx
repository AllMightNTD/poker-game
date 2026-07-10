import React from 'react';
import { motion } from 'framer-motion';

type Level = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface LevelBadgeProps {
  level: Level | string;
  xp: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LEVEL_THRESHOLDS = [
  { name: 'bronze', min: 0, max: 3000, color: 'from-[#CD7F32] to-[#8B4513]', textColor: 'text-[#CD7F32]' },
  { name: 'silver', min: 3000, max: 10000, color: 'from-[#E5E4E2] to-[#B0C4DE]', textColor: 'text-[#E5E4E2]' },
  { name: 'gold', min: 10000, max: 20000, color: 'from-[#FFD700] to-[#DAA520]', textColor: 'text-[#FFD700]' },
  { name: 'platinum', min: 20000, max: 50000, color: 'from-[#E5E4E2] to-[#5F9EA0]', textColor: 'text-[#E5E4E2]' },
  { name: 'diamond', min: 50000, max: 100000, color: 'from-[#00FFFF] to-[#4169E1]', textColor: 'text-[#00FFFF]' },
];

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level = 'bronze', xp = 0, showProgress = true, size = 'md' }) => {
  const currentLvl = LEVEL_THRESHOLDS.find(l => l.name === level.toLowerCase()) || LEVEL_THRESHOLDS[0];
  const progressPct = Math.min(100, Math.max(0, ((xp - currentLvl.min) / (currentLvl.max - currentLvl.min)) * 100));

  const sizeClasses = {
    sm: 'w-10 h-10 text-[10px]',
    md: 'w-16 h-16 text-xs',
    lg: 'w-24 h-24 text-base',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div 
        className={`relative rounded-full flex items-center justify-center font-black uppercase tracking-wider text-black bg-gradient-to-br ${currentLvl.color} shadow-[0_0_15px_rgba(255,255,255,0.2)] border-2 border-white/20`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        style={{ width: size === 'sm' ? 40 : size === 'md' ? 64 : 96, height: size === 'sm' ? 40 : size === 'md' ? 64 : 96 }}
      >
        <span className={sizeClasses[size] + ' flex items-center justify-center'}>
          {level.substring(0, 3)}
        </span>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.5)] pointer-events-none" />
      </motion.div>

      {showProgress && (
        <div className="w-full max-w-[150px] flex flex-col gap-1 items-center">
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner">
            <motion.div 
              className={`h-full bg-gradient-to-r ${currentLvl.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex w-full justify-between items-center px-1">
            <span className={`text-[9px] font-bold uppercase ${currentLvl.textColor}`}>
              {level}
            </span>
            <span className="text-[9px] font-bold text-slate-400">
              {xp} / {currentLvl.max} XP
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
