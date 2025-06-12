import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  getPaginationParams,
  createPaginationMeta
} from '@/lib/utils/api-helpers';
import { carFiltersSchema, validateQueryParams } from '@/lib/validation/schemas';
import type { Car, PaginatedResponse, CarFilters } from '@/lib/types/database';
import { HttpStatus } from '@/lib/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);
    
    // Validate and parse filters
    const filters = validateQueryParams(carFiltersSchema, searchParams);
    
    const supabase = await getSupabaseRouteHandler();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    let wishlistedCarIds: Set<string> = new Set();
    if (userId) {
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('car_id')
        .eq('customer_id', userId);
      
      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
        // Not returning an error, just proceeding without wishlist data
      } else {
        wishlistedCarIds = new Set(wishlistData.map(w => w.car_id));
      }
    }
    
    // Build base query with joins
    let query = supabase
      .from('cars')
      .select(`
        *,
        owner:profiles!cars_owner_id_fkey(id, full_name, avatar_url),
        reviews(rating)
      `, { count: 'exact' })
      .eq('is_available', true);
    
    // Apply filters
    if (filters.brand) {
      query = query.ilike('brand', `%${filters.brand}%`);
    }
    
    if (filters.model) {
      query = query.ilike('model', `%${filters.model}%`);
    }
    
    if (filters.fuel_type) {
      query = query.eq('fuel_type', filters.fuel_type);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.transmission) {
      query = query.eq('transmission', filters.transmission);
    }
    
    if (filters.min_price) {
      query = query.gte('price_per_day', filters.min_price);
    }
    
    if (filters.max_price) {
      query = query.lte('price_per_day', filters.max_price);
    }
    
    if (filters.year_min) {
      query = query.gte('year', filters.year_min);
    }
    
    if (filters.year_max) {
      query = query.lte('year', filters.year_max);
    }
    
    // Search functionality
    if (filters.search) {
      query = query.or(`brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // Location-based filtering (if provided)
    if (filters.location && filters.radius) {
      // This would require PostGIS extension for proper distance calculations
      // For now, we'll use a simple text search on location
      query = query.ilike('location_text', `%${filters.location}%`);
    }
    
    // Apply sorting
    switch (filters.sort_by) {
      case 'price_asc':
        query = query.order('price_per_day', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_per_day', { ascending: false });
        break;
      case 'year_desc':
        query = query.order('year', { ascending: false });
        break;
      case 'year_asc':
        query = query.order('year', { ascending: true });
        break;
      case 'created_desc':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        // Default sorting by created_at desc
        query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: cars, error, count } = await query;
    
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
    
    // Calculate average ratings, review counts, and wishlist status
    const carsWithDetails: Car[] = cars.map(car => {
      const reviews = car.reviews || [];
      const total_reviews = reviews.length;
      const average_rating = total_reviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / total_reviews 
        : 0;
      
      return {
        ...car,
        reviews: undefined, // Remove reviews array to keep response clean
        average_rating: Math.round(average_rating * 10) / 10, // Round to 1 decimal place
        total_reviews,
        is_wishlisted: wishlistedCarIds.has(car.id)
      };
    });
    
    // Apply rating-based sorting if specified (after calculating ratings)
    if (filters.sort_by === 'rating_desc') {
      carsWithDetails.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }
    
    const response: PaginatedResponse<Car> = {
      data: carsWithDetails,
      pagination: createPaginationMeta(page, limit, count)
    };
    
    return createSuccessResponse(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 