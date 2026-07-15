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
    maxRaise: number;
    onFold: () => void;
    onCheck: () => void;
    onCall: () => void;
    onRaiseButtonClick: () => void;
    onAllInClick: () => void;
    canRaise: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    callAmount,
    isCallAllIn,
    raiseOrBetLabel,
    isRaiseMode,
    isAllIn,
    raiseAmount,
    maxRaise,
    onFold,
    onCheck,
    onCall,
    onRaiseButtonClick,
    onAllInClick,
    canRaise,
}) => {
    return (
        <div className="w-full flex items-stretch gap-2 bg-[#0a0a0a]/90 backdrop-blur-md p-2 rounded-2xl border border-[#F4B942]/30 shadow-2xl">
            <button
                onClick={onFold}
                className="flex-1 py-3 rounded-xl border-b-4 border-[#5a1215] bg-gradient-to-b from-[#dc2626] to-[#991b1b] text-white/90 font-black text-xs md:text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-[0_4px_10px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center leading-none gap-1"
            >
                <span>{LABELS.fold}</span>
                <span className="text-[9px] opacity-65">$0</span>
            </button>

            {callAmount === 0 ? (
                <button
                    onClick={onCheck}
                    className="flex-1 py-3 rounded-xl border-b-4 border-[#065f46] bg-gradient-to-b from-[#10b981] to-[#047857] text-white/90 font-black text-xs md:text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-[0_4px_10px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center leading-none gap-1"
                >
                    <span>{LABELS.check}</span>
                    <span className="text-[9px] opacity-65">$0</span>
                </button>
            ) : (
                <button
                    onClick={onCall}
                    className="flex-1 py-3 rounded-xl border-b-4 border-[#065f46] bg-gradient-to-b from-[#10b981] to-[#047857] text-white/90 font-black text-xs md:text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center leading-none gap-1 cursor-pointer shadow-[0_4px_10px_rgba(16,185,129,0.3)]"
                >
                    <span>{isCallAllIn ? LABELS.callAllIn : LABELS.call}</span>
                    <span className="text-[9px] opacity-80">${fmt(callAmount)}</span>
                </button>
            )}

            {canRaise && (
                <>
                    <button
                        onClick={onRaiseButtonClick}
                        className={`flex-1 py-3 rounded-xl border-b-4 uppercase tracking-widest transition-all active:scale-[0.98] active:border-b-0 active:translate-y-1 flex flex-col items-center justify-center leading-none gap-1 cursor-pointer hover:brightness-110
                  ${isRaiseMode
                                ? "bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] border-[#1e40af] text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)]"
                                : "border-[#78350f] bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-white/90 shadow-[0_4px_10px_rgba(245,158,11,0.3)]"
                            }`}
                    >
                        {isRaiseMode ? (
                            <>
                                <span className="font-black text-xs md:text-sm">XÁC NHẬN</span>
                                <span className="text-[9px] font-bold opacity-85">${fmt(raiseAmount)}</span>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-1 font-black text-xs md:text-sm">
                                    <ChevronUp size={12} /> {raiseOrBetLabel}
                                </div>
                                <span className="text-[9px] font-bold opacity-65">${fmt(raiseAmount)}</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onAllInClick}
                        className="flex-1 py-3 rounded-xl border-b-4 border-[#5f1217] bg-gradient-to-b from-[#991b1b] to-[#7f1d1d] text-white font-black text-xs md:text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center leading-none gap-1 cursor-pointer shadow-[0_4px_10px_rgba(153,27,27,0.3)]"
                    >
                        <span>ALL-IN</span>
                        <span className="text-[9px] opacity-85">${fmt(maxRaise)}</span>
                    </button>
                </>
            )}
        </div>
    );
};