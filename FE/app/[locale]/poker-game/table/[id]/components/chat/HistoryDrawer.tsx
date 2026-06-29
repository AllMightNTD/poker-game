"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, X, Clock } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";
import { useResponsive } from "../hooks/useResponsive";

const HistoryContent = ({ onClose }: { onClose?: () => void }) => {
  const { handHistory } = usePokerGame();
  const listEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [handHistory]);

  const getEntryStyle = (entry: string) => {
    if (entry.startsWith("---")) return "text-amber-400/90 font-black font-sans not-italic border-t border-slate-800/60 pt-1 mt-1";
    if (entry.includes("Hero")) return "text-emerald-400/90";
    if (entry.includes("thắng")) return "text-yellow-400/90 font-bold";
    return "text-slate-500";
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <ScrollText size={13} className="text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            Nhật Ký Bàn
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="xl:hidden w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Hand count badge */}
      <div className="px-4 py-2 border-b border-slate-800/40 shrink-0">
        <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
          <Clock size={10} />
          <span className="font-bold">{handHistory.length} sự kiện trong ván này</span>
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-[10px] font-mono">
        {handHistory.map((entry, idx) => (
          <div
            key={idx}
            className={`leading-relaxed flex gap-1.5 items-start ${getEntryStyle(entry)}`}
          >
            <span className="opacity-30 text-[8px] tabular-nums shrink-0 mt-0.5">{idx + 1}</span>
            <span>{entry}</span>
          </div>
        ))}
        <div ref={listEndRef} />
      </div>
    </>
  );
};

export const HistoryDrawer = () => {
  const { showHistory, setShowHistory } = usePokerGame();
  const { isDesktop } = useResponsive();

  return (
    <>
      {/* ── DESKTOP (xl+): Right sidebar ── */}
      <aside
        className={`hidden xl:flex flex-col shrink-0 border-l border-slate-800/60 bg-slate-950/98 transition-all duration-300 overflow-hidden ${
          showHistory ? "w-64" : "w-0"
        }`}
      >
        <HistoryContent />
      </aside>

      {/* ── NON-DESKTOP: Floating button ── */}
      {!isDesktop && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="xl:hidden fixed bottom-44 right-3 z-30 w-10 h-10 rounded-full bg-slate-900/95 border border-slate-700 shadow-xl flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-600/50 transition-colors backdrop-blur-sm"
          aria-label="Toggle hand history"
        >
          <ScrollText size={15} />
        </button>
      )}

      {/* ── NON-DESKTOP: Bottom Sheet ── */}
      <AnimatePresence>
        {showHistory && !isDesktop && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="xl:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="xl:hidden fixed inset-x-0 bottom-0 z-50 h-[70vh] bg-slate-950 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-700" />
              </div>
              <HistoryContent onClose={() => setShowHistory(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
