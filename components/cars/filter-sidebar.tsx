'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
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

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleMultiCheckbox = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.get(name)?.split(',') || [];
    if (existing.includes(value)) {
        const newValues = existing.filter((v) => v !== value);
        if (newValues.length > 0) {
            params.set(name, newValues.join(','));
        } else {
            params.delete(name);
        }
    } else {
        params.set(name, [...existing, value].join(','));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

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
              onClick={() => router.push(pathname)}
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
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => router.push(`${pathname}?${createQueryString('search', e.target.value)}`)}
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
                  {carTypes.map(type => (
                      <div key={type} className="flex items-center space-x-3">
                          <Checkbox 
                              id={`type-${type}`} 
                              checked={searchParams.get('type')?.split(',').includes(type)}
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
                  ))}
              </div>
          </div>
          
          {/* Fuel Type */}
          <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Fuel Type</h3>
              <div className="space-y-3">
                  {fuelTypes.map(fuel => (
                       <div key={fuel} className="flex items-center space-x-3">
                          <Checkbox 
                              id={`fuel-${fuel}`} 
                              checked={searchParams.get('fuel_type')?.split(',').includes(fuel)}
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
                  ))}
              </div>
          </div>
          
          {/* Transmission */}
          <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Transmission</h3>
              <div className="space-y-3">
                  {transmissionTypes.map(transmission => (
                      <div key={transmission} className="flex items-center space-x-3">
                          <Checkbox 
                              id={`transmission-${transmission}`} 
                              checked={searchParams.get('transmission')?.split(',').includes(transmission)}
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
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
} 