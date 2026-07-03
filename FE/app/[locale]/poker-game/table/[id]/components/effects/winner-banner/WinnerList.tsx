"use client";

import React from "react";
import { WINNER_LABELS } from "../../constants";
import { WinnerData } from "../../types";
import { groupWinnersByPot, hasMultiplePots } from "../../utils/potGrouping";
import { WinnerRow } from "./WinnerRow";

interface WinnerListProps {
    winners: WinnerData[];
    showHandNames: boolean;
}

export const WinnerList: React.FC<WinnerListProps> = ({ winners, showHandNames }) => {
    const groups = groupWinnersByPot(winners);
    const showPotLabels = hasMultiplePots(groups);

    return (
        <div className="flex flex-col items-center gap-2 mt-1">
            {groups.map((group, i) => (
                <div key={group.potLabel ?? `pot-${i}`} className="flex flex-col items-center gap-1">
                    {showPotLabels && (
                        <span className="text-[9px] font-bold text-[#F7EFDD]/40 uppercase tracking-widest">
                            {group.potLabel ?? WINNER_LABELS.defaultPot}
                            {group.isSplit && ` ${WINNER_LABELS.splitSuffix}`}
                        </span>
                    )}
                    {group.winners.map((winner, j) => (
                        <WinnerRow
                            key={`${group.potLabel ?? "pot"}-${winner.seatNumber}-${j}`}
                            winner={winner}
                            showHandName={showHandNames}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};