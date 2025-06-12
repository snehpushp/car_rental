'use client';

import { RouteChecker } from '@/lib/config/routes';

/**
 * Check if authentication cookies are present
 * This helps determine if we should attempt to fetch user data
 */
export function hasAuthCookies(): boolean {
  if (typeof document === 'undefined') return false;
  
  const cookies = document.cookie;
  
  // Check for Supabase auth cookies more specifically
  // Supabase typically creates cookies like: sb-<project-ref>-auth-token
  const hasSupabaseCookies = cookies.split(';').some(cookie => {
    const trimmed = cookie.trim();
    return trimmed.startsWith('sb-') && 
           (trimmed.includes('-auth-token') || trimmed.includes('access-token') || trimmed.includes('refresh-token'));
  });
  
  return hasSupabaseCookies;
}

/**
 * Check if the current route is public (doesn't require authentication)
 * @deprecated Use RouteChecker.isPublicRoute() instead
 */
export function isPublicRoute(pathname: string): boolean {
  return RouteChecker.isPublicRoute(pathname);
}

/**
 * Check if the current route is an auth route (login/signup)
 * @deprecated Use RouteChecker.isAuthRoute() instead
 */
export function isAuthRoute(pathname: string): boolean {
  return RouteChecker.isAuthRoute(pathname);
}

/**
 * Check if the current route is protected (requires authentication)
 * @deprecated Use RouteChecker.isProtectedRoute() instead
 */
export function isProtectedRoute(pathname: string): boolean {
  return RouteChecker.isProtectedRoute(pathname);
} 