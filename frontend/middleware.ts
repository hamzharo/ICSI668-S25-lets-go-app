// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Get the cookie name from environment variables (ensure it's set in .env.local)
const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'letsgo_auth_token'; // Fallback just in case

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Define public paths that don't require authentication
  const publicPaths = [
    '/landing',
    '/login',
    '/register',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    // Add any other public static paths like '/faq', '/blog', etc.
    // Also include API routes that should be public if any are defined in `app/api/*` (unlikely for this setup)
  ];

  // Allow access to static assets (_next, public files like images/icons)
  if (pathname.startsWith('/_next/') || pathname.startsWith('/icons/') || pathname.startsWith('/images/') || pathname.includes('.')) {
    // The last condition pathname.includes('.') is a common heuristic for static files
    return NextResponse.next();
  }


  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname === '/'; // Assuming root '/' might be public (e.g. redirects to landing or login)

  // If trying to access a protected route without a token, redirect to login
  if (!isPublicPath && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Save the intended path for redirect after login
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login/register page with a token, redirect to home/dashboard
  if (authToken && (pathname === '/login' || pathname === '/register' || pathname === '/landing' || pathname === '/')) {
    // Assuming '/' inside the (root) group is the main dashboard after login
    return NextResponse.redirect(new URL('/dashboard-placeholder', request.url)); // Replace '/dashboard-placeholder' with your actual main authenticated route, e.g., just '/' if app/(root)/page.tsx handles it.
                                                                              // If app/(root)/page.tsx is your intended destination, redirecting to '/' is fine.
                                                                              // The current app/(root)/page.tsx handles role-based dashboards.
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that might have their own auth) - BUT we want to protect our app routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * We want the middleware to run on almost all paths to check authentication.
     */
    // This matcher will apply the middleware to all paths except specific Next.js internal ones.
    '/((?!api/auth/|_next/static|_next/image|favicon.ico).*)',
  ],
};