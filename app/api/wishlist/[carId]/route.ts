import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  requireRole
} from '@/lib/utils/api-helpers';
import { uuidSchema } from '@/lib/validation/schemas';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';

interface RouteParams {
  params: { carId: string };
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require customer role
    const auth = await requireRole('customer');
    if (auth instanceof Response) return auth;
    
    // Validate car ID
    const carId = uuidSchema.parse(params.carId);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Find and delete the wishlist item
    const { data: deletedItem, error } = await supabase
      .from('wishlists')
      .delete()
      .eq('customer_id', auth.profile.id)
      .eq('car_id', carId)
      .select('id')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Car not found in your wishlist', HttpStatus.NOT_FOUND);
      }
      console.error('Database error:', error);
      return createErrorResponse('Failed to remove car from wishlist', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!deletedItem) {
      return createErrorResponse('Car not found in your wishlist', HttpStatus.NOT_FOUND);
    }
    
    return createSuccessResponse(null, 'Car removed from wishlist successfully');
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 