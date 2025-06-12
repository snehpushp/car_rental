import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiResponse, ApiError, ApiValidationError, ValidationError } from '@/lib/types/api';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = HttpStatus.OK
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  error: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: any
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    },
    { status }
  );
}

/**
 * Create a validation error response from Zod errors
 */
export function createValidationErrorResponse(
  zodError: ZodError
): NextResponse<ApiValidationError> {
  const validation_errors: ValidationError[] = zodError.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return NextResponse.json(
    {
      success: false,
      error: ErrorMessages.VALIDATION_ERROR,
      validation_errors,
    },
    { status: HttpStatus.UNPROCESSABLE_ENTITY }
  );
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(): Promise<{
  user: any;
  profile: Profile;
} | null> {
  try {
    const supabase = await getSupabaseRouteHandler();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return null;

    return { user, profile };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Require authentication for a route
 */
export async function requireAuth(): Promise<{
  user: any;
  profile: Profile;
} | NextResponse<ApiError>> {
  const auth = await getAuthenticatedUser();
  
  if (!auth) {
    return createErrorResponse(ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
  }
  
  return auth;
}

/**
 * Require specific role for a route
 */
export async function requireRole(role: 'customer' | 'owner'): Promise<{
  user: any;
  profile: Profile;
} | NextResponse<ApiError>> {
  const auth = await requireAuth();
  
  if (auth instanceof NextResponse) {
    return auth; // Return the error response
  }
  
  if (auth.profile.role !== role) {
    const errorMessage = role === 'owner' ? ErrorMessages.OWNER_ONLY : ErrorMessages.CUSTOMER_ONLY;
    return createErrorResponse(errorMessage, HttpStatus.FORBIDDEN);
  }
  
  return auth;
}

/**
 * Handle API route errors with consistent formatting
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error('API Error:', error);
  
  if (error instanceof ZodError) {
    return createValidationErrorResponse(error);
  }
  
  if (error instanceof Error) {
    return createErrorResponse(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  
  return createErrorResponse(ErrorMessages.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
}

/**
 * Parse pagination parameters from URL search params
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const total_pages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    total_pages,
    has_next: page < total_pages,
    has_prev: page > 1,
  };
}

/**
 * Validate date range for bookings
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Start date must be today or in the future
  if (start < today) return false;
  
  // End date must be after start date
  if (end <= start) return false;
  
  return true;
}

/**
 * Calculate total price for booking
 */
export function calculateBookingPrice(
  startDate: string,
  endDate: string,
  pricePerDay: number
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays * pricePerDay;
} 