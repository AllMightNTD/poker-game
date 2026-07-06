import { LABELS } from "../constants";
import { QuickBetOption } from "../types";


/** Clamp a raise-to amount inside the legal [minRaise, maxRaise] range. */
export function clampRaise(value: number, minRaise: number, maxRaise: number): number {
    if (maxRaise < minRaise) return maxRaise; // short-stack: only a shove is legal
    return Math.min(maxRaise, Math.max(minRaise, value));
}

/**
 * Standard poker rule: if a player's remaining stack can't cover a legal
 * min-raise, the only raise action available is an all-in shove. Most
 * clients (PokerStars, GGPoker, etc.) skip the raise slider entirely in
 * this case and go straight to a single "ALL-IN" button.
 */
export function isShortStackForcedAllIn(minRaise: number, maxRaise: number): boolean {
    return maxRaise <= minRaise;
}

export function isAllInAmount(raiseAmount: number, maxRaise: number): boolean {
    return raiseAmount >= maxRaise;
}

/**
 * Percentage of the pot a raise-to amount represents.
 * Uses the pot *after* the hero's call is added — the standard pot-limit
 * convention — rather than the pre-call pot, since that's the pot the
 * player is actually betting into.
 */
export function computePotPercent(
    raiseAmount: number,
    potNum: number,
    callAmount: number
): number | null {
    const potAfterCall = potNum + callAmount;
    if (potAfterCall <= 0) return null;
    return Math.round((raiseAmount / potAfterCall) * 100);
}

/**
 * Quick-bet presets. "1/2 POT" and "POT" are computed against the pot
 * *after* the hero calls (pot + callAmount), matching the standard
 * pot-limit formula, rather than the raw current pot — otherwise the
 * suggested sizes undersell what a real pot-size bet is.
 */
export function computeQuickBets(
    minRaise: number,
    maxRaise: number,
    potNum: number,
    callAmount: number
): QuickBetOption[] {
    const potAfterCall = potNum + callAmount;
    return [
        { label: LABELS.min, val: minRaise },
        { label: LABELS.halfPot, val: potAfterCall / 2 },
        { label: LABELS.pot, val: potAfterCall },
        { label: LABELS.allIn, val: maxRaise },
    ];
}

/** Caps a call amount to what the hero can actually put in (a real all-in call). */
export function computeCallAmount(
    currentHighestBet: number,
    heroCurrentBet: number,
    heroStack?: number
): number {
    const raw = Math.max(0, currentHighestBet - heroCurrentBet);
    if (heroStack === undefined || !Number.isFinite(heroStack)) return raw;
    return Math.min(raw, heroStack);
}

/** "BET" when nobody has opened the street yet, "RAISE" otherwise — standard poker terminology. */
export function betOrRaiseLabel(currentHighestBet: number): string {
    return currentHighestBet <= 0 ? LABELS.bet : LABELS.raise;
}