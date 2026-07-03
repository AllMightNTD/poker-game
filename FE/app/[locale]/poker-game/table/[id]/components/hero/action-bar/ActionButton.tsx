"use client";

import { ChevronUp } from "lucide-react";
import React from "react";
import { LABELS } from "../../constants";
import { fmt } from "../../formatter";

interface ActionButtonsProps {
    callAmount: number;
    isCallAllIn: boolean;
    raiseOrBetLabel: string;
    isRaiseMode: boolean;
    isAllIn: boolean;
    raiseAmount: number;
    onFold: () => void;
    onCheck: () => void;
    onCall: () => void;
    onRaiseButtonClick: () => void;
    canRaise: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    callAmount,
    isCallAllIn,
    raiseOrBetLabel,
    isRaiseMode,
    isAllIn,
    raiseAmount,
    onFold,
    onCheck,
    onCall,
    onRaiseButtonClick,
    canRaise,
}) => {
    return (
        <div className="w-full flex items-stretch gap-2 bg-[#1a1a1a]/80 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-2xl">
            <button
                onClick={onFold}
                className="flex-1 py-3 rounded-xl border-b-4 border-black/40 bg-gradient-to-b from-[#3a3a3a] to-[#222] text-[#999] font-black text-xs md:text-sm uppercase tracking-widest active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all"
            >
                {LABELS.fold}
            </button>

            {callAmount === 0 ? (
                <button
                    onClick={onCheck}
                    className="flex-1 py-3 rounded-xl border-b-4 border-[#996D1D]/40 bg-gradient-to-b from-[#F4B942] to-[#E0942A] text-[#142019] font-black text-xs md:text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(244,185,66,0.3)] active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all"
                >
                    {LABELS.check}
                </button>
            ) : (
                <button
                    onClick={onCall}
                    className="flex-1 py-3 rounded-xl border-b-4 border-[#996D1D]/40 bg-gradient-to-b from-[#F4B942] to-[#E0942A] text-[#142019] font-black text-xs md:text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(244,185,66,0.3)] active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center leading-none gap-1"
                >
                    <span>{isCallAllIn ? LABELS.callAllIn : LABELS.call}</span>
                    {!isCallAllIn && <span className="text-[10px] opacity-80">{fmt(callAmount)}</span>}
                </button>
            )}

            {canRaise && (
                <button
                    onClick={onRaiseButtonClick}
                    className={`flex-1 py-3 rounded-xl border-b-4 uppercase tracking-widest transition-all active:scale-[0.98] active:border-b-0 active:translate-y-1 flex flex-col items-center justify-center leading-none gap-1
              ${isRaiseMode
                            ? isAllIn
                                ? "bg-[#E23744] border-red-900 text-white"
                                : "bg-emerald-600 border-emerald-900 text-white"
                            : "border-black/40 bg-gradient-to-b from-[#3a3a3a] to-[#222] text-[#ddd]"
                        }`}
                >
                    {isRaiseMode ? (
                        <>
                            <span className="font-black text-xs md:text-sm">{isAllIn ? LABELS.allIn : "XÁC NHẬN"}</span>
                            {!isAllIn && <span className="text-[10px] font-bold opacity-80">{fmt(raiseAmount)}</span>}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-1 font-black text-xs md:text-sm">
                                <ChevronUp size={14} /> {raiseOrBetLabel}
                            </div>
                        </>
                    )}
                </button>
            )}
        </div>
    );
};