'use client';

import { PageSection } from '@/components/layout/page-section';
import { useAuthContext } from '@/lib/context/auth-context';
import { Car } from '@/lib/types/database';
import useSWR from 'swr';
import { CarGrid } from '@/components/shared/car-grid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Filter, Search } from 'lucide-react';
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

const sortOptions = [
    { value: 'brand-asc', label: 'Brand (A-Z)' },
    { value: 'brand-desc', label: 'Brand (Z-A)' },
    { value: 'model-asc', label: 'Model (A-Z)' },
    { value: 'model-desc', label: 'Model (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'year-desc', label: 'Year (Newest)' },
    { value: 'year-asc', label: 'Year (Oldest)' },
];

const carTypes = ['sedan', 'suv', 'hatchback', 'convertible', 'coupe', 'wagon', 'truck', 'van'];

export default function WishlistPage() {
    const { user: profile, isLoading: authLoading, isHydrated } = useAuthContext();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('brand-asc');

    const {
        data: response,
        error,
        isLoading: wishlistLoading,
        mutate,
    } = useSWR(profile ? '/api/wishlist' : null, fetcher);

    useEffect(() => {
        if (isHydrated && !authLoading && !profile) {
            router.replace('/auth/login?redirect=/dashboard/wishlist');
        }
    }, [profile, authLoading, router, isHydrated]);

    const wishlistedCars = useMemo(() => {
        if (!response?.data?.data) return [];
        return response.data.data.map((item: any) => ({
            ...item.car,
            is_wishlisted: true,
        })) as Car[];
    }, [response?.data?.data]);

    const filteredAndSortedCars = useMemo(() => {
        let filtered = [...wishlistedCars];

        if (typeFilter !== 'all') {
            filtered = filtered.filter(car => car.type === typeFilter);
        }

        if (searchQuery) {
            const searchStr = searchQuery.toLowerCase();
            filtered = filtered.filter(car => 
                car.brand.toLowerCase().includes(searchStr) ||
                car.model.toLowerCase().includes(searchStr) ||
                car.location_text.toLowerCase().includes(searchStr)
            );
        }

        const [key, order] = sortBy.split('-');
        filtered.sort((a, b) => {
            let valA: any, valB: any;
            
            switch (key) {
                case 'brand':
                    valA = a.brand.toLowerCase();
                    valB = b.brand.toLowerCase();
                    break;
                case 'model':
                    valA = a.model.toLowerCase();
                    valB = b.model.toLowerCase();
                    break;
                case 'price':
                    valA = a.price_per_day;
                    valB = b.price_per_day;
                    break;
                case 'year':
                    valA = a.year;
                    valB = b.year;
                    break;
                default:
                    return 0;
            }

            if (typeof valA === 'string') {
                return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else {
                return order === 'asc' ? valA - valB : valB - valA;
            }
        });

        return filtered;
    }, [wishlistedCars, typeFilter, searchQuery, sortBy]);

    const isLoading = authLoading || wishlistLoading || !isHydrated;

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
                                        <Skeleton className="h-4 w-1/2" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 pt-0">
                                        <Skeleton className="h-8 w-1/3" />
                                        <Skeleton className="h-10 w-1/4" />
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
                            {error?.message || response?.error || 'Failed to load wishlist.'}
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
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Wishlist</h1>
                        <p className="mt-2 text-muted-foreground">Your saved cars for future bookings</p>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4">
                        <div className="flex items-center gap-4 flex-1">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by brand, model, or location..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="max-w-sm border-border"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full md:w-[180px] border-border">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {carTypes.map(type => (
                                        <SelectItem key={type} value={type} className="capitalize">
                                            {type}
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
                            Showing <span className="font-semibold text-foreground">{filteredAndSortedCars.length}</span> of{' '}
                            <span className="font-semibold text-foreground">{wishlistedCars.length}</span> cars
                        </div>
                    </div>

                    {/* Cars Grid */}
                    <div className="space-y-6">
                        {filteredAndSortedCars.length > 0 ? (
                            <CarGrid cars={filteredAndSortedCars} user={profile} />
                        ) : wishlistedCars.length === 0 && response ? (
                            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40">
                                <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
                                <p className="mt-2 text-muted-foreground">
                                    Browse cars and click the heart to save them for later.
                                </p>
                            </div>
                        ) : response ? (
                            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40">
                                <h3 className="text-xl font-semibold">No cars match your filters</h3>
                                <p className="mt-2 text-muted-foreground">
                                    Try adjusting your search or filter criteria.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </PageSection>
        </div>
    );
}
