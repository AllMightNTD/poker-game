"use client";

import React from "react";
import { WINNER_LABELS } from "../../constants";

interface WinnerEyebrowProps {
    handName: string;
    wonByFold: boolean;
}

export const WinnerEyebrow: React.FC<WinnerEyebrowProps> = ({ handName, wonByFold }) => {
    return (
        <span className="text-[9px] md:text-[10px] font-bold text-[#F4B942] uppercase tracking-widest mb-1">
            {wonByFold ? WINNER_LABELS.wonByFold : handName}
        </span>
    );
};