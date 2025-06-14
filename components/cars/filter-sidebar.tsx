'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { CarType, FuelType, TransmissionType } from '@/lib/types/database';
import { LocationInput } from '../maps/location-input';

const carTypes: CarType[] = ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'truck', 'van'];
const fuelTypes: FuelType[] = ['petrol', 'diesel', 'electric', 'hybrid'];
const transmissionTypes: TransmissionType[] = ['manual', 'automatic'];

interface FilterSidebarProps {
  showHeader?: boolean;
}

export function FilterSidebar({ showHeader = true }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');

  // Update search value when URL changes
  useEffect(() => {
    setSearchValue(searchParams.get('search') ?? '');
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset to page 1 when filters change
      params.delete('page');
      return params.toString();
    },
    [searchParams]
  );

  const handleMultiCheckbox = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.get(name)?.split(',').filter(Boolean) || [];
    
    if (existing.includes(value)) {
      // Remove the value
      const newValues = existing.filter((v) => v !== value);
      if (newValues.length > 0) {
        params.set(name, newValues.join(','));
      } else {
        params.delete(name);
      }
    } else {
      // Add the value
      const newValues = [...existing, value];
      params.set(name, newValues.join(','));
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  // Helper functions to get current filter values
  const getSelectedTypes = () => {
    return searchParams.get('type')?.split(',').filter(Boolean) || [];
  };

  const getSelectedFuelTypes = () => {
    return searchParams.get('fuel_type')?.split(',').filter(Boolean) || [];
  };

  const getSelectedTransmissions = () => {
    return searchParams.get('transmission')?.split(',').filter(Boolean) || [];
  };

  const handleClearAll = () => {
    // Keep only the limit parameter when clearing all filters
    const params = new URLSearchParams();
    const limit = searchParams.get('limit');
    if (limit) {
      params.set('limit', limit);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounced search handler
  useEffect(() => {
    // Prevent re-triggering search on pagination or other filter changes
    if ((searchParams.get('search') || '') === searchValue) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) {
        params.set('search', searchValue);
      } else {
        params.delete('search');
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, searchParams, router, pathname]);

  const price = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : 500;

  return (
    <div className="space-y-6">
      {/* Filter Header - Only show on desktop */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <Button 
              variant="ghost" 
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={handleClearAll}
          >
              Clear all
          </Button>
        </div>
      )}

      {/* Search Keywords */}
      <div className="space-y-3">
        <Label htmlFor="search" className="text-sm font-medium text-foreground">Search Keywords</Label>
        <Input 
          id="search" 
          placeholder="Brand or model..." 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-10 border-border bg-background"
        />
      </div>

      {/* Location */}
      <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Location</Label>
          <LocationInput 
              onLocationSelect={(loc) => router.push(`${pathname}?${createQueryString('location', loc.address)}`)}
              defaultValue={searchParams.get('location') ?? ''}
          />
      </div>

      {/* Filter Sections */}
      <div className="space-y-6">
          {/* Price Range */}
          <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Price Range</h3>
              <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">Max Price: <span className="font-medium text-foreground">${price}</span></div>
                  <Slider
                      defaultValue={[price]}
                      max={500}
                      min={50}
                      step={10}
                      onValueCommit={(value) => router.push(`${pathname}?${createQueryString('max_price', String(value[0]))}`)}
                      className="w-full"
                  />
              </div>
          </div>
          
          {/* Car Type */}
          <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Car Type</h3>
              <div className="space-y-3">
                  {carTypes.map(type => {
                    const selectedTypes = getSelectedTypes();
                    const isChecked = selectedTypes.includes(type);
                    
                    return (
                      <div key={type} className="flex items-center space-x-3">
                          <Checkbox 
                              id={`type-${type}`} 
                              checked={isChecked}
                              onCheckedChange={() => handleMultiCheckbox('type', type)}
                              className="border-border"
                          />
                          <label 
                              htmlFor={`type-${type}`} 
                              className="text-sm text-foreground capitalize cursor-pointer select-none"
                          >
                              {type}
                          </label>
                      </div>
                    );
                  })}
              </div>
          </div>
          
          {/* Fuel Type */}
          <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Fuel Type</h3>
              <div className="space-y-3">
                  {fuelTypes.map(fuel => {
                    const selectedFuelTypes = getSelectedFuelTypes();
                    const isChecked = selectedFuelTypes.includes(fuel);
                    
                    return (
                      <div key={fuel} className="flex items-center space-x-3">
                          <Checkbox 
                              id={`fuel-${fuel}`} 
                              checked={isChecked}
                              onCheckedChange={() => handleMultiCheckbox('fuel_type', fuel)}
                              className="border-border"
                          />
                          <label 
                              htmlFor={`fuel-${fuel}`} 
                              className="text-sm text-foreground capitalize cursor-pointer select-none"
                          >
                              {fuel}
                          </label>
                      </div>
                    );
                  })}
              </div>
          </div>
          
          {/* Transmission */}
          <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Transmission</h3>
              <div className="space-y-3">
                  {transmissionTypes.map(transmission => {
                    const selectedTransmissions = getSelectedTransmissions();
                    const isChecked = selectedTransmissions.includes(transmission);
                    
                    return (
                      <div key={transmission} className="flex items-center space-x-3">
                          <Checkbox 
                              id={`transmission-${transmission}`} 
                              checked={isChecked}
                              onCheckedChange={() => handleMultiCheckbox('transmission', transmission)}
                              className="border-border"
                          />
                          <label 
                              htmlFor={`transmission-${transmission}`} 
                              className="text-sm text-foreground capitalize cursor-pointer select-none"
                          >
                              {transmission}
                          </label>
                      </div>
                    );
                  })}
              </div>
          </div>
      </div>
    </div>
  );
} 