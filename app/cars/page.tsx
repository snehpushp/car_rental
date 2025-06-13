'use client';

import { CarGrid } from '@/components/shared/car-grid';
import { PageSection } from '@/components/layout/page-section';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Car, PaginatedResponse, Wishlist as WishlistItem } from '@/lib/types/database';
import { FilterSidebar } from '@/components/cars/filter-sidebar';
import { Pagination } from '@/components/shared/pagination';
import { CarSortOptions } from '@/components/cars/car-sort-options';
import { useMemo } from 'react';
import { useAuthContext } from '@/lib/context/auth-context';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BrowseCarsPage() {
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();
    const { user } = useAuthContext();
  
    const { data: carsResponse, error, isLoading } = useSWR<{ data: PaginatedResponse<Car>}>(
      `/api/cars?${queryString}`,
      fetcher
    );

    const { data: wishlistData, isLoading: isWishlistLoading } = useSWR<{ data: PaginatedResponse<WishlistItem> }>(
        user ? '/api/wishlist?limit=100' : null,
        fetcher
    );

    const wishlistedCarIds = useMemo(() => 
        new Set(wishlistData?.data?.data?.map((item) => item.car_id) ?? [])
    , [wishlistData]);

    const cars = carsResponse?.data?.data ?? [];
    const wishlistedCars = useMemo(() => 
        cars.filter((car) => wishlistedCarIds.has(car.id))
    , [cars, wishlistedCarIds]);

    const pagination = carsResponse?.data?.pagination;
    const totalResults = carsResponse?.data?.pagination?.total ?? 0;

    return (
        <PageSection className="!py-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <aside className="lg:col-span-3">
                    <div className="sticky top-24">
                        <FilterSidebar />
                    </div>
                </aside>
                <main className="lg:col-span-9">
                    <div className="mb-6 flex flex-col items-baseline gap-4 sm:flex-row sm:justify-between">
                        <p className="text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{cars.length}</span> of {totalResults} results
                        </p>
                        <div className="flex items-center gap-4">
                            <CarSortOptions />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            {user && wishlistedCars.length > 0 && (
                                <div className="mb-12">
                                    <h2 className="text-3xl font-bold tracking-tight mb-6">From Your Wishlist</h2>
                                    <CarGrid cars={wishlistedCars} isLoading={isLoading || isWishlistLoading} user={user} skeletonCount={wishlistedCars.length > 0 ? wishlistedCars.length : 1} />
                                    <hr className="my-8" />
                                </div>
                            )}
                            <h2 className="text-3xl font-bold tracking-tight mb-6">{user && wishlistedCars.length > 0 ? 'All Cars' : ''}</h2>
                            <CarGrid cars={cars} isLoading={isLoading} skeletonCount={9} user={user} />
                        </div>
                    </div>

                    {pagination && <Pagination pagination={pagination} />}
                </main>
            </div>
        </PageSection>
    );
} 