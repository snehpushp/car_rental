import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  requireAuth
} from '@/lib/utils/api-helpers';
import { profileUpdateSchema } from '@/lib/validation/schemas';
import type { Profile } from '@/lib/types/database';
import { HttpStatus } from '@/lib/types/api';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    
    const supabase = await getSupabaseRouteHandler();
    
    // Fetch user profile with additional stats
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', auth.profile.id)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!profile) {
      return createErrorResponse('Profile not found', HttpStatus.NOT_FOUND);
    }
    
    // Get additional user statistics based on role
    let stats = {};
    
    if (profile.role === 'customer') {
      // Get customer booking statistics
      const { data: bookingStats } = await supabase
        .from('bookings')
        .select('status')
        .eq('customer_id', profile.id);
      
      const { data: reviewStats } = await supabase
        .from('reviews')
        .select('id')
        .eq('customer_id', profile.id);
      
      const { data: wishlistStats } = await supabase
        .from('wishlists')
        .select('id')
        .eq('customer_id', profile.id);
      
      stats = {
        total_bookings: bookingStats?.length || 0,
        completed_bookings: bookingStats?.filter(b => b.status === 'completed').length || 0,
        total_reviews: reviewStats?.length || 0,
        wishlist_items: wishlistStats?.length || 0
      };
    } else if (profile.role === 'owner') {
      // Get owner statistics
      const { data: carStats } = await supabase
        .from('cars')
        .select('id, is_available')
        .eq('owner_id', profile.id);
      
      const { data: bookingStats } = await supabase
        .from('bookings')
        .select('status, total_price, car:cars!bookings_car_id_fkey(owner_id)')
        .eq('car.owner_id', profile.id);
      
      const totalRevenue = bookingStats
        ?.filter(b => b.status === 'completed')
        .reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;
      
      stats = {
        total_cars: carStats?.length || 0,
        available_cars: carStats?.filter(c => c.is_available).length || 0,
        total_bookings: bookingStats?.length || 0,
        pending_bookings: bookingStats?.filter(b => b.status === 'pending').length || 0,
        total_revenue: totalRevenue
      };
    }
    
    const profileWithStats = {
      ...profile,
      statistics: stats
    };
    
    return createSuccessResponse(profileWithStats);
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    
    const body = await request.json();
    const updateData = profileUpdateSchema.parse(body);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', auth.profile.id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to update profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createSuccessResponse(updatedProfile, 'Profile updated successfully');
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 