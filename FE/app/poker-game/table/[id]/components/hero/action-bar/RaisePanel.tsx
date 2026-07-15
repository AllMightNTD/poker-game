"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { RAISE_PANEL_TRANSITION } from "../../constants";
import { RaiseControllerResult } from "../../types";
import { clampRaise } from "../../utils/raiseCalculator";
import { useResponsive } from "../../hooks/useResponsive";
import { usePokerGame } from "../../hooks/usePokerGame";
import { RaiseInfo } from "./RaiseInfo";
import { RaiseInput } from "./RaiseInput";
import { RaisePresets } from "./RaisePresets";
import { RaiseSlider } from "./RaiseSlider";

interface RaisePanelProps {
    visible: boolean;
    minRaise: number;
    maxRaise: number;
    raiseAmount: number;
    controller: RaiseControllerResult;
}

export const RaisePanel: React.FC<RaisePanelProps> = ({
    visible,
    minRaise,
    maxRaise,
    raiseAmount,
    controller,
}) => {
    const { isMobile, isTablet } = useResponsive();
    const { pot, formatChipsVal } = usePokerGame();
    const {
        inputRaw,
        handleInputChange,
        handleSlider,
        setPreset,
        step,
        isAtMin,
        isAtMax,
        potPercent,
        quickBets,
        closeRaiseMode,
    } = controller;

    if (!isMobile && !isTablet) {
        // Desktop Layout (Inline 1 Row)
        return (
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="w-full bg-transparent border-0 shadow-none mb-1 p-0 flex flex-row items-center justify-between gap-3"
                    >
                        {/* Presets - Left */}
                        <div className="shrink-0 min-w-[200px] -mt-1">
                            <RaisePresets
                                quickBets={quickBets}
                                raiseAmount={raiseAmount}
                                clamp={(v) => clampRaise(v, minRaise, maxRaise)}
                                onSelect={setPreset}
                            />
                        </div>

                        {/* Slider - Center */}
                        <div className="flex-1">
                            <RaiseSlider
                                minRaise={minRaise}
                                maxRaise={maxRaise}
                                raiseAmount={raiseAmount}
                                onChange={handleSlider}
                            />
                        </div>

                        {/* Pot / Current Raise - Right */}
                        <div className="shrink-0 flex items-center gap-1.5 px-3 bg-black/60 border border-[#F4B942]/30 rounded-xl h-7 min-w-[100px] justify-center shadow-inner">
                            <span className="text-[9px] font-bold text-[#F7EFDD]/40 uppercase tracking-widest">POT:</span>
                            <span className="text-[11px] font-black text-[#F4B942]">${formatChipsVal(pot)}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ height: 0, opacity: 0, y: 10 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: 10 }}
                    transition={RAISE_PANEL_TRANSITION}
                    className={`
                        border border-[#F4B942]/30 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-40 mb-2 overflow-hidden backdrop-blur-md w-full relative bg-black/90
                    `}
                >
                    <div className="p-2 flex flex-col gap-1.5">
                        <RaiseInfo onClose={closeRaiseMode} />

                        <RaiseInput
                            inputRaw={inputRaw}
                            onInputChange={handleInputChange}
                            onStepDown={() => setPreset(raiseAmount - step)}
                            onStepUp={() => setPreset(raiseAmount + step)}
                            isAtMin={isAtMin}
                            isAtMax={isAtMax}
                            potPercent={potPercent}
                        />

                        <RaiseSlider
                            minRaise={minRaise}
                            maxRaise={maxRaise}
                            raiseAmount={raiseAmount}
                            onChange={handleSlider}
                        />

                        <RaisePresets
                            quickBets={quickBets}
                            raiseAmount={raiseAmount}
                            clamp={(v) => clampRaise(v, minRaise, maxRaise)}
                            onSelect={setPreset}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};