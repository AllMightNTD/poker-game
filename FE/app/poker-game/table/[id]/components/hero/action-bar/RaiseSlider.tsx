"use client";

import React from "react";
import { fmt } from "../../formatter";
import { FormSlider } from "@/components/ui/form";

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
        <div className="flex items-center gap-4 px-1 text-[8px] font-bold text-[#F7EFDD]/40 w-full">
            <span>{fmt(minRaise)}</span>
            <FormSlider
                min={minRaise}
                max={maxRaise}
                value={raiseAmount}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1"
            />
            <span className="text-red-400">ALL-IN</span>
        </div>
    );
};