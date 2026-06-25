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
    const role = payload?.role;
    if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
  }

  // 2. Protect Internal Portal Web routes
  if (pathname.startsWith('/mbg-internal-portal') || pathname.startsWith('/admin')) {
    if (pathname === '/mbg-internal-portal/login') {
      if (isAuthenticated) {
        const url = request.nextUrl.clone();
        url.pathname = '/mbg-internal-portal';
        return NextResponse.redirect(url);
      }
    } else {
      // Condition A: Unauthenticated
      if (!isAuthenticated) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
      
      // Condition B: Authenticated but Wrong Role
      const role = payload?.role;
      if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/mbg-internal-portal/:path*', '/api/admin/:path*', '/admin/:path*'],
};
