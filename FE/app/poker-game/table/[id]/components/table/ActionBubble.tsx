import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface ActionBubbleProps {
  action: string;
}

const getActionColors = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes('fold')) return 'bg-slate-600/90 border-slate-400/50 text-slate-200';
  if (a.includes('check')) return 'bg-blue-600/90 border-blue-400/50 text-white';
  if (a.includes('call')) return 'bg-emerald-500/90 border-emerald-300/50 text-white';
  if (a.includes('raise') || a.includes('bet') || a.includes('all')) return 'bg-rose-500/90 border-rose-300/50 text-white';
  return 'bg-slate-800/90 border-slate-600/50 text-slate-200';
};

const ActionBubble: React.FC<ActionBubbleProps> = React.memo(({ action }) => {
  if (!action) return null;
  const colors = getActionColors(action);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border backdrop-blur-sm shadow-xl z-30 whitespace-nowrap pointer-events-none ${colors}`}
      >
        <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase">{action}</span>
      </motion.div>
    </AnimatePresence>
  );
});
ActionBubble.displayName = 'ActionBubble';
export default ActionBubble;
