import { useCallback, useEffect, useState } from "react";
import { fmtFull, parseDigits } from "../formatter";
import { RaiseControllerParams, RaiseControllerResult } from "../types";
import {
    clampRaise,
    computePotPercent,
    computeQuickBets,
    isAllInAmount,
    isShortStackForcedAllIn,
} from "../utils/raiseCalculator";

/**
 * Owns every piece of state needed to drive the raise slider/input/presets,
 * decoupled from `usePokerGame` so it can be unit-tested with plain numbers.
 */
export function useRaiseController({
    minRaise,
    maxRaise,
    raiseAmount,
    setRaiseAmount,
    potNum,
    callAmount,
}: RaiseControllerParams): RaiseControllerResult {
    const [isRaiseMode, setIsRaiseMode] = useState(false);
    const [inputRaw, setInputRaw] = useState(fmtFull(minRaise));

    const forcedAllIn = isShortStackForcedAllIn(minRaise, maxRaise);
    const step = Math.max(1, minRaise);

    useEffect(() => {
        Promise.resolve().then(() => {
            setInputRaw(fmtFull(raiseAmount));
        });
    }, [raiseAmount]);

    const clamp = useCallback(
        (v: number) => clampRaise(v, minRaise, maxRaise),
        [minRaise, maxRaise]
    );

    const setPreset = useCallback(
        (val: number) => {
            setRaiseAmount(clamp(Math.round(val)));
            setIsRaiseMode(true);
        },
        [clamp, setRaiseAmount]
    );

    const handleInputChange = useCallback(
        (raw: string) => {
            const num = parseDigits(raw);
            if (num === null) {
                setInputRaw("");
                return;
            }
            const clamped = clamp(num);
            setInputRaw(fmtFull(num));
            setRaiseAmount(clamped);
        },
        [clamp, setRaiseAmount]
    );

    const handleSlider = useCallback(
        (val: number) => setRaiseAmount(clamp(val)),
        [clamp, setRaiseAmount]
    );

    const openRaiseMode = useCallback(() => {
        if (forcedAllIn) {
            // Short stack: nothing to customize — jump straight to the max (all-in)
            // and arm the confirm button. The sliding panel itself stays hidden
            // (the caller checks `forcedAllIn` before rendering it).
            setRaiseAmount(maxRaise);
        }
        setIsRaiseMode(true);
    }, [forcedAllIn, maxRaise, setRaiseAmount]);

    const closeRaiseMode = useCallback(() => setIsRaiseMode(false), []);

    return {
        isRaiseMode,
        openRaiseMode,
        closeRaiseMode,
        inputRaw,
        handleInputChange,
        handleSlider,
        setPreset,
        step,
        isAtMin: raiseAmount <= minRaise,
        isAtMax: raiseAmount >= maxRaise,
        isAllIn: isAllInAmount(raiseAmount, maxRaise),
        forcedAllIn,
        potPercent: computePotPercent(raiseAmount, potNum, callAmount),
        quickBets: computeQuickBets(minRaise, maxRaise, potNum, callAmount),
    };
}