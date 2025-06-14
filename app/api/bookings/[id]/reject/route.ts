import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  requireRole
} from '@/lib/utils/api-helpers';
import { uuidSchema, bookingStatusUpdateSchema } from '@/lib/validation/schemas';
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
    // Require owner role
    const auth = await requireRole('owner');
    if (auth instanceof Response) return auth;
    
    // Validate booking ID
    const bookingId = uuidSchema.parse(params.id);
    
    // Parse and validate request body
    const body = await request.json();
    const { rejection_reason } = body;
    
    // Validate rejection reason is provided
    if (!rejection_reason || typeof rejection_reason !== 'string' || rejection_reason.trim().length === 0) {
      return createErrorResponse('Rejection reason is required', HttpStatus.BAD_REQUEST);
    }
    
    const supabase = await getSupabaseRouteHandler();
    
    // Get booking details with car info to verify ownership
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        car:cars!bookings_car_id_fkey(
          id,
          owner_id,
          brand,
          model
        )
      `)
      .eq('id', bookingId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      console.error('Database error:', fetchError);
      return createErrorResponse('Failed to fetch booking', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!booking || !booking.car) {
      return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    // Verify the owner owns the car
    if (booking.car.owner_id !== auth.profile.id) {
      return createErrorResponse(ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    
    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return createErrorResponse('Only pending bookings can be rejected', HttpStatus.BAD_REQUEST);
    }
    
    // Update booking status to rejected with reason
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'rejected',
        rejection_reason: rejection_reason.trim()
      })
      .eq('id', bookingId)
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
          image_urls
        )
      `)
      .single();
    
    if (updateError) {
      console.error('Database error:', updateError);
      return createErrorResponse('Failed to reject booking', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createSuccessResponse(updatedBooking, 'Booking rejected successfully');
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 