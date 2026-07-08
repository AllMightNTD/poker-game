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
                className="flex-1 py-3 rounded-xl border-b-4 border-[#4f1412] bg-gradient-to-b from-[#7a1f1d] to-[#591615] text-white/90 font-black text-xs md:text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-[0_4px_10px_rgba(122,31,29,0.3)]"
            >
                {LABELS.fold}
            </button>

            {callAmount === 0 ? (
                <button
                    onClick={onCheck}
                    className="flex-1 py-3 rounded-xl border-b-4 border-[#0e1e38] bg-gradient-to-b from-[#1c3d70] to-[#122748] text-white/90 font-black text-xs md:text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-[0_4px_10px_rgba(28,61,112,0.3)]"
                >
                    {LABELS.check}
                </button>
            ) : (
                <button
                    onClick={onCall}
                    className="flex-1 py-3 rounded-xl border-b-4 border-[#120d24] bg-gradient-to-b from-[#2a1b4e] to-[#1c1235] text-white/90 font-black text-xs md:text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center leading-none gap-1 cursor-pointer shadow-[0_4px_10px_rgba(42,27,78,0.3)]"
                >
                    <span>{isCallAllIn ? LABELS.callAllIn : LABELS.call}</span>
                    {!isCallAllIn && <span className="text-[10px] opacity-80">{fmt(callAmount)}</span>}
                </button>
            )}

            {canRaise && (
                <button
                    onClick={onRaiseButtonClick}
                    className={`flex-1 py-3 rounded-xl border-b-4 uppercase tracking-widest transition-all active:scale-[0.98] active:border-b-0 active:translate-y-1 flex flex-col items-center justify-center leading-none gap-1 cursor-pointer hover:brightness-110
              ${isRaiseMode
                            ? isAllIn
                                ? "bg-gradient-to-b from-[#E23744] to-[#a3222c] border-[#5d1217] text-white shadow-[0_4px_10px_rgba(226,55,68,0.3)]"
                                : "bg-gradient-to-b from-[#059669] to-[#047857] border-[#024e37] text-white shadow-[0_4px_10px_rgba(5,150,105,0.3)]"
                            : "border-[#072417] bg-gradient-to-b from-[#0f5636] to-[#0a3823] text-white/90 shadow-[0_4px_10px_rgba(15,86,54,0.3)]"
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