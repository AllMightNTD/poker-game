"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[PokerTable Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-6 text-center max-w-sm"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-rose-400" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-sm font-black uppercase tracking-wider text-rose-400">
            Lỗi kết nối bàn chơi
          </h1>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Không thể tải bàn poker. Vui lòng thử lại hoặc quay về trang chọn bàn.
          </p>
          {error.digest && (
            <p className="text-[9px] text-slate-600 font-mono mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors"
          >
            <RefreshCcw size={14} />
            Thử lại
          </button>
          <a
            href="/poker-game"
            className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 font-black text-xs uppercase tracking-wider transition-colors text-center"
          >
            Rời bàn
          </a>
        </div>
      </motion.div>
    </div>
  );
}
