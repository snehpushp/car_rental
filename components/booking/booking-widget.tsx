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
    <div className="space-y-6">
      {/* Price Display */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">${car.price_per_day}</span>
          <span className="text-lg text-muted-foreground">per day</span>
        </div>
        <p className="text-sm text-muted-foreground">Select your dates to see total price</p>
      </div>

      {/* Date Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Rental Period</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-full h-12 justify-start text-left font-medium border-border hover:border-border/80 bg-background',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Select pickup and return dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-border shadow-xl" align="start">
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
      </div>

      {/* Price Breakdown */}
      {numberOfDays > 0 && (
        <div className="space-y-4 p-4 bg-muted/20 border border-border">
          <h4 className="font-medium text-foreground">Price Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">${car.price_per_day} × {numberOfDays} days</span>
              <span className="text-foreground">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Booking Button */}
      <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button 
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={!dateRange?.from || !dateRange?.to || isLoading}
              >
                  {isLoading ? 'Processing...' : 'Request to Book'}
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-border bg-card">
              <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Confirm Your Booking</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                      Please review your booking details before confirming.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-3 p-4 bg-muted/20 border border-border">
                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                          <span className="font-medium text-foreground">Car:</span>
                          <span className="text-muted-foreground">{car.brand} {car.model}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="font-medium text-foreground">Dates:</span>
                          <span className="text-muted-foreground">
                              {dateRange?.from && format(dateRange.from, 'LLL dd, y')} - {dateRange?.to && format(dateRange.to, 'LLL dd, y')}
                          </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                          <span className="font-semibold text-foreground">Total Price:</span>
                          <span className="font-semibold text-foreground">${totalPrice.toFixed(2)}</span>
                      </div>
                  </div>
              </div>
              <AlertDialogFooter>
                  <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                      onClick={handleBooking}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                      Confirm & Book
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}