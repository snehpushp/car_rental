'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingWithRelations } from '@/lib/types/database';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { BookingActions } from './booking-actions';
import { useState } from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';

interface BookingCardProps {
  booking: BookingWithRelations;
}

const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-500 hover:bg-yellow-500/80',
    upcoming: 'bg-blue-500 hover:bg-blue-500/80',
    ongoing: 'bg-green-500 hover:bg-green-500/80',
    completed: 'bg-gray-700 hover:bg-gray-700/80',
    cancelled: 'bg-red-600 hover:bg-red-600/80',
    rejected: 'bg-red-800 hover:bg-red-800/80',
};

export function BookingCard({ booking: initialBooking }: BookingCardProps) {
    const [booking, setBooking] = useState(initialBooking);

    if (!booking.car) {
        return (
            <Card className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40 text-center col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold text-destructive">Booking Error</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    This booking is associated with a car that has been deleted.
                </p>
            </Card>
        )
    }

    const handleCancelSuccess = () => {
      setBooking(prevBooking => ({ ...prevBooking, status: 'cancelled' as const }));
    };

    return (
        <Card className="group overflow-hidden rounded-lg shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
            <CardHeader className="relative p-0">
                <Link href={`/cars/${booking.car.id}`} className="block">
                    <Image
                        src={booking.car.image_urls?.[0] || '/images/placeholder-car.png'}
                        alt={`${booking.car.brand} ${booking.car.model}`}
                        width={400}
                        height={250}
                        className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>
                <Badge className={cn("absolute top-3 right-3 text-white", statusColors[booking.status])}>
                    {booking.status}
                </Badge>
            </CardHeader>
            
            <CardContent className="p-4">
                <Link href={`/cars/${booking.car.id}`}>
                    <CardTitle className="mb-2 line-clamp-1 text-lg font-bold group-hover:text-primary">
                        {booking.car.brand} {booking.car.model} ({booking.car.year})
                    </CardTitle>
                </Link>
                
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1.5 h-4 w-4" />
                    <span className="line-clamp-1">{booking.car.location_text}</span>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">From</p>
                                <p className="text-muted-foreground">
                                    {format(new Date(booking.start_date), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">To</p>
                                <p className="text-muted-foreground">
                                    {format(new Date(booking.end_date), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-border">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-foreground">Total Price</p>
                            <p className="text-lg font-bold text-foreground">{formatCurrency(booking.total_price)}</p>
                        </div>
                    </div>

                    {booking.status === 'rejected' && booking.rejection_reason && (
                        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="font-semibold text-destructive text-sm">Reason for Rejection</p>
                            <p className="text-sm text-destructive mt-1">
                                {booking.rejection_reason}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
            
            <CardFooter className="flex items-center justify-end bg-muted/20 p-4 mt-auto border-t border-border">
                <BookingActions booking={booking} onCancelSuccess={handleCancelSuccess} />
            </CardFooter>
        </Card>
    );
} 