const STORAGE_KEY = "know_block_locale";
const VALID_LOCALES = ["en", "vi", "ja"] as const;
type ValidLocale = (typeof VALID_LOCALES)[number];

/**
 * Reads the user's preferred locale from localStorage.
 * - Returns saved locale if the user has previously selected one.
 * - Returns "en" (English) as the default for new users who have never visited.
 */
export function getPreferredLocale(): ValidLocale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY) as ValidLocale | null;
  if (saved && VALID_LOCALES.includes(saved)) {
    return saved;
  }
  return "en";
}

/**
 * Saves the user's locale preference to localStorage.
 */
export function saveLocalePreference(locale: string): void {
  if (typeof window === "undefined") return;
  if (VALID_LOCALES.includes(locale as ValidLocale)) {
    localStorage.setItem(STORAGE_KEY, locale);
  }
}
