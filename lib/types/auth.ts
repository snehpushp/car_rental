export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'owner';
  avatarUrl: string | null;
  createdAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

export interface AuthOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AuthError {
  error: string;
  details?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  role: 'customer' | 'owner';
}

export interface AuthContext {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  mutate: () => Promise<AuthResponse | undefined>;
} 