import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { RouteChecker, ROUTES } from '@/lib/config/routes';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { pathname } = request.nextUrl;

  // Skip middleware for system routes (static files, API routes, etc.)
  if (RouteChecker.isSystemRoute(pathname)) {
    return res;
  }

  try {
    // Get the session
    const { data: { session }, error } = await supabase.auth.getSession();

    // If there's an error getting session, allow access to public and auth routes
    if (error) {
      console.error('Session error in middleware:', error);
      if (RouteChecker.isPublicRoute(pathname) || RouteChecker.isAuthRoute(pathname)) {
        return res;
      }
      // Redirect to login for protected routes when there's a session error
      return NextResponse.redirect(new URL(RouteChecker.getLoginRedirectPath(pathname), request.url));
    }

    // If user is authenticated and trying to access auth pages, redirect to appropriate dashboard
    if (session && session.user && RouteChecker.isAuthRoute(pathname)) {
      // We don't have role info in middleware, so redirect to home and let client handle it
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }

    // If it's a public route, allow access
    if (RouteChecker.isPublicRoute(pathname)) {
      return res;
    }

    // If it's an auth route and user is not authenticated, allow access
    if (RouteChecker.isAuthRoute(pathname)) {
      return res;
    }

    // If no session exists for protected routes, redirect to login
    if (!session || !session.user) {
      if (RouteChecker.isProtectedRoute(pathname)) {
        return NextResponse.redirect(new URL(RouteChecker.getLoginRedirectPath(pathname), request.url));
      }
    }

    // For role-specific routes, we'll check the role in the actual page/API route
    // This avoids unnecessary database calls in middleware
    // The role checking will be done using the role-check utility

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow access to prevent blocking the app
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}; 