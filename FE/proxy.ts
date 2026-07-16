import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const adminToken = request.cookies.get('admin_token')?.value;
  const path = request.nextUrl.pathname;

  // List of auth pages for player
  const playerAuthPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-otp',
    '/resend-otp',
  ];

  // Check if player is accessing any player auth page (exact match or dynamic sub-path like /reset-password/token)
  const isPlayerAuthPath = playerAuthPaths.some(authPath => 
    path === authPath || path.startsWith(authPath + '/')
  );

  const isRootPath = path === '/';

  // Redirect root page based on auth status
  if (isRootPath) {
    if (token) {
      return NextResponse.redirect(new URL('/poker-game', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Prevent re-visiting player auth pages when already logged in
  if (isPlayerAuthPath && token) {
    return NextResponse.redirect(new URL('/poker-game', request.url));
  }

  // --- Admin Logic ---
  const isAdminPath = path.startsWith('/backstage');
  const isAdminLoginPath = path === '/backstage/login';

  if (isAdminPath) {
    if (isAdminLoginPath && adminToken) {
      return NextResponse.redirect(new URL('/backstage/dashboard', request.url));
    }
    if (!isAdminLoginPath && !adminToken) {
      return NextResponse.redirect(new URL('/backstage/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
