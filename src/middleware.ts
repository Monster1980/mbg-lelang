import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('mbg_session')?.value;
  
  const payload = await decrypt(sessionCookie);
  const isAuthenticated = !!payload;

  // 1. Protect API Admin routes
  if (pathname.startsWith('/api/admin')) {
    if (!isAuthenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
  }

  // 2. Protect Admin Web routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/mbg-auth-pasuruan', request.url));
    }
  }

  // 3. Prevent authenticated users from going back to the login page
  if (pathname === '/mbg-auth-pasuruan') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/mbg-auth-pasuruan'],
};
