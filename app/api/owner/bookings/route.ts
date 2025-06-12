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
    // Require owner role
    const auth = await requireRole('owner');
    if (auth instanceof Response) return auth;
    
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);
    
    // Optional status filter
    const status = searchParams.get('status') as BookingStatus | null;
    
    const supabase = await getSupabaseRouteHandler();
    
    // Build query to get all bookings for owner's cars
    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:profiles!bookings_customer_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        car:cars!bookings_car_id_fkey(
          id,
          brand,
          model,
          year,
          image_urls,
          price_per_day,
          location_text
        )
      `, { count: 'exact' })
      .eq('car.owner_id', auth.profile.id);
    
    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Order by status priority and then by created_at
    // Prioritize pending bookings that need attention
    query = query.order('status', { ascending: true }) // pending comes first
      .order('created_at', { ascending: false });
    
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
    
    // Group bookings by status for easier management
    const groupedBookings = {
      pending: bookings.filter(b => b.status === 'pending'),
      upcoming: bookings.filter(b => b.status === 'upcoming'),
      ongoing: bookings.filter(b => b.status === 'ongoing'),
      completed: bookings.filter(b => b.status === 'completed'),
      rejected: bookings.filter(b => b.status === 'rejected'),
      cancelled: bookings.filter(b => b.status === 'cancelled'),
    };
    
    const response = {
      data: {
        bookings,
        grouped: groupedBookings,
        summary: {
          total: count,
          pending: groupedBookings.pending.length,
          upcoming: groupedBookings.upcoming.length,
          ongoing: groupedBookings.ongoing.length,
          completed: groupedBookings.completed.length,
          rejected: groupedBookings.rejected.length,
          cancelled: groupedBookings.cancelled.length,
        }
      },
      pagination: createPaginationMeta(page, limit, count)
    };
    
    return createSuccessResponse(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 