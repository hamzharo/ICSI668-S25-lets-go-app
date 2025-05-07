// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ACTION: Verify AUTH_COOKIE_NAME matches .env.local.
// This ensures the cookie name used here is consistent with AuthForm.tsx and AuthContext.tsx.
// Make sure NEXT_PUBLIC_AUTH_COOKIE_NAME is set in your .env.local file.
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

  // ACTION: Review and adjust the publicPaths array.
  // These paths are accessible without logging in.
  // The root '/' is NOT considered public here if app/(root)/page.tsx is the authenticated dashboard.
  const publicPaths = [
    '/landing', // Assuming you have a specific public landing page
    '/login',
    '/register',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    // Add other specific public paths like '/faq', '/blog/some-post', etc.
    // API routes that should be public (like /api/auth/*) are typically handled by the matcher or within the API route itself.
  ];

  // Check if the current path is one of the defined public paths.
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/')); // Check for exact match or sub-paths

  // Scenario 1: Trying to access a protected route without a token
  if (!isPublicPath && !authToken) {
    const loginUrl = new URL('/login', request.url);
    // Optionally, preserve the original path to redirect back after login
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Scenario 2: Authenticated user trying to access public-only pages (like login, register, or a dedicated landing page)
  // ACTION: Confirm the redirect URL. Changed '/dashboard-placeholder' to '/'.
  // This assumes app/(root)/page.tsx (resolving to '/') is your main authenticated entry point.
  const authOnlyPublicPaths = ['/login', '/register', '/landing']; // Pages an authenticated user should be redirected away from.
  if (authToken && authOnlyPublicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.redirect(new URL('/', request.url)); // Redirect to the main authenticated page (e.g., dashboard at root)
  }

  // If none of the above conditions are met, allow the request to proceed.
  // This covers:
  // - Unauthenticated user accessing a public path.
  // - Authenticated user accessing a protected path.
  // - Authenticated user accessing a public path not in authOnlyPublicPaths (e.g., /about, /contact).
  return NextResponse.next();
}

// ACTION: Review the config.matcher.
// This matcher applies the middleware to most paths, excluding:
// - /api/auth/ (to allow login/register API calls without interference)
// - Next.js static/image optimization files.
// - Specific files like favicon.ico (though the .includes('.') check above might also catch it)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (allow auth-related API calls)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file) - Redundant if pathname.includes('.') handles it
     *
     * The '.*' at the end of the negative lookahead ensures that anything *else* is matched.
     */
    '/((?!api/auth/|_next/static|_next/image|favicon.ico|icons/|images/).*)',
    // Added icons/ and images/ to the negative lookahead if they are served from /public
    // and you want to be absolutely sure the early static check handles them without
    // the middleware running further. The .includes('.') check often covers these.
    // If your /icons and /images are reliably caught by the `pathname.includes('.')`
    // or `pathname.startsWith('/icons/')` etc. at the top, you might not need them in the matcher's negative lookahead.
    // However, it provides an extra layer of explicitness for these common public asset paths.
  ],
};