import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createErrorResponse, 
  handleApiError,
  requireRole
} from '@/lib/utils/api-helpers';
import { uuidSchema } from '@/lib/validation/schemas';
import { canCancelBooking } from '@/lib/booking/client-validation';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRole('customer');
    if (auth instanceof Response) return auth;
    
    const bookingId = uuidSchema.parse(params.id);
    const supabase = await getSupabaseRouteHandler();
    
    // First, verify the booking exists and the user owns it.
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('status, start_date')
      .eq('id', bookingId)
      .eq('customer_id', auth.profile.id)
      .single();
      
    if (fetchError || !booking) {
      return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    // Check if the booking is in a state that allows cancellation using our business logic.
    if (!canCancelBooking(booking)) {
      return createErrorResponse(ErrorMessages.BOOKING_NOT_CANCELABLE, HttpStatus.BAD_REQUEST);
    }
    
    // Atomically update the booking status.
    // The RLS policy should also enforce this, but being explicit here prevents race conditions
    // and provides a clearer result from the query.
    const { data: updatedBooking, error: updateError, count } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('customer_id', auth.profile.id) // Ensure ownership during update
      .in('status', ['pending', 'upcoming']) // Only update if in a cancelable state
      .select('id')

    if (updateError || count === 0) {
      // If count is 0, it means the record wasn't updated, likely because its status changed
      // between the fetch and the update call (race condition) or RLS failed.
      console.error('Database error during cancellation:', updateError);
      return createErrorResponse(
        'Failed to cancel booking. The booking may have been updated or is no longer cancelable.', 
        HttpStatus.CONFLICT
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { id: updatedBooking?.[0]?.id }, 
      message: 'Booking cancelled successfully' 
    });
    
  } catch (error) {
    return handleApiError(error);
  }
} 