'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const sortOptions = [
    { value: 'created_desc', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'year_desc', label: 'Year: Newest' },
    { value: 'year_asc', label: 'Year: Oldest' },
    { value: 'rating_desc', label: 'Top Rated' },
];

export function CarSortOptions() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
  
    const createQueryString = useCallback(
      (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(name, value);
        return params.toString();
      },
      [searchParams]
    );

    const currentSort = searchParams.get('sort_by') ?? 'created_desc';

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select 
                defaultValue={currentSort}
                onValueChange={(value) => router.push(`${pathname}?${createQueryString('sort_by', value)}`)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select" />
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
    );
} 