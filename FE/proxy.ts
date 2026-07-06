import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const adminToken = request.cookies.get('admin_token')?.value;
  const path = request.nextUrl.pathname;

  const isAuthPath = /^\/(login|register)\/?$/.test(path);
  const isRootPath = path === '/';

  // Protect root page
  if (isRootPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Prevent re-visiting login/register when already logged in
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
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
