import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient as getSupabaseServer } from '@/lib/supabase/server';
import DashboardStats from '@/components/owner/dashboard-stats';
import RecentBookings from '@/components/owner/recent-bookings';
import { StatCardSkeleton } from '@/components/shared/stat-card';
import { RecentBookingsSkeleton } from '@/components/owner/recent-bookings';

// Helper to create an authenticated fetch function
const createServerFetch = () => {
  const cookieStore = cookies();
  const supabase = getSupabaseServer(cookieStore);

  return async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers(options.headers);
    if (session) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
    }
    
    // Construct the full URL if it's a relative path
    const fullUrl = new URL(url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

    const response = await fetch(fullUrl.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
        // Log the error for server-side debugging
        console.error(`API Error: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error('Error Body:', errorBody);
        // You might want to throw an error or return a specific structure
        throw new Error(`Failed to fetch ${url}`);
    }
    
    return response.json();
  };
};


async function OwnerDashboardData() {
  const serverFetch = createServerFetch();

  try {
    const data = await serverFetch('/api/owner/dashboard-stats');
    return (
      <>
        <DashboardStats stats={data.stats} />
        <RecentBookings bookings={data.recentBookings} />
      </>
    );
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    // You could return a more specific error component here
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
            <p className="text-center text-red-500">Could not load dashboard data.</p>
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
            <RecentBookingsSkeleton />
          </div>
      }>
        <OwnerDashboardData />
      </Suspense>
    </div>
  );
} 