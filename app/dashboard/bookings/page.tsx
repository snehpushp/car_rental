'use client';

import { PageSection } from '@/components/layout/page-section';
import { useAuthContext } from '@/lib/context/auth-context';
import { Booking } from '@/lib/types/database';
import useSWR from 'swr';
import { BookingList } from '@/components/booking/booking-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const bookingStatuses = ['upcoming', 'ongoing', 'completed', 'pending', 'cancelled', 'rejected'];

export default function MyBookingsPage() {
    const { user: profile, isLoading: authLoading } = useAuthContext();
    const router = useRouter();

    const { data: response, error, isLoading: bookingsLoading } = useSWR(
        profile ? '/api/bookings/my-bookings' : null, 
        fetcher
    );

    useEffect(() => {
        if (!authLoading && !profile) {
            router.replace('/auth/login?redirect=/dashboard/bookings');
        }
    }, [profile, authLoading, router]);

    const isLoading = authLoading || bookingsLoading;

    if (isLoading) {
        return (
            <PageSection>
                <div className="container mx-auto">
                    <Skeleton className="h-10 w-1/4 mb-4" />
                    <Skeleton className="h-12 w-full mb-8" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </PageSection>
        )
    }

    if (error || (response && !response.success)) {
        return (
            <PageSection>
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error?.message || response?.error || 'Failed to load bookings.'}</AlertDescription>
                </Alert>
            </PageSection>
        );
    }

    const bookings = response?.data?.data as Booking[] || [];

    const filteredBookings = (status: string) => bookings.filter(b => b.status === status);

    return (
        <PageSection>
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                       {bookingStatuses.map(status => (
                           <TabsTrigger key={status} value={status} className="capitalize">{status}</TabsTrigger>
                       ))}
                    </TabsList>
                    {bookingStatuses.map(status => (
                        <TabsContent key={status} value={status}>
                            <BookingList bookings={filteredBookings(status)} />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </PageSection>
    )
} 