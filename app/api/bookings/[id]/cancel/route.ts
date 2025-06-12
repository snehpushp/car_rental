import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  requireRole
} from '@/lib/utils/api-helpers';
import { uuidSchema } from '@/lib/validation/schemas';
import { canCancelBooking } from '@/lib/booking/validation';
import type { Booking } from '@/lib/types/database';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require customer role
    const auth = await requireRole('customer');
    if (auth instanceof Response) return auth;
    
    // Validate booking ID
    const bookingId = uuidSchema.parse(params.id);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('customer_id', auth.profile.id) // Ensure customer owns the booking
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      console.error('Database error:', fetchError);
      return createErrorResponse('Failed to fetch booking', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!booking) {
      return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    // Check if booking can be cancelled
    if (!canCancelBooking(booking)) {
      return createErrorResponse(ErrorMessages.BOOKING_NOT_CANCELABLE, HttpStatus.BAD_REQUEST);
    }
    
    // Update booking status to cancelled
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        rejection_reason: null // Clear any previous rejection reason
      })
      .eq('id', bookingId)
      .select(`
        *,
        car:cars!bookings_car_id_fkey(
          id,
          brand,
          model,
          image_urls
        )
      `)
      .single();
    
    if (updateError) {
      console.error('Database error:', updateError);
      return createErrorResponse('Failed to cancel booking', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createSuccessResponse(updatedBooking, 'Booking cancelled successfully');
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 