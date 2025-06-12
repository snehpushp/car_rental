import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { createErrorResponse, handleApiError, requireRole } from '@/lib/utils/api-helpers';
import { HttpStatus } from '@/lib/types/api';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole('owner');
    if (auth instanceof Response) return auth;
    const ownerId = auth.profile.id;

    const supabase = await getSupabaseRouteHandler();

    // Get owner's car IDs first to reuse
    const { data: ownerCars, error: ownerCarsError } = await supabase
      .from('cars')
      .select('id')
      .eq('owner_id', ownerId);

    if (ownerCarsError) {
      console.error('Error fetching owner car IDs:', ownerCarsError);
      return createErrorResponse('Failed to fetch owner cars', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const ownerCarIds = ownerCars.map(c => c.id);

    // 1. Get total car count
    const totalCars = ownerCarIds.length;

    // 2. Get all bookings for the owner's cars to calculate stats
    const { data: allBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('status, total_price')
      .in('car_id', ownerCarIds);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return createErrorResponse('Failed to fetch booking statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const pendingBookingsCount = allBookings.filter(b => b.status === 'pending').length;
    const upcomingBookingsCount = allBookings.filter(b => b.status === 'upcoming').length;
    const ongoingBookingsCount = allBookings.filter(b => b.status === 'ongoing').length;

    const totalRevenue = allBookings
      .filter(b => b.status === 'completed')
      .reduce((acc, b) => acc + (b.total_price || 0), 0);

    // 3. Get recent pending bookings (e.g., last 5)
    const { data: recentBookings, error: recentBookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        created_at,
        start_date,
        end_date,
        total_price,
        status,
        customer:profiles!bookings_customer_id_fkey(
          full_name,
          avatar_url
        ),
        car:cars!bookings_car_id_fkey(
          brand,
          model
        )
      `)
      .in('car_id', ownerCarIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentBookingsError) {
      console.error('Error fetching recent bookings:', recentBookingsError);
      return createErrorResponse('Failed to fetch recent bookings', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const stats = {
      totalCars: totalCars,
      pendingBookings: pendingBookingsCount,
      activeBookings: upcomingBookingsCount + ongoingBookingsCount,
      totalRevenue: totalRevenue,
    };

    return NextResponse.json({ stats, recentBookings });

  } catch (error) {
    return handleApiError(error);
  }
} 