import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  getPaginationParams,
  createPaginationMeta
} from '@/lib/utils/api-helpers';
import { uuidSchema } from '@/lib/validation/schemas';
import type { Review, PaginatedResponse } from '@/lib/types/database';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';

interface RouteParams {
  params: { carId: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Validate car ID
    const carId = uuidSchema.parse(params.carId);
    
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);
    
    const supabase = await getSupabaseRouteHandler();
    
    // First, verify the car exists
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id')
      .eq('id', carId)
      .single();
    
    if (carError) {
      if (carError.code === 'PGRST116') {
        return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      console.error('Database error:', carError);
      return createErrorResponse('Failed to fetch car', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!car) {
      return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    // Fetch reviews for the car
    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:profiles!reviews_customer_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        booking:bookings!reviews_booking_id_fkey(
          id,
          start_date,
          end_date
        )
      `, { count: 'exact' })
      .eq('car_id', carId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch reviews', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!reviews || count === null) {
      return createSuccessResponse<PaginatedResponse<Review>>({
        data: [],
        pagination: createPaginationMeta(page, limit, 0)
      });
    }
    
    // Calculate review statistics
    const totalReviews = count;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const ratingDistribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    };
    
    const response = {
      data: {
        reviews,
        statistics: {
          total_reviews: totalReviews,
          average_rating: Math.round(averageRating * 10) / 10,
          rating_distribution: ratingDistribution
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