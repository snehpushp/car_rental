'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import type { User, AuthOperationResult } from '@/lib/types/auth';

interface AuthContextType {
  user: User | null;
  session: any;
  isLoading: boolean;
  isHydrated: boolean;
  error: any;
  login: (email: string, password: string) => Promise<AuthOperationResult>;
  signup: (email: string, password: string, fullName: string, role: 'customer' | 'owner') => Promise<AuthOperationResult>;
  logout: () => Promise<AuthOperationResult>;
  mutate: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 