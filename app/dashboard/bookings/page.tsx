'use client';

import { PageSection } from '@/components/layout/page-section';
import { useAuthContext } from '@/lib/context/auth-context';
import { Booking } from '@/lib/types/database';
import useSWR from 'swr';
import { BookingList } from '@/components/booking/booking-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Filter } from 'lucide-react';
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
    const { user: profile, isLoading: authLoading, isHydrated } = useAuthContext();
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
        if (isHydrated && !authLoading && !profile) {
            router.replace('/auth/login?redirect=/dashboard/bookings');
        }
    }, [profile, authLoading, router, isHydrated]);

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

    const isLoading = authLoading || bookingsLoading || !isHydrated;

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-background">
                <PageSection className="!py-8">
                    <div className="space-y-8">
                        {/* Page Header Skeleton */}
                        <div className="border-b border-border pb-6">
                            <Skeleton className="h-9 w-64 mb-2" />
                            <Skeleton className="h-5 w-80" />
                        </div>

                        {/* Filter Bar Skeleton */}
                        <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4">
                            <Skeleton className="h-10 flex-1 max-w-sm" />
                            <Skeleton className="h-10 w-full md:w-[180px]" />
                            <Skeleton className="h-10 w-full md:w-[220px]" />
                        </div>

                        {/* Results Header Skeleton */}
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-48" />
                        </div>

                        {/* Grid Skeleton */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="rounded-lg border border-border overflow-hidden">
                                    <Skeleton className="h-52 w-full" />
                                    <div className="p-4 space-y-4">
                                        <Skeleton className="h-6 w-3/4" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                        <Skeleton className="h-8 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </PageSection>
            </div>
        )
    }

    if (error || (response && !response.success)) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-background">
                <PageSection className="!py-8">
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error?.message || response?.error || 'Failed to load bookings.'}
                        </AlertDescription>
                    </Alert>
                </PageSection>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background">
            <PageSection className="!py-8">
                <div className="space-y-8">
                    {/* Page Header */}
                    <div className="border-b border-border pb-6">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
                        <p className="mt-2 text-muted-foreground">Track and manage all your car rental bookings</p>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4">
                        <div className="flex items-center gap-4 flex-1">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by car brand or model..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="max-w-sm border-border"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px] border-border">
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
                                <SelectTrigger className="w-full md:w-[220px] border-border">
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
                    </div>

                    {/* Results Header */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{filteredAndSortedBookings.length}</span> of{' '}
                            <span className="font-semibold text-foreground">{bookings.length}</span> bookings
                        </div>
                    </div>

                    {/* Bookings Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        <BookingList bookings={filteredAndSortedBookings} />
                    </div>
                </div>
            </PageSection>
        </div>
    );
} 