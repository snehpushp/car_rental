import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  requireRole,
  getPaginationParams,
  createPaginationMeta
} from '@/lib/utils/api-helpers';
import type { Booking, PaginatedResponse, BookingStatus } from '@/lib/types/database';
import { HttpStatus } from '@/lib/types/api';

export async function GET(request: NextRequest) {
  try {
    // Require customer role
    const auth = await requireRole('customer');
    if (auth instanceof Response) return auth;
    
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);
    
    // Optional status filter
    const status = searchParams.get('status') as BookingStatus | null;
    
    const supabase = await getSupabaseRouteHandler();
    
    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        car:cars!bookings_car_id_fkey(
          id,
          brand,
          model,
          year,
          image_urls,
          price_per_day,
          location_text,
          owner:profiles!cars_owner_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `, { count: 'exact' })
      .eq('customer_id', auth.profile.id);
    
    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Order by created_at desc (newest first)
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: bookings, error, count } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch bookings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!bookings || count === null) {
      return createSuccessResponse<PaginatedResponse<Booking>>({
        data: [],
        pagination: createPaginationMeta(page, limit, 0)
      });
    }
    
    const response: PaginatedResponse<Booking> = {
      data: bookings,
      pagination: createPaginationMeta(page, limit, count)
    };
    
    return createSuccessResponse(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 