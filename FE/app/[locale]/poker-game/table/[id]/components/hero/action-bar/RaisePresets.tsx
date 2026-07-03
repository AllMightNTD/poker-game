"use client";

import React from "react";
import { QuickBetOption } from "../../types";

interface RaisePresetsProps {
    quickBets: QuickBetOption[];
    raiseAmount: number;
    clamp: (v: number) => number;
    onSelect: (val: number) => void;
}

export const RaisePresets: React.FC<RaisePresetsProps> = ({
    quickBets,
    raiseAmount,
    clamp,
    onSelect,
}) => {
    return (
        <div className="flex gap-1 mt-1">
            {quickBets.map((opt) => {
                const v = Math.round(opt.val);
                const isSelected = raiseAmount === clamp(v);
                return (
                    <button
                        key={opt.label}
                        onClick={() => onSelect(opt.val)}
                        className={`flex-1 py-1 rounded text-[8px] font-black transition-all border
              ${isSelected
                                ? "bg-[#F4B942]/20 border-[#F4B942]/60 text-[#F4B942]"
                                : "bg-[#0F4438]/40 border-[#F4B942]/10 text-[#F7EFDD]/40"
                            }`}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};