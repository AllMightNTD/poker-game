import { PotGroup, WinnerData } from "../types";

/** Sum of every winner's amount, across all pots. */
export function computeTotalWon(winners: WinnerData[]): number {
    return winners.reduce((acc, w) => acc + w.amountWon, 0);
}

/**
 * Groups winners by pot (main pot / side pots) while preserving the order
 * pots were first seen in. Standard poker clients always resolve side pots
 * before the main pot, so callers should pass `winners` already in that
 * order rather than re-sorting here.
 *
 * This matters for correctness: an all-in scenario can have several
 * players each winning a different pot with a different hand, and lumping
 * them into one undifferentiated total (as the original component did)
 * hides who actually won what.
 */
export function groupWinnersByPot(winners: WinnerData[]): PotGroup[] {
    const order: (string | undefined)[] = [];
    const buckets = new Map<string | undefined, WinnerData[]>();

    for (const winner of winners) {
        const key = winner.potLabel;
        if (!buckets.has(key)) {
            buckets.set(key, []);
            order.push(key);
        }
        buckets.get(key)!.push(winner);
    }

    return order.map((potLabel) => {
        const groupWinners = buckets.get(potLabel)!;
        return {
            potLabel,
            winners: groupWinners,
            potTotal: computeTotalWon(groupWinners),
            isSplit: groupWinners.length > 1,
        };
    });
}

/** True when there's more than one pot in play (i.e. one or more side pots). */
export function hasMultiplePots(groups: PotGroup[]): boolean {
    return groups.length > 1;
}