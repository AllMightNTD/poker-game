"use client";

import { X } from "lucide-react";
import React from "react";
import { LABELS } from "../../constants";

interface RaiseInfoProps {
    onClose: () => void;
}

export const RaiseInfo: React.FC<RaiseInfoProps> = ({ onClose }) => {
    return (
        <div className="flex justify-between items-center text-[9px] text-[#F7EFDD]/50 font-bold tracking-wider px-1">
            <span>{LABELS.customizeTitle}</span>
            <button onClick={onClose} className="text-[#F7EFDD]/40 hover:text-white">
                <X size={12} />
            </button>
        </div>
    );
};