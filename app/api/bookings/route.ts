import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  requireRole,
  calculateBookingPrice
} from '@/lib/utils/api-helpers';
import { bookingCreateSchema } from '@/lib/validation/schemas';
import { checkBookingConflicts, isCarAvailable, validateBookingDateRange } from '@/lib/booking/validation';
import type { Booking, BookingCreateRequest } from '@/lib/types/database';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';

export async function POST(request: NextRequest) {
  try {
    // Require customer role
    const auth = await requireRole('customer');
    if (auth instanceof Response) return auth;
    
    const body = await request.json();
    const bookingData: BookingCreateRequest = bookingCreateSchema.parse(body);
    
    // Validate date range
    const dateValidation = validateBookingDateRange(bookingData.start_date, bookingData.end_date);
    if (!dateValidation.valid) {
      return createErrorResponse(dateValidation.error!, HttpStatus.BAD_REQUEST);
    }
    
    // Check if car is available
    const carAvailable = await isCarAvailable(bookingData.car_id);
    if (!carAvailable) {
      return createErrorResponse(ErrorMessages.CAR_NOT_AVAILABLE, HttpStatus.BAD_REQUEST);
    }
    
    // Check for booking conflicts
    const hasConflicts = await checkBookingConflicts({
      car_id: bookingData.car_id,
      start_date: bookingData.start_date,
      end_date: bookingData.end_date
    });
    
    if (hasConflicts) {
      return createErrorResponse(ErrorMessages.BOOKING_CONFLICT, HttpStatus.CONFLICT);
    }
    
    const supabase = await getSupabaseRouteHandler();
    
    // Get car details to calculate price
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('price_per_day, owner_id')
      .eq('id', bookingData.car_id)
      .single();
    
    if (carError || !car) {
      return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    // Prevent owners from booking their own cars
    if (car.owner_id === auth.profile.id) {
      return createErrorResponse('You cannot book your own car', HttpStatus.BAD_REQUEST);
    }
    
    // Calculate total price
    const total_price = calculateBookingPrice(
      bookingData.start_date,
      bookingData.end_date,
      car.price_per_day
    );
    
    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: auth.profile.id,
        car_id: bookingData.car_id,
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        total_price,
        status: 'pending'
      })
      .select(`
        *,
        car:cars!bookings_car_id_fkey(
          id,
          brand,
          model,
          image_urls,
          owner:profiles!cars_owner_id_fkey(
            id,
            full_name
          )
        )
      `)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to create booking', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createSuccessResponse(booking, 'Booking created successfully', HttpStatus.CREATED);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 