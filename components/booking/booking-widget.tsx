'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Car, BookingCreateRequest } from '@/lib/types/database';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { useAuthContext } from '@/lib/context/auth-context';

interface BookingWidgetProps {
  car: Car;
}

export function BookingWidget({ car }: BookingWidgetProps) {
  const router = useRouter();
  const { user: profile } = useAuthContext();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const numberOfDays = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
    }
    return 0;
  }, [dateRange]);

  const totalPrice = useMemo(() => {
    return numberOfDays * car.price_per_day;
  }, [numberOfDays, car.price_per_day]);

  const handleBooking = async () => {
    if (!dateRange?.from || !dateRange?.to) {
        toast.error('Invalid Date Range', {
          description: 'Please select a start and end date for your booking.',
        });
        return;
      }
  
      if (!profile) {
        toast.error('Authentication Required', {
            description: 'You must be logged in to make a booking.',
            action: {
              label: 'Login',
              onClick: () => router.push('/auth/login'),
            },
          });
        return;
      }

      if (profile.role === 'owner') {
        toast.error('Owners cannot book cars.', {
            description: 'Please use a customer account to make a booking.',
          });
        return;
      }

    setIsLoading(true);

    const bookingData: BookingCreateRequest = {
      car_id: car.id,
      start_date: format(dateRange.from, 'yyyy-MM-dd'),
      end_date: format(dateRange.to, 'yyyy-MM-dd'),
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking.');
      }
      
      toast.success('Booking Successful!', {
        description: 'Your booking request has been sent to the owner for confirmation.',
      });
      router.push('/dashboard/bookings');

    } catch (error: any) {
      toast.error('Booking Failed', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="text-3xl font-bold">${car.price_per_day}</span>
          <span className="text-lg font-normal text-muted-foreground">/day</span>
        </CardTitle>
        <CardDescription>Select your dates to book this car.</CardDescription>
      </CardHeader>
      <CardContent>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn('w-full justify-start text-left font-normal', !dateRange && 'text-muted-foreground')}
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
                <span>Pick your dates</span>
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
              numberOfMonths={1}
              disabled={(date) => date < new Date() || date < addDays(new Date(), 1)}
            />
          </PopoverContent>
        </Popover>

        {numberOfDays > 0 && (
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">${car.price_per_day} x {numberOfDays} days</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total Price</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    className="w-full" 
                    size="lg" 
                    disabled={!dateRange?.from || !dateRange?.to || isLoading}
                >
                    {isLoading ? 'Booking...' : 'Request to Book'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Your Booking</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please review your booking details before confirming.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                    <p><strong>Car:</strong> {car.brand} {car.model}</p>
                    <p><strong>Dates:</strong> {dateRange?.from && format(dateRange.from, 'LLL dd, y')} - {dateRange?.to && format(dateRange.to, 'LLL dd, y')}</p>
                    <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBooking}>Confirm & Book</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}