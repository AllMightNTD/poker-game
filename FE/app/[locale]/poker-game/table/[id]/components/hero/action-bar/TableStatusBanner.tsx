"use client";

import React from "react";
import { LABELS } from "../../constants";

interface TableStatusBannerProps {
    variant: "folded" | "waiting-turn";
    activePlayerName?: string;
}

export const TableStatusBanner: React.FC<TableStatusBannerProps> = ({
    variant,
    activePlayerName,
}) => {
    if (variant === "folded") {
        return (
            <div className="w-full text-center bg-black/50 backdrop-blur-sm border border-white/10 py-2 rounded-lg text-[#F7EFDD]/40 text-[10px] font-bold uppercase tracking-wider">
                {LABELS.waitingFold}
            </div>
        );
    }

    return (
        <div className="w-full text-center bg-black/50 backdrop-blur-sm border border-white/10 py-2 rounded-lg text-[#F7EFDD]/50 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${activePlayerName ? "bg-[#F4B942]" : "bg-emerald-400"}`}
            />
            {LABELS.waitingTurn(activePlayerName)}
        </div>
    );
};