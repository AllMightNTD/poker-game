"use client";

import React from "react";
import { LABELS } from "../../constants";

interface StartGamePanelProps {
    canStart: boolean;
    onStart: () => void;
}

export const StartGamePanel: React.FC<StartGamePanelProps> = ({ canStart, onStart }) => {
    return (
        <div className="w-full bg-black/40 backdrop-blur-md border border-amber-500/30 p-2.5 rounded-xl shadow-2xl">
            <button
                onClick={onStart}
                disabled={!canStart}
                className={`w-full py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border shadow-md
          ${canStart
                        ? "bg-gradient-to-r from-[#F4B942] to-[#E0942A] border-[#F4B942] text-[#142019]"
                        : "bg-[#0F4438]/60 border-[#F4B942]/10 text-[#F7EFDD]/30 cursor-not-allowed opacity-60"
                    }`}
            >
                {LABELS.startGame}
            </button>
        </div>
    );
};