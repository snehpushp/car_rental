'use client';

import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { BookingWithRelations, BookingStatus } from '@/lib/types/database';
import BookingList from '@/components/owner/booking-list';
import { PageSection } from '@/components/layout/page-section';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const bookingStatuses: BookingStatus[] = ['pending', 'upcoming', 'ongoing', 'completed', 'rejected', 'cancelled'];
const sortOptions = [
    { value: 'start_date-desc', label: 'Booking Date (Newest)' },
    { value: 'start_date-asc', label: 'Booking Date (Oldest)' },
    { value: 'total_price-desc', label: 'Price (High to Low)' },
    { value: 'total_price-asc', label: 'Price (Low to High)' },
];

export default function OwnerBookingsPage() {
    const { user: profile, isLoading: authLoading, isHydrated } = useAuthContext();
    const router = useRouter();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState('start_date-desc');

    const {
        data: response,
        error,
        isLoading: bookingsLoading,
    } = useSWR(profile?.role === 'owner' ? '/api/owner/bookings' : null, fetcher, { revalidateOnFocus: false });

    useEffect(() => {
        if (isHydrated && !authLoading && (!profile || profile.role !== 'owner')) {
            router.replace('/auth/login?redirect=/owner/bookings');
        }
    }, [profile, authLoading, router, isHydrated]);

    const allBookings = (response?.data?.data?.bookings as BookingWithRelations[]) || [];

    const filteredAndSortedBookings = useMemo(() => {
        let filtered = [...allBookings];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(booking => {
                const searchStr = searchQuery.toLowerCase();
                const car = booking.car;
                const user = booking.user;
                return (
                    car?.brand?.toLowerCase().includes(searchStr) ||
                    car?.model?.toLowerCase().includes(searchStr) ||
                    user?.full_name?.toLowerCase().includes(searchStr)
                );
            });
        }

        const [key, order] = sortBy.split('-');
        filtered.sort((a, b) => {
            const valA = key === 'start_date' ? new Date(a.start_date).getTime() : a.total_price;
            const valB = key === 'start_date' ? new Date(b.start_date).getTime() : b.total_price;
            return order === 'asc' ? valA - valB : valB - valA;
        });

        return filtered;
    }, [allBookings, statusFilter, searchQuery, sortBy]);

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
                            <div className="flex items-center gap-4 flex-1">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-10 flex-1 max-w-sm" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Skeleton className="h-10 w-full md:w-[180px]" />
                                <Skeleton className="h-10 w-full md:w-[220px]" />
                            </div>
                        </div>

                        {/* Results Header Skeleton */}
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-48" />
                        </div>

                        {/* Grid Skeleton */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="rounded-lg border border-border overflow-hidden shadow-sm">
                                    {/* Image skeleton */}
                                    <Skeleton className="h-52 w-full" />
                                    
                                    <div className="p-4 space-y-4">
                                        {/* Title skeleton */}
                                        <Skeleton className="h-6 w-3/4" />
                                        
                                        {/* Location skeleton */}
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>

                                        {/* Customer info skeleton */}
                                        <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-md">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>

                                        {/* Booking dates skeleton */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center space-x-2">
                                                <Skeleton className="h-4 w-4" />
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-12" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Skeleton className="h-4 w-4" />
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-8" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Total payout skeleton */}
                                        <div className="flex items-center space-x-2 pt-2 border-t border-border">
                                            <Skeleton className="h-4 w-4" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Footer skeleton */}
                                    <div className="bg-muted/20 p-4 border-t border-border">
                                        <Skeleton className="h-9 w-full" />
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
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Bookings</h1>
                        <p className="mt-2 text-muted-foreground">Review and manage all booking requests for your cars</p>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4">
                        <div className="flex items-center gap-4 flex-1">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by car, model, or renter..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="max-w-sm border-border"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
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
                            <span className="font-semibold text-foreground">{allBookings.length}</span> bookings
                        </div>
                    </div>

                    {/* Bookings Grid */}
                    <BookingList bookings={filteredAndSortedBookings} />
                </div>
            </PageSection>
        </div>
    );
} 