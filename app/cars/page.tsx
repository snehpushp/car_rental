'use client';

import { CarGrid } from '@/components/shared/car-grid';
import { PageSection } from '@/components/layout/page-section';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Car, PaginatedResponse } from '@/lib/types/database';
import { FilterSidebar } from '@/components/cars/filter-sidebar';
import { Pagination } from '@/components/shared/pagination';
import { CarSortOptions } from '@/components/cars/car-sort-options';
import { useState } from 'react';
import { useAuthContext } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BrowseCarsPage() {
    const searchParams = useSearchParams();
    const { user } = useAuthContext();
    const [showFilters, setShowFilters] = useState(false);

    // Create query string with limit of 12
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has('limit')) {
        params.set('limit', '12');
    }
    const queryString = params.toString();
  
    const { data: carsResponse, error, isLoading } = useSWR<{ data: PaginatedResponse<Car>}>(
      `/api/cars?${queryString}`,
      fetcher
    );

    const cars = carsResponse?.data?.data ?? [];
    const pagination = carsResponse?.data?.pagination;
    const totalResults = carsResponse?.data?.pagination?.total ?? 0;

    return (
        <div className="min-h-screen bg-background">
            <PageSection className="!py-8">
                <div className="space-y-8">
                    {/* Page Header */}
                    <div className="border-b border-border pb-6">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Browse Cars</h1>
                        <p className="mt-2 text-muted-foreground">Find the perfect car for your next adventure</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                        {/* Desktop Filter Sidebar */}
                        <aside className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-24">
                                <FilterSidebar showHeader={true} />
                            </div>
                        </aside>

                        {/* Mobile Filter Overlay */}
                        {showFilters && (
                            <div className="fixed inset-0 z-50 lg:hidden">
                                {/* Backdrop */}
                                <div 
                                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                                    onClick={() => setShowFilters(false)}
                                />
                                
                                {/* Filter Panel */}
                                <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-card border-r border-border shadow-xl">
                                    <div className="flex h-full flex-col">
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-border p-4">
                                            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowFilters(false)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        {/* Filter Content */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                            <FilterSidebar showHeader={false} />
                                        </div>
                                        
                                        {/* Footer */}
                                        <div className="border-t border-border p-4">
                                            <Button
                                                className="w-full"
                                                onClick={() => setShowFilters(false)}
                                            >
                                                Apply Filters
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Content */}
                        <main className="lg:col-span-3 space-y-6">
                            {/* Mobile Filter Button + Results Header */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card border border-border p-4">
                                <div className="flex items-center gap-4">
                                    {/* Mobile Filter Toggle */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowFilters(true)}
                                        className="lg:hidden border-border"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filters
                                    </Button>
                                    
                                    <div className="text-sm text-muted-foreground">
                                        Showing <span className="font-semibold text-foreground">{cars.length}</span> of{' '}
                                        <span className="font-semibold text-foreground">{totalResults}</span> results
                                    </div>
                                </div>
                                
                                <CarSortOptions />
                            </div>

                            {/* Results Content */}
                            <div className="space-y-6">
                                <CarGrid cars={cars} isLoading={isLoading} skeletonCount={12} user={user} />
                            </div>

                            {/* Pagination */}
                            {pagination && (
                                <div className="border-t border-border pt-8">
                                    <Pagination pagination={pagination} />
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </PageSection>
        </div>
    );
} 