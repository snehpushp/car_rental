'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { LocationInput } from '../maps/location-input';

export function BookingSearchWidget() {
  const router = useRouter();
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) {
      params.set('location', location.address);
      params.set('lat', String(location.lat));
      params.set('lng', String(location.lng));
    }
    if (dateRange?.from) {
      params.set('start_date', format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange?.to) {
      params.set('end_date', format(dateRange.to, 'yyyy-MM-dd'));
    }
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <label htmlFor="location" className="mb-2 block text-sm font-medium">
              Location
            </label>
            <LocationInput 
                onLocationSelect={(loc) => setLocation(loc)} 
            />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
          <label htmlFor="date" className="mb-2 block text-sm font-medium">
              Pickup & Drop-off Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-end">
            <Button className="w-full" size="lg" onClick={handleSearch}>
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 