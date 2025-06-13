/**
 * Centralized route configuration for the CarGopher application
 * This file manages all route definitions and provides utilities for route checking
 */

// Public routes - accessible to everyone
export const PUBLIC_ROUTES = [
  '/',
  '/cars',
  '/about',
  '/how-it-works',
  '/host',
  '/contact'
] as const;

// Authentication routes - should redirect authenticated users
export const AUTH_ROUTES = [
  '/auth/login',
  '/auth/signup'
] as const;

// Customer-only routes
export const CUSTOMER_ROUTES = [
  '/dashboard/bookings',
  '/dashboard/profile',
  '/dashboard/wishlist'
] as const;

// Owner-only routes
export const OWNER_ROUTES = [
  '/owner/dashboard',
  '/owner/cars',
  '/owner/cars/new',
  '/owner/bookings',
  '/owner/profile'
] as const;

// API routes that don't require authentication
export const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/auth/user',
  '/api/cars',
  '/api/reviews'
] as const;

// API routes that require owner role
export const OWNER_API_ROUTES = [
  '/api/owner/cars',
  '/api/owner/bookings'
] as const;

// API routes that require customer role
export const CUSTOMER_API_ROUTES = [
  '/api/bookings',
  '/api/wishlist',
  '/api/profile'
] as const;

// Static/system routes that should be ignored by middleware
export const SYSTEM_ROUTES = [
  '/_next',
  '/favicon.ico',
  '/public',
  '/api/health',
  '/debug'
] as const;

/**
 * Route checking utilities
 */
export class RouteChecker {
  private static readonly API_AUTH_PREFIX = '/api/auth';
  private static readonly API_PREFIX = '/api';

  /**
   * Check if a route is public (accessible to everyone)
   */
  static isPublicRoute(pathname: string): boolean {
    // Check exact matches
    if (PUBLIC_ROUTES.includes(pathname as any)) {
      return true;
    }
    
    // Check dynamic routes
    if (pathname.startsWith('/cars/')) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if a route is an auth route (login/signup)
   */
  static isAuthRoute(pathname: string): boolean {
    return AUTH_ROUTES.includes(pathname as any);
  }

  /**
   * Check if a route requires customer role
   */
  static isCustomerRoute(pathname: string): boolean {
    return CUSTOMER_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  }

  /**
   * Check if a route requires owner role
   */
  static isOwnerRoute(pathname: string): boolean {
    return OWNER_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  }

  /**
   * Check if a route is protected (requires authentication)
   */
  static isProtectedRoute(pathname: string): boolean {
    return this.isCustomerRoute(pathname) || 
           this.isOwnerRoute(pathname) ||
           pathname.startsWith('/dashboard') ||
           pathname.startsWith('/owner');
  }

  /**
   * Check if an API route is public
   */
  static isPublicApiRoute(pathname: string): boolean {
    return PUBLIC_API_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  }

  /**
   * Check if an API route requires owner role
   */
  static isOwnerApiRoute(pathname: string): boolean {
    return OWNER_API_ROUTES.some(route => 
      pathname.startsWith(route)
    );
  }

  /**
   * Check if an API route requires customer role
   */
  static isCustomerApiRoute(pathname: string): boolean {
    return CUSTOMER_API_ROUTES.some(route => 
      pathname.startsWith(route)
    );
  }

  /**
   * Check if a route should be ignored by middleware
   */
  static isSystemRoute(pathname: string): boolean {
    return SYSTEM_ROUTES.some(route => 
      pathname.startsWith(route)
    ) || pathname.includes('.');
  }

  /**
   * Get the required role for a route
   */
  static getRequiredRole(pathname: string): 'customer' | 'owner' | null {
    if (this.isCustomerRoute(pathname) || this.isCustomerApiRoute(pathname)) {
      return 'customer';
    }
    if (this.isOwnerRoute(pathname) || this.isOwnerApiRoute(pathname)) {
      return 'owner';
    }
    return null;
  }

  /**
   * Get default redirect path for a user role
   */
  static getDefaultRedirectPath(role: 'customer' | 'owner'): string {
    return role === 'owner' ? '/owner/dashboard' : '/dashboard/bookings';
  }

  /**
   * Get login redirect path with return URL
   */
  static getLoginRedirectPath(returnTo?: string): string {
    const loginPath = '/auth/login';
    if (returnTo && returnTo !== '/') {
      return `${loginPath}?redirectTo=${encodeURIComponent(returnTo)}`;
    }
    return loginPath;
  }

  public static isApiRoute = (pathname: string): boolean => {
    return pathname.startsWith(this.API_PREFIX);
  }
}

/**
 * Route constants for easy access
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  OWNER_DASHBOARD: '/owner/dashboard',
  CARS: '/cars',
  PROFILE: '/dashboard/profile',
  OWNER_PROFILE: '/owner/profile'
} as const;

/**
 * API route constants
 */
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    USER: '/api/auth/user'
  },
  CARS: '/api/cars',
  OWNER: {
    CARS: '/api/owner/cars',
    BOOKINGS: '/api/owner/bookings'
  },
  CUSTOMER: {
    BOOKINGS: '/api/bookings',
    WISHLIST: '/api/wishlist',
    PROFILE: '/api/profile'
  }
} as const; 