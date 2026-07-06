"use client";

import React from "react";
import { fmt } from "../../formatter";
interface RaiseSliderProps {
    minRaise: number;
    maxRaise: number;
    raiseAmount: number;
    onChange: (val: number) => void;
}

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
    minRaise,
    maxRaise,
    raiseAmount,
    onChange,
}) => {
    return (
        <div className="flex items-center gap-2 px-1 text-[8px] font-bold text-[#F7EFDD]/40">
            <span>{fmt(minRaise)}</span>
            <input
                type="range"
                min={minRaise}
                max={maxRaise}
                value={raiseAmount}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="flex-1 h-1 rounded-full accent-[#F4B942] cursor-pointer"
            />
            <span className="text-red-400">ALL-IN</span>
        </div>
    );
};