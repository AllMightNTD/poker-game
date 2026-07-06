import { LOCALE, MILLION, THOUSAND } from "./constants";

/** Format a chip count to K / M shorthand, e.g. 1_500_000 -> "1.5M". */
export function fmt(val: number): string {
    if (!Number.isFinite(val)) return "0";
    if (val >= MILLION) return `${(val / MILLION).toFixed(1)}M`;
    if (val >= THOUSAND) return `${Math.round(val / THOUSAND)}K`;
    return val.toLocaleString(LOCALE);
}

/** Format a raw chip count as a full localized number, e.g. for text inputs. */
export function fmtFull(val: number): string {
    if (!Number.isFinite(val)) return "";
    return val.toLocaleString(LOCALE);
}

/** Strip everything but digits from a raw input string, e.g. "1.234" -> "1234". */
export function digitsOnly(raw: string): string {
    return raw.replace(/\D/g, "");
}

/** Parse a raw user-typed string into an integer, or null if empty/invalid. */
export function parseDigits(raw: string): number | null {
    const digits = digitsOnly(raw);
    if (!digits) return null;
    const num = parseInt(digits, 10);
    return Number.isNaN(num) ? null : num;
}

/**
 * Full, exact chip count with thousands separators — e.g. 1250000 ->
 * "1.250.000". Unlike the action-bar's K/M shorthand (fine for approximate
 * bet-sizing UI), a real winnings amount must never be rounded: players
 * need to see exactly how many chips changed hands.
 */
export function fmtChips(val: number): string {
    if (!Number.isFinite(val)) return "0";
    return Math.round(val).toLocaleString(LOCALE);
}