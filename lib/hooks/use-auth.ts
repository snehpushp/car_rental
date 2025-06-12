'use client';

import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { hasAuthCookie, isPublicRoute } from '@/lib/utils/client-auth';
import type { 
  AuthResponse, 
  LoginCredentials, 
  SignupData, 
  User, 
  Session 
} from '@/lib/types/auth';

const fetcher = async (url: string): Promise<AuthResponse> => {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      return { user: null, session: null };
    }
    throw new Error('Failed to fetch user data');
  }
  
  return res.json();
};

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const pathname = usePathname();

  // Determine if we should fetch user data
  useEffect(() => {
    const hasAuth = hasAuthCookie();
    const isPublic = isPublicRoute(pathname);
    
    // Fetch if:
    // 1. We have auth cookies (potential session)
    // 2. We're on a protected route (need to verify access)
    setShouldFetch(hasAuth || !isPublic);
  }, [pathname]);

  const { data, error: swrError, mutate } = useSWR<AuthResponse>(
    shouldFetch ? '/api/auth/user' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      // Don't retry if we're on a public route and have no auth cookies
      shouldRetryOnError: (error) => {
        if (!hasAuthCookie() && isPublicRoute(pathname)) {
          return false;
        }
        return true;
      }
    }
  );

  const user: User | null = data?.user || null;
  const session: Session | null = data?.session || null;
  const isLoading = shouldFetch && !data && !swrError;

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Enable fetching after successful login
      setShouldFetch(true);
      
      // Revalidate user data
      await mutate();
      toast.success('Login successful!');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      toast.success('Account created successfully!');
      
      // If no email verification is required, automatically log in
      if (!result.requiresVerification) {
        setShouldFetch(true);
        await mutate();
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Logout failed');
      }

      // Disable fetching after logout
      setShouldFetch(false);
      
      // Clear SWR cache and revalidate
      await mutate({ user: null, session: null }, false);
      toast.success('Logged out successfully');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading: isLoading || loading,
    error: error || (swrError ? 'Failed to load user data' : null),
    login,
    signup,
    logout,
    mutate,
  };
} 