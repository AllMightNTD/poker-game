import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const path = request.nextUrl.pathname;

  // Regex to match root paths with optional locale: /vi, /ja, /en
  const isRootPath = new RegExp(`^/(${routing.locales.join('|')})?/?$`).test(path);
  
  // Regex to match auth paths: /vi/login, /en/register, /login, etc.
  const isAuthPath = new RegExp(`^/(${routing.locales.join('|')})?/(login|register)/?$`).test(path);

  // Protect root page
  if (isRootPath && !token) {
    const locale = path.split('/')[1] || routing.defaultLocale;
    const redirectUrl = routing.locales.includes(locale as any) ? `/${locale}/login` : '/login';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Prevent re-visiting login/register when already logged in
  if (isAuthPath && token) {
    const locale = path.split('/')[1] || routing.defaultLocale;
    const redirectUrl = routing.locales.includes(locale as any) ? `/${locale}` : '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(vi|en|ja)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
