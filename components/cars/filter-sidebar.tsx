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

export function FilterSidebar() {
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
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="search">Search Keywords</Label>
          <Input 
            id="search" 
            placeholder="Brand or model..." 
            defaultValue={searchParams.get('search') ?? ''}
            onChange={(e) => router.push(`${pathname}?${createQueryString('search', e.target.value)}`)}
          />
        </div>

        <div>
            <Label>Location</Label>
            <LocationInput 
                onLocationSelect={(loc) => router.push(`${pathname}?${createQueryString('location', loc.address)}`)}
                defaultValue={searchParams.get('location') ?? ''}
            />
        </div>

        <Accordion type="multiple" defaultValue={['price', 'type']} className="w-full">
            <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent className="pt-4">
                    <Label>Max Price: ${price}</Label>
                    <Slider
                        defaultValue={[price]}
                        max={500}
                        min={50}
                        step={10}
                        onValueCommit={(value) => router.push(`${pathname}?${createQueryString('max_price', String(value[0]))}`)}
                    />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="type">
                <AccordionTrigger>Car Type</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                    {carTypes.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`type-${type}`} 
                                checked={searchParams.get('type')?.split(',').includes(type)}
                                onCheckedChange={() => handleMultiCheckbox('type', type)}
                            />
                            <label htmlFor={`type-${type}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">{type}</label>
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="fuel">
                <AccordionTrigger>Fuel Type</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                    {fuelTypes.map(fuel => (
                         <div key={fuel} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`fuel-${fuel}`} 
                                checked={searchParams.get('fuel_type')?.split(',').includes(fuel)}
                                onCheckedChange={() => handleMultiCheckbox('fuel_type', fuel)}
                            />
                            <label htmlFor={`fuel-${fuel}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">{fuel}</label>
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="transmission">
                <AccordionTrigger>Transmission</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                    {transmissionTypes.map(transmission => (
                        <div key={transmission} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`transmission-${transmission}`} 
                                checked={searchParams.get('transmission')?.split(',').includes(transmission)}
                                onCheckedChange={() => handleMultiCheckbox('transmission', transmission)}
                            />
                            <label htmlFor={`transmission-${transmission}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">{transmission}</label>
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push(pathname)}
        >
            Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
} 