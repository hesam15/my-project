import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth_token');
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');

  if (isAuthPage && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtectedPage && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/register'],
};