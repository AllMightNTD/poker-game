"use client";

import React from "react";
import { LABELS } from "../../constants";

interface StartGamePanelProps {
    canStart: boolean;
    onStart: () => void;
}

export const StartGamePanel: React.FC<StartGamePanelProps> = ({ canStart, onStart }) => {
    return (
        <div className="w-full bg-[#1a1a1a]/85 backdrop-blur-md border border-white/5 p-2 rounded-2xl shadow-2xl">
            <button
                onClick={onStart}
                disabled={!canStart}
                className={`w-full py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border-b-4 shadow-md
          ${canStart
                        ? "bg-gradient-to-b from-[#10b981] to-[#047857] border-[#024e37] text-white cursor-pointer hover:brightness-110 shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                        : "bg-[#111] border-black/45 text-white/20 cursor-not-allowed border-b-2"
                    }`}
            >
                {LABELS.startGame}
            </button>
        </div>
    );
};