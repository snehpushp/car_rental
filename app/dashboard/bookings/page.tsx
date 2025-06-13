'use client';

import { PageSection } from '@/components/layout/page-section';
import { useAuthContext } from '@/lib/context/auth-context';
import { Booking } from '@/lib/types/database';
import useSWR from 'swr';
import { BookingList } from '@/components/booking/booking-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const bookingStatuses = ['upcoming', 'ongoing', 'completed', 'pending', 'cancelled', 'rejected'];
const sortOptions = [
    { value: 'start_date-desc', label: 'Booking Date (Newest)' },
    { value: 'start_date-asc', label: 'Booking Date (Oldest)' },
    { value: 'total_price-desc', label: 'Price (High to Low)' },
    { value: 'total_price-asc', label: 'Price (Low to High)' },
];

export default function MyBookingsPage() {
    const { user: profile, isLoading: authLoading } = useAuthContext();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('start_date-desc');

    const {
        data: response,
        error,
        isLoading: bookingsLoading,
    } = useSWR(profile ? '/api/bookings/my-bookings' : null, fetcher);

    useEffect(() => {
        if (!authLoading && !profile) {
            router.replace('/auth/login?redirect=/dashboard/bookings');
        }
    }, [profile, authLoading, router]);

    const bookings = (response?.data?.data as Booking[]) || [];

    const filteredAndSortedBookings = useMemo(() => {
        let filtered = [...bookings];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(booking => {
                const searchStr = searchQuery.toLowerCase();
                // @ts-ignore
                return (
                    // @ts-ignore
                    booking.car?.brand?.toLowerCase().includes(searchStr) ||
                    // @ts-ignore
                    booking.car?.model?.toLowerCase().includes(searchStr)
                );
            });
        }

        const [key, order] = sortBy.split('-');
        filtered.sort((a, b) => {
            // @ts-ignore
            const valA = key === 'start_date' ? new Date(a.start_date).getTime() : a.total_price;
            // @ts-ignore
            const valB = key === 'start_date' ? new Date(b.start_date).getTime() : b.total_price;

            if (order === 'asc') {
                return valA - valB;
            } else {
                return valB - valA;
            }
        });

        return filtered;
    }, [bookings, statusFilter, searchQuery, sortBy]);

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
                    <AlertDescription>
                        {error?.message || response?.error || 'Failed to load bookings.'}
                    </AlertDescription>
                </Alert>
            </PageSection>
        );
    }

    return (
        <PageSection>
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input
                        placeholder="Search by car brand or model..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {bookingStatuses.map(status => (
                                <SelectItem key={status} value={status} className="capitalize">
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full md:w-[220px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <BookingList bookings={filteredAndSortedBookings} />
            </div>
        </PageSection>
    );
} 