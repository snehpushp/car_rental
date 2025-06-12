import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Booking, BookingStatus } from '@/lib/types/database';
import BookingList from '@/components/owner/booking-list';

const createServerFetch = () => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
  
    return async (url: string, options: RequestInit = {}) => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = new Headers(options.headers);
      if (session) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
      }
      
      const fullUrl = new URL(url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
      const response = await fetch(fullUrl.toString(), {
        ...options,
        headers,
        cache: 'no-store',
      });
  
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Error:', response.status, errorBody);
        throw new Error(`Failed to fetch ${url}`);
      }
      
      return response.json();
    };
};

async function getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    const serverFetch = createServerFetch();
    const response = await serverFetch(`/api/owner/bookings?status=${status}`);
    // The API wraps data in another data object, so we access response.data.bookings
    return response.data.bookings || [];
}

export default function OwnerBookingsPage() {
    const statuses: BookingStatus[] = ['pending', 'upcoming', 'ongoing', 'completed', 'rejected', 'cancelled'];
  
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            {statuses.map(status => (
                <TabsTrigger key={status} value={status} className="capitalize">{status}</TabsTrigger>
            ))}
          </TabsList>
          {statuses.map(status => (
            <TabsContent key={status} value={status}>
                <Suspense fallback={<p>Loading bookings...</p>}>
                    <BookingDataTab status={status} />
                </Suspense>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
}

async function BookingDataTab({ status }: { status: BookingStatus }) {
    const bookings = await getBookingsByStatus(status);
    return <BookingList bookings={bookings} status={status} />;
} 