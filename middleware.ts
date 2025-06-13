import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { RouteChecker, ROUTES } from '@/lib/config/routes';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { pathname } = request.nextUrl;

  // This is the crucial step to refresh the session cookie.
  const { data: { session } } = await supabase.auth.getSession();

  // If it's an API route, we just wanted to refresh the session.
  // The actual route protection will be handled in the API route itself.
  // So, we can return the response and stop the middleware chain.
  if (RouteChecker.isApiRoute(pathname)) {
    return res;
  }

  // If the user is authenticated and they try to access an auth route (e.g., /login),
  // redirect them to the homepage.
  if (session && RouteChecker.isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  // Only require authentication for specifically protected routes
  // For dashboard, owner, and booking management routes
  const protectedRoutes = ['/dashboard', '/owner'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL(RouteChecker.getLoginRedirectPath(pathname), request.url));
  }

  // For all other cases, allow the request to proceed.
  // This allows public access to all other routes including car listings, car details, etc.
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml
     * - robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}; 