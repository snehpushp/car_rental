'use client';

/**
 * Check if there's a potential Supabase session cookie on the client side
 * This helps avoid unnecessary API calls when user is clearly not authenticated
 */
export function hasAuthCookie(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Supabase auth cookies
  const cookies = document.cookie;
  
  // Look for common Supabase auth cookie patterns
  const authCookiePatterns = [
    'sb-',
    'supabase-auth-token',
    'auth-token'
  ];
  
  return authCookiePatterns.some(pattern => 
    cookies.includes(pattern)
  );
}

/**
 * Check if we're on a public route that doesn't require authentication
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/cars',
    '/auth/login',
    '/auth/signup',
    '/about',
    '/how-it-works',
    '/host',
    '/contact',
    '/privacy',
    '/terms'
  ];

  return publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith('/cars/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/')
  );
} 