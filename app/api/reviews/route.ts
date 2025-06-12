import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  requireRole
} from '@/lib/utils/api-helpers';
import { reviewCreateSchema } from '@/lib/validation/schemas';
import { canReviewBooking } from '@/lib/booking/validation';
import type { Review, ReviewCreateRequest } from '@/lib/types/database';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';

export async function POST(request: NextRequest) {
  try {
    // Require customer role
    const auth = await requireRole('customer');
    if (auth instanceof Response) return auth;
    
    const body = await request.json();
    const reviewData: ReviewCreateRequest = reviewCreateSchema.parse(body);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Get booking details to validate review eligibility
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_id,
        car_id,
        status,
        car:cars!bookings_car_id_fkey(
          id,
          brand,
          model
        )
      `)
      .eq('id', reviewData.booking_id)
      .eq('customer_id', auth.profile.id) // Ensure customer owns the booking
      .single();
    
    if (bookingError) {
      if (bookingError.code === 'PGRST116') {
        return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      console.error('Database error:', bookingError);
      return createErrorResponse('Failed to fetch booking', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!booking) {
      return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    // Check if booking can be reviewed
    if (!canReviewBooking(booking)) {
      return createErrorResponse(ErrorMessages.REVIEW_NOT_ALLOWED, HttpStatus.BAD_REQUEST);
    }
    
    // Check if review already exists for this booking
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', reviewData.booking_id)
      .single();
    
    if (existingReview) {
      return createErrorResponse(ErrorMessages.REVIEW_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }
    
    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        customer_id: auth.profile.id,
        car_id: booking.car_id,
        booking_id: reviewData.booking_id,
        rating: reviewData.rating,
        comment: reviewData.comment || null
      })
      .select(`
        *,
        customer:profiles!reviews_customer_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        car:cars!reviews_car_id_fkey(
          id,
          brand,
          model
        )
      `)
      .single();
    
    if (reviewError) {
      console.error('Database error:', reviewError);
      return createErrorResponse('Failed to create review', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createSuccessResponse(review, 'Review created successfully', HttpStatus.CREATED);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 