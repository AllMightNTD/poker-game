"use client";

import React from "react";
import { LABELS } from "../../constants";

interface TableStatusBannerProps {
    variant: "folded" | "waiting-turn" | "away";
    activePlayerName?: string;
}

export const TableStatusBanner: React.FC<TableStatusBannerProps> = ({
    variant,
    activePlayerName,
}) => {
    if (variant === "away") {
        return (
            <div className="w-full text-center bg-amber-600/10 backdrop-blur-sm border border-amber-500/20 py-2.5 rounded-lg text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Bạn đang vắng mặt (Away) • Nhấn TRỞ LẠI / BACK để tiếp tục chơi
            </div>
        );
    }

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