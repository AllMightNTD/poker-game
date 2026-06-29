"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { getPreferredLocale } from "@/hooks/usePreferredLocale";

interface AuthLocaleRedirectProps {
  currentLocale: string;
  children: React.ReactNode;
}

/**
 * Reads the user's preferred locale from localStorage and redirects
 * if the current URL locale does not match.
 *
 * - New users (no preference saved): redirects to /en/...
 * - Returning users: redirects to their last selected locale
 * - If locale already matches: renders children immediately (no redirect)
 */
export function AuthLocaleRedirect({ currentLocale, children }: AuthLocaleRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;

    const preferred = getPreferredLocale();

    if (preferred !== currentLocale) {
      hasRedirected.current = true;
      // Replace current URL with preferred locale, keeping the same path
      router.replace(pathname, { locale: preferred });
    }
  }, [currentLocale, pathname, router]);

  return <>{children}</>;
}
