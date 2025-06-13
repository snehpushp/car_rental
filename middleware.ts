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

  // If the user is not authenticated...
  if (!session) {
    // and they are trying to access a public or authentication route, allow them.
    if (RouteChecker.isPublicRoute(pathname) || RouteChecker.isAuthRoute(pathname)) {
      return res;
    }
    // Otherwise, redirect them to the login page.
    return NextResponse.redirect(new URL(RouteChecker.getLoginRedirectPath(pathname), request.url));
  }

  // If the user is authenticated and they try to access an auth route (e.g., /login),
  // redirect them to the homepage.
  if (RouteChecker.isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  // For all other cases (authenticated user on a protected or public route),
  // allow the request to proceed. Role-based access control is handled
  // within the specific pages or API routes, not in the middleware.
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