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

async function getDashboardData() {
  const cookieStore = cookies();
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

  const supabase = createClient(cookieStore);

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
      <div className="space-y-8">
        <DashboardStats stats={stats} />
        <DashboardCharts data={chartData} />
        <RecentBookings bookings={recentBookings} />
      </div>
    );
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    return (
      <div className="text-center text-red-500 py-8">
        <p>Could not load dashboard data.</p>
        <p>You may not be registered as an owner or there was a network issue.</p>
      </div>
    );
  }
}


export default function OwnerDashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>
      <Suspense fallback={
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-[400px] w-full bg-muted rounded-lg animate-pulse" />
            <div className="h-[400px] w-full bg-muted rounded-lg animate-pulse" />
          </div>
          <RecentBookingsSkeleton />
        </div>
      }>
        <OwnerDashboardData />
      </Suspense>
    </div>
  );
} 