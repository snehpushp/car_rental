'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { BookingWithRelations, BookingStatus } from '@/lib/types/database';
import BookingList from '@/components/owner/booking-list';
import { PageSection } from '@/components/layout/page-section';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState('start_date-desc');

    const {
        data: response,
        error,
        isLoading,
    } = useSWR('/api/owner/bookings', fetcher, { revalidateOnFocus: false });

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

    if (isLoading) {
        return (
            <PageSection>
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                         <Skeleton className="h-10 w-full md:w-1/3" />
                         <Skeleton className="h-10 w-full md:w-[180px]" />
                         <Skeleton className="h-10 w-full md:w-[220px]" />
                    </div>
                    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-80 w-full" />
                        <Skeleton className="h-80 w-full" />
                        <Skeleton className="h-80 w-full" />
                    </div>
                </div>
            </PageSection>
        )
    }

    if (error || (response && !response.success)) {
        return (
            <PageSection>
                 <div className="container mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error?.message || response?.error || 'Failed to load bookings.'}
                        </AlertDescription>
                    </Alert>
                </div>
            </PageSection>
        );
    }

    return (
        <PageSection>
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input
                        placeholder="Search by car, model, or renter..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
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