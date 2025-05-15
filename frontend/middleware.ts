// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'your_auth_token_cookie_name'; // Fallback, but .env.local should define it.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Allow access to static assets and Next.js internals early
  // This check is broad for static files using a dot in their name.
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') || // Assuming /public/icons
    pathname.startsWith('/images/') || // Assuming /public/images
    pathname.includes('.') // Heuristic for files like favicon.ico, manifest.json, etc.
  ) {
    return NextResponse.next();
  }

  const publicPaths = [
    '/landing', 
    '/login',
    '/register',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ];

  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/')); // Check for exact match or sub-paths

  // Scenario 1: Trying to access a protected route without a token
  if (!isPublicPath && !authToken) {
    const loginUrl = new URL('/login', request.url);
    // Optionally, preserve the original path to redirect back after login
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

 
  const authOnlyPublicPaths = ['/login', '/register', '/landing']; // Pages an authenticated user should be redirected away from.
  if (authToken && authOnlyPublicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.redirect(new URL('/', request.url)); // Redirect to the main authenticated page (e.g., dashboard at root)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
  
    '/((?!api/auth/|_next/static|_next/image|favicon.ico|icons/|images/).*)',
  ],
};