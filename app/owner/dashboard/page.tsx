import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import DashboardStats from '@/components/owner/dashboard-stats';
import RecentBookings from '@/components/owner/recent-bookings';
import DashboardCharts from '@/components/owner/dashboard-charts';
import { StatCardSkeleton } from '@/components/shared/stat-card';
import { RecentBookingsSkeleton } from '@/components/owner/recent-bookings';
import { requireRole } from '@/lib/utils/api-helpers';
import { PageSection } from '@/components/layout/page-section';

async function getDashboardData() {
  const cookieStore = await cookies();
  // First, ensure the user is an authenticated owner.
  const auth = await requireRole('owner');
  // requireRole returns a Response object on failure, which we can't use directly in a server component.
  // We need to check the type and handle the redirect/error case.
  // A simple check is to see if it has a 'status' property, indicating a Response.
  if ('status' in auth) {
    // In a real app, you might redirect or throw an error.
    // For now, we'll throw an error that will be caught by the catch block.
    // The middleware should handle the redirect anyway, but this is a safeguard.
    throw new Error('Unauthorized or not an owner.');
  }
  const ownerId = auth.profile.id;

  const supabase = await createClient();

  // 1. Get owner's car IDs
  const { data: ownerCars, error: ownerCarsError } = await supabase
    .from('cars')
    .select('id')
    .eq('owner_id', ownerId);

  if (ownerCarsError) throw new Error('Failed to fetch owner cars');
  const ownerCarIds = ownerCars.map(c => c.id);

  if (ownerCarIds.length === 0) {
    return { 
      stats: { totalCars: 0, pendingBookings: 0, activeBookings: 0, totalRevenue: 0 }, 
      recentBookings: [],
      chartData: { monthlyRevenue: [], bookingStatusDistribution: [] }
    };
  }

  // 2. Get all bookings for stats
  const { data: allBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('status, total_price, created_at')
    .in('car_id', ownerCarIds);

  if (bookingsError) throw new Error('Failed to fetch booking statistics');

  const pendingBookingsCount = allBookings.filter(b => b.status === 'pending').length;
  const upcomingBookingsCount = allBookings.filter(b => b.status === 'upcoming').length;
  const ongoingBookingsCount = allBookings.filter(b => b.status === 'ongoing').length;
  const totalRevenue = allBookings
    .filter(b => b.status === 'completed')
    .reduce((acc, b) => acc + (b.total_price || 0), 0);

  const stats = {
    totalCars: ownerCarIds.length,
    pendingBookings: pendingBookingsCount,
    activeBookings: upcomingBookingsCount + ongoingBookingsCount,
    totalRevenue: totalRevenue,
  };

  // Chart Data Processing
  const now = new Date();
  const aYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      name: month.toLocaleString('default', { month: 'short' }),
      revenue: 0,
    };
  }).reverse();

  const bookingStatusDistribution = [
      { name: 'Pending', value: 0 },
      { name: 'Upcoming', value: 0 },
      { name: 'Ongoing', value: 0 },
      { name: 'Completed', value: 0 },
      { name: 'Cancelled', value: 0 },
      { name: 'Rejected', value: 0 },
  ];

  allBookings.forEach(b => {
    // Monthly revenue for completed bookings
    if (b.status === 'completed' && b.created_at) {
      const bookingDate = new Date(b.created_at);
      if (bookingDate >= aYearAgo) {
        const monthIndex = 11 - (now.getMonth() - bookingDate.getMonth() + 12 * (now.getFullYear() - bookingDate.getFullYear()));
        if (monthIndex >= 0 && monthIndex < 12) {
            monthlyRevenue[monthIndex].revenue += b.total_price || 0;
        }
      }
    }

    // Booking status distribution
    switch (b.status) {
        case 'pending': bookingStatusDistribution[0].value++; break;
        case 'upcoming': bookingStatusDistribution[1].value++; break;
        case 'ongoing': bookingStatusDistribution[2].value++; break;
        case 'completed': bookingStatusDistribution[3].value++; break;
        case 'cancelled': bookingStatusDistribution[4].value++; break;
        case 'rejected': bookingStatusDistribution[5].value++; break;
    }
  });

  const chartData = {
    monthlyRevenue,
    bookingStatusDistribution: bookingStatusDistribution.filter(d => d.value > 0),
  };

  // 3. Get recent pending bookings
  const { data: recentBookings, error: recentBookingsError } = await supabase
    .from('bookings')
    .select(`
      id, created_at, start_date, end_date, total_price, status,
      customer:profiles!bookings_customer_id_fkey(full_name, avatar_url),
      car:cars!bookings_car_id_fkey(brand, model)
    `)
    .in('car_id', ownerCarIds)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentBookingsError) throw new Error('Failed to fetch recent bookings');

  return { stats, recentBookings, chartData };
}


async function OwnerDashboardData() {
  try {
    const { stats, recentBookings, chartData } = await getDashboardData();
    return (
      <>
        {/* Stats Grid */}
        <DashboardStats stats={stats} />
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DashboardCharts data={chartData} />
        </div>
        
        {/* Recent Bookings */}
        <RecentBookings bookings={recentBookings} />
      </>
    );
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-sm text-gray-600 max-w-md">
            Could not load dashboard data. You may not be registered as an owner or there was a network issue.
          </p>
        </div>
      </div>
    );
  }
}


export default function OwnerDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor your car rental business performance and manage bookings</p>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          <Suspense fallback={
            <div className="space-y-6">
              {/* Stats Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
              
              {/* Charts Skeleton */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Revenue Chart Skeleton */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-80 w-full bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
                
                {/* Bookings Chart Skeleton */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="space-y-2">
                      <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-52 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-80 w-full bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="space-y-2 text-center">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                      <div className="h-3 w-40 bg-gray-100 rounded animate-pulse mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Bookings Skeleton */}
              <RecentBookingsSkeleton />
            </div>
          }>
            <OwnerDashboardData />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 