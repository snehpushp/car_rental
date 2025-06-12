import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { pathname } = request.nextUrl;

  // Get the session
  const { data: { session } } = await supabase.auth.getSession();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/cars',
    '/auth/login',
    '/auth/signup',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/logout',
    '/api/auth/user'
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/cars/') || pathname.startsWith('/_next')
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return res;
  }

  // If no session exists, redirect to login
  if (!session) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile) {
    // If profile doesn't exist, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based route protection
  if (pathname.startsWith('/owner')) {
    // Owner routes - only accessible by owners
    if (profile.role !== 'owner') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else if (pathname.startsWith('/dashboard')) {
    // Customer dashboard - only accessible by customers
    if (profile.role !== 'customer') {
      return NextResponse.redirect(new URL('/owner/dashboard', request.url));
    }
  }

  // API route protection
  if (pathname.startsWith('/api/owner')) {
    if (profile.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized: Owner access required' },
        { status: 403 }
      );
    }
  }

  return res;
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 