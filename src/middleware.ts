import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('mbg_session');
  const isAuthenticated = session && session.value === 'authenticated';

  // 1. Protect API Admin routes
  if (pathname.startsWith('/api/admin')) {
    if (!isAuthenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
  }

  // 2. Protect Admin Web routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      // If already authenticated and trying to access login page, redirect to dashboard
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } else {
      // If unauthenticated and trying to access any other admin page, redirect to login
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
