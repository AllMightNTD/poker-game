"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";
import { BANNER_TRANSITION, DEFAULT_AUTO_DISMISS_MS, WINNER_LABELS } from "../../constants";
import { fmtChips } from "../../formatter";
import { WinnerBannerProps } from "../../types";
import { computeTotalWon } from "../../utils/potGrouping";
import { useAutoDismiss } from "../../utils/useAutoDismiss";
import { TotalWonBadge } from "./TotalWonBadge";
import { WinnerEyebrow } from "./WinnerEyebrow";
import { WinnerList } from "./WinnerList";

export const WinnerBanner: React.FC<WinnerBannerProps> = ({
    handName,
    winners,
    wonByFold = false,
    onDismiss,
    autoDismissMs = DEFAULT_AUTO_DISMISS_MS,
}) => {
    const { visible, dismiss } = useAutoDismiss(autoDismissMs);

    // Defensive: an empty winners array shouldn't render a blank banner.
    if (winners.length === 0) return null;

    const totalWon = computeTotalWon(winners);
    const isSingleWinner = winners.length === 1;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 pointer-events-none">
            <AnimatePresence onExitComplete={onDismiss}>
                {visible && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -12 }}
                            transition={BANNER_TRANSITION}
                            className="relative bg-gradient-to-r from-[#0B3D2E]/95 via-[#16594A]/95 to-[#0B3D2E]/95 border border-[#F4B942]/40 w-[80%] max-w-[400px] rounded-2xl py-3 md:py-4 flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-auto"
                        >
                            <button
                                onClick={dismiss}
                                aria-label="Close"
                                className="absolute top-1.5 right-2 text-[#F7EFDD]/40 hover:text-white transition-colors"
                            >
                                <X size={12} />
                            </button>

                            <WinnerEyebrow handName={handName} wonByFold={wonByFold} />

                            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight my-0.5">
                                {isSingleWinner ? WINNER_LABELS.winTitle(fmtChips(totalWon)) : "WIN"}
                            </h2>

                            <WinnerList winners={winners} showHandNames={!wonByFold} />

                            {!isSingleWinner && <TotalWonBadge total={totalWon} />}
                        </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WinnerBanner;