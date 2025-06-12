'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getSupabaseClient } from '@/lib/supabase/client';
import { hasAuthCookies } from '@/lib/utils/client-auth';
import { API_ROUTES } from '@/lib/config/routes';
import type { User, AuthOperationResult } from '@/lib/types/auth';

// Global Supabase client instance
const supabase = getSupabaseClient();

// Fetcher function for user data
const fetchUser = async (): Promise<{ user: User | null; session: any }> => {
  const response = await fetch(API_ROUTES.AUTH.USER, {
    credentials: 'include',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Not authenticated - return null user
      return { user: null, session: null };
    }
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
};

export function useAuth() {
  // Track if we're hydrated to prevent server/client mismatch
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Only fetch user data if hydrated and has auth cookies
  const shouldFetch = isHydrated && hasAuthCookies();

  const { data, error, mutate, isLoading } = useSWR(
    shouldFetch ? 'auth-user' : null,
    fetchUser,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      errorRetryCount: 1,
      shouldRetryOnError: (error) => {
        // Don't retry on 401 errors (not authenticated)
        return !error.message.includes('401');
      }
    }
  );

  const login = async (email: string, password: string): Promise<AuthOperationResult> => {
    try {
      const response = await fetch(API_ROUTES.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Force revalidate user data after successful login
      await mutate();
      
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: 'customer' | 'owner'
  ): Promise<AuthOperationResult> => {
    try {
      const response = await fetch(API_ROUTES.AUTH.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, fullName, role })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      // Force revalidate user data after successful signup
      await mutate();
      
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    }
  };

  const logout = async (): Promise<AuthOperationResult> => {
    try {
      const response = await fetch(API_ROUTES.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Logout failed');
      }

      // Clear user data after successful logout
      await mutate({ user: null, session: null }, false);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Logout failed' 
      };
    }
  };

  return {
    user: data?.user || null,
    session: data?.session || null,
    // Show loading only when hydrated and actually loading
    isLoading: shouldFetch ? isLoading : false,
    // Show loading state when not yet hydrated to prevent flash
    isHydrated,
    error,
    login,
    signup,
    logout,
    mutate
  };
} 