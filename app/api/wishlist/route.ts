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
import { uuidSchema } from '@/lib/validation/schemas';
import type { Wishlist, PaginatedResponse } from '@/lib/types/database';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';

export async function GET(request: NextRequest) {
  try {
    // Require customer role
    const auth = await requireRole('customer');
    if (auth instanceof Response) return auth;
    
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Fetch user's wishlist with car details
    const { data: wishlist, error, count } = await supabase
      .from('wishlists')
      .select(`
        *,
        car:cars!wishlists_car_id_fkey(
          id,
          brand,
          model,
          year,
          type,
          fuel_type,
          transmission,
          price_per_day,
          image_urls,
          location_text,
          is_available,
          owner:profiles!cars_owner_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `, { count: 'exact' })
      .eq('customer_id', auth.profile.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch wishlist', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!wishlist || count === null) {
      return createSuccessResponse<PaginatedResponse<Wishlist>>({
        data: [],
        pagination: createPaginationMeta(page, limit, 0)
      });
    }
    
    const response: PaginatedResponse<Wishlist> = {
      data: wishlist,
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
    // Require customer role
    const auth = await requireRole('customer');
    if (auth instanceof Response) return auth;
    
    const body = await request.json();
    const { car_id } = body;
    
    // Validate car ID
    const carId = uuidSchema.parse(car_id);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Check if car exists and is available
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id, is_available, owner_id')
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
    
    // Prevent users from adding their own cars to wishlist
    if (car.owner_id === auth.profile.id) {
      return createErrorResponse('You cannot add your own car to wishlist', HttpStatus.BAD_REQUEST);
    }
    
    // Check if already in wishlist
    const { data: existingWishlist } = await supabase
      .from('wishlists')
      .select('id')
      .eq('customer_id', auth.profile.id)
      .eq('car_id', carId)
      .single();
    
    if (existingWishlist) {
      return createErrorResponse('Car is already in your wishlist', HttpStatus.CONFLICT);
    }
    
    // Add to wishlist
    const { data: wishlistItem, error: insertError } = await supabase
      .from('wishlists')
      .insert({
        customer_id: auth.profile.id,
        car_id: carId
      })
      .select(`
        *,
        car:cars!wishlists_car_id_fkey(
          id,
          brand,
          model,
          year,
          type,
          price_per_day,
          image_urls,
          location_text,
          is_available
        )
      `)
      .single();
    
    if (insertError) {
      console.error('Database error:', insertError);
      return createErrorResponse('Failed to add car to wishlist', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createSuccessResponse(wishlistItem, 'Car added to wishlist successfully', HttpStatus.CREATED);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 