"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { RAISE_PANEL_TRANSITION } from "../../constants";
import { RaiseControllerResult } from "../../types";
import { clampRaise } from "../../utils/raiseCalculator";
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

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ height: 0, opacity: 0, y: 10 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: 10 }}
                    transition={RAISE_PANEL_TRANSITION}
                    className="absolute bottom-full left-0 right-0 bg-[#07261D]/95 border border-[#F4B942]/20 rounded-xl shadow-2xl z-40 mb-2 overflow-hidden backdrop-blur-md"
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