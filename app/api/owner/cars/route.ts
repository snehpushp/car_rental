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
import { carCreateSchema } from '@/lib/validation/schemas';
import type { Car, PaginatedResponse, CarCreateRequest } from '@/lib/types/database';
import { HttpStatus } from '@/lib/types/api';

export async function GET(request: NextRequest) {
  try {
    // Require owner role
    const auth = await requireRole('owner');
    if (auth instanceof Response) return auth;
    
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Get owner's cars with booking counts
    const { data: cars, error, count } = await supabase
      .from('cars')
      .select(`
        *,
        bookings!cars_id_fkey(
          id,
          status,
          start_date,
          end_date
        )
      `, { count: 'exact' })
      .eq('owner_id', auth.profile.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch cars', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!cars || count === null) {
      return createSuccessResponse<PaginatedResponse<Car>>({
        data: [],
        pagination: createPaginationMeta(page, limit, 0)
      });
    }
    
    // Add booking statistics to each car
    const carsWithStats = cars.map(car => {
      const bookings = car.bookings || [];
      const activeBookings = bookings.filter(b => ['pending', 'upcoming', 'ongoing'].includes(b.status));
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      return {
        ...car,
        bookings: undefined, // Remove bookings array to keep response clean
        booking_stats: {
          total_bookings: bookings.length,
          active_bookings: activeBookings.length,
          completed_bookings: completedBookings.length,
          pending_bookings: bookings.filter(b => b.status === 'pending').length
        }
      };
    });
    
    const response: PaginatedResponse<Car> = {
      data: carsWithStats,
      pagination: createPaginationMeta(page, limit, count)
    };
    
    return createSuccessResponse(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require owner role
    const auth = await requireRole('owner');
    if (auth instanceof Response) return auth;
    
    const body = await request.json();
    const carData: CarCreateRequest = carCreateSchema.parse(body);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Create new car
    const { data: car, error } = await supabase
      .from('cars')
      .insert({
        ...carData,
        owner_id: auth.profile.id,
        is_available: true
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to create car', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createSuccessResponse(car, 'Car created successfully', HttpStatus.CREATED);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 