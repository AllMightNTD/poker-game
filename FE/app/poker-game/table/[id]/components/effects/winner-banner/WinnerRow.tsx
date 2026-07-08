"use client";

import React from "react";
import { fmtChips } from "../../formatter";
import { WinnerData } from "../../types";

interface WinnerRowProps {
    winner: WinnerData;
    showHandName: boolean;
}

export const WinnerRow: React.FC<WinnerRowProps> = ({ winner }) => {
    return (
        <div className="flex items-center justify-center gap-2 text-white bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
            <span className="font-bold text-[11px] md:text-xs uppercase tracking-wider truncate max-w-[8rem]">
                {winner.playerName}
            </span>
            <span className="font-black text-[13px] md:text-[14px] text-[#F4B942]">
                +{fmtChips(winner.amountWon)}
            </span>
        </div>
    );
};