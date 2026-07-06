"use client";

import { Minus, Plus } from "lucide-react";
import React from "react";

interface RaiseInputProps {
    inputRaw: string;
    onInputChange: (raw: string) => void;
    onStepDown: () => void;
    onStepUp: () => void;
    isAtMin: boolean;
    isAtMax: boolean;
    potPercent: number | null;
}

export const RaiseInput: React.FC<RaiseInputProps> = ({
    inputRaw,
    onInputChange,
    onStepDown,
    onStepUp,
    isAtMin,
    isAtMax,
    potPercent,
}) => {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onStepDown}
                disabled={isAtMin}
                className="w-7 h-7 rounded-md bg-[#0F4438] border border-[#F4B942]/20 text-[#F7EFDD]/70 flex items-center justify-center disabled:opacity-30"
            >
                <Minus size={12} />
            </button>

            <div className="flex-1 text-center relative">
                <input
                    type="text"
                    inputMode="numeric"
                    value={inputRaw}
                    onChange={(e) => onInputChange(e.target.value)}
                    className="w-full text-center bg-[#0F4438] border border-[#F4B942]/20 focus:border-[#F4B942] rounded-md py-1 text-[#F4B942] font-black text-xs focus:outline-none"
                />
                {potPercent !== null && (
                    <span className="absolute right-2 top-1.5 text-[8px] font-bold text-[#F7EFDD]/30">
                        ≈{potPercent}% Pot
                    </span>
                )}
            </div>

            <button
                onClick={onStepUp}
                disabled={isAtMax}
                className="w-7 h-7 rounded-md bg-[#0F4438] border border-[#F4B942]/20 text-[#F7EFDD]/70 flex items-center justify-center disabled:opacity-30"
            >
                <Plus size={12} />
            </button>
        </div>
    );
};