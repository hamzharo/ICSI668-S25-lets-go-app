// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that are public EXCEPT the root path '/' initially
// '/' will be handled specially based on auth state
const publicPaths = ['/login', '/register', '/landing']; // Add /landing, remove /

// Define the path for the login page
const loginPath = '/login';
// Define the internal path for the landing page component
const landingPath = '/landing';
// Define the root path which acts as the authenticated home
const authenticatedHomePath = '/'; // Root path IS the dashboard

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get Authentication Token from cookies
  const cookieName = 'your_auth_token_cookie_name'; // <-- Replace with your actual cookie name!
  const authTokenCookie = request.cookies.get(cookieName);
  const token = authTokenCookie?.value;

  // Determine if the current path is one of the explicitly public paths (excluding root for now)
  const isExplicitlyPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // --- Redirection & Rewrite Logic ---

  // 1. Handle the Root Path ('/') Based on Auth State
  if (pathname === authenticatedHomePath) {
    if (!token) {
      // NOT logged in, requesting root -> Rewrite to show Landing Page content
      console.log(`Middleware: No token, requesting '/'. Rewriting to ${landingPath}.`);
      // Rewrite keeps the URL as '/' but serves content from /landing
      return NextResponse.rewrite(new URL(landingPath, request.url));
    } else {
      // Logged in, requesting root -> Allow to proceed (will hit app/(root)/page.tsx)
      console.log(`Middleware: Token exists, allowing request to '/'.`);
      return NextResponse.next(); // Let it go to the dashboard component
    }
  }

  // 2. Handle Explicitly Public Paths (like /login, /register, /landing)
  if (isExplicitlyPublicPath) {
    if (token) {
      // Logged in, accessing explicitly public page -> Redirect to Dashboard ('/')
       console.log(`Middleware: Token exists, accessing public route ${pathname}. Redirecting to ${authenticatedHomePath}.`);
       return NextResponse.redirect(new URL(authenticatedHomePath, request.url));
    } else {
      // Not logged in, accessing explicitly public page -> Allow
      console.log(`Middleware: No token, allowing request to public path ${pathname}.`);
      return NextResponse.next();
    }
  }

  // 3. Handle Protected Routes (Any other path)
  if (!token) {
    // Not logged in, accessing protected route -> Redirect to Login
    console.log(`Middleware: No token, accessing protected route ${pathname}. Redirecting to ${loginPath}.`);
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  // 4. If logged in and accessing any other path (already authenticated) -> Allow
  console.log(`Middleware: Token exists, allowing request to protected path ${pathname}.`);
  return NextResponse.next();
}

// Matcher Configuration (usually remains the same)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
};