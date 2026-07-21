"use client";

import React from "react";
import { fmtChips } from "../../formatter";

interface TotalWonBadgeProps {
    total: number;
}

export const TotalWonBadge: React.FC<TotalWonBadgeProps> = ({ total }) => {
    return (
        <span className="mt-1.5 text-[9px] md:text-[10px] font-bold text-[#F7EFDD]/50 uppercase tracking-widest">
            Total +{fmtChips(total)}
        </span>
    );
};