"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";

const TOAST_STYLES = {
  success: {
    wrapper: "bg-emerald-600/95 border-emerald-500/60 shadow-emerald-950/40",
    icon: <CheckCircle2 size={16} className="text-emerald-200 shrink-0" />,
  },
  error: {
    wrapper: "bg-rose-600/95 border-rose-500/60 shadow-rose-950/40",
    icon: <XCircle size={16} className="text-rose-200 shrink-0" />,
  },
  info: {
    wrapper: "bg-cyan-600/95 border-cyan-500/60 shadow-cyan-950/40",
    icon: <Info size={16} className="text-cyan-200 shrink-0" />,
  },
  warning: {
    wrapper: "bg-amber-600/95 border-amber-500/60 shadow-amber-950/40",
    icon: <Info size={16} className="text-amber-200 shrink-0" />,
  },
};

export const Toast = () => {
  const { toastMsg } = usePokerGame();
  const style = toastMsg ? TOAST_STYLES[toastMsg.type] : null;

  return (
    <AnimatePresence>
      {toastMsg && style && (
        <motion.div
          key={toastMsg.text + toastMsg.type}
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-full shadow-2xl border text-sm font-semibold backdrop-blur-lg text-white whitespace-nowrap max-w-sm ${style.wrapper}`}
        >
          {style.icon}
          <span className="text-[12px]">{toastMsg.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
