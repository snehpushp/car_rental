import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError
} from '@/lib/utils/api-helpers';
import { uuidSchema } from '@/lib/validation/schemas';
import type { Car } from '@/lib/types/database';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Validate car ID
    const carId = uuidSchema.parse(params.id);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Fetch car with owner information and reviews
    const { data: car, error } = await supabase
      .from('cars')
      .select(`
        *,
        owner:profiles!cars_owner_id_fkey(
          id,
          full_name,
          avatar_url,
          created_at
        ),
        reviews(
          id,
          rating,
          comment,
          created_at,
          customer:profiles!reviews_customer_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', carId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch car details', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!car) {
      return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    // Calculate review statistics
    const reviews = car.reviews || [];
    const total_reviews = reviews.length;
    const average_rating = total_reviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / total_reviews 
      : 0;
    
    // Sort reviews by creation date (newest first)
    const sortedReviews = reviews.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const carWithStats: Car = {
      ...car,
      reviews: sortedReviews,
      average_rating: Math.round(average_rating * 10) / 10, // Round to 1 decimal place
      total_reviews
    };
    
    return createSuccessResponse(carWithStats);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 