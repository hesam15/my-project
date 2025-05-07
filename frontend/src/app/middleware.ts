import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin
  if (path.startsWith('/admin')) {
    try {      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/check`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      const userData = data.user || data;

      console.log('userData', userData);

      // Check if user is admin
      if (userData.role !== 'admin') {
        // Redirect to home if user is not admin
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Redirect to home if there's an error
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/admin/:path*'],
};