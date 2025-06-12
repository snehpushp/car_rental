'use client';

import { CarGrid } from '@/components/shared/car-grid';
import { PageSection } from '@/components/layout/page-section';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Car, PaginatedResponse } from '@/lib/types/database';
import { FilterSidebar } from '@/components/cars/filter-sidebar';
import { Pagination } from '@/components/shared/pagination';
import { CarSortOptions } from '@/components/cars/car-sort-options';
import { CarsMap } from '@/components/maps/cars-map';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BrowseCarsPage() {
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();
  
    const { data, error, isLoading } = useSWR<PaginatedResponse<Car>>(
      `/api/cars?${queryString}`,
      fetcher
    );

    const cars = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const totalResults = data?.data?.pagination?.total ?? 0;

    const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(true);

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
                        <div className="flex items-center space-x-2">
                            <Switch id="show-map" checked={showMap} onCheckedChange={setShowMap} />
                            <Label htmlFor="show-map">Show Map</Label>
                        </div>
                        <CarSortOptions />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className={showMap ? "lg:col-span-7" : "lg:col-span-12"}>
                        {/* TODO: Add hover effect to highlight car on map */}
                        <CarGrid cars={cars} isLoading={isLoading} skeletonCount={9} />
                    </div>
                    {showMap && (
                        <div className="lg:col-span-5">
                            <div className="sticky top-24">
                                <CarsMap cars={cars} selectedCarId={selectedCarId} onMarkerClick={setSelectedCarId} />
                            </div>
                        </div>
                    )}
                </div>

                {pagination && <Pagination pagination={pagination} />}
            </main>
        </div>
    </PageSection>
  );
} 