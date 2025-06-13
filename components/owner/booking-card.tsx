'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { BookingWithRelations, BookingStatus } from '@/lib/types/database';
import Image from 'next/image';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import OwnerBookingActions from './owner-booking-actions';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { Calendar, Clock, DollarSign, User, MapPin } from 'lucide-react';

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

export function OwnerBookingCard({ booking: initialBooking }: BookingCardProps) {
  const [booking, setBooking] = useState(initialBooking);
  const customer = booking.customer;

  const handleActionSuccess = (newStatus: BookingStatus, rejectionReason?: string) => {
    setBooking(prev => ({
        ...prev,
        status: newStatus,
        rejection_reason: rejectionReason || prev.rejection_reason
    }));
  };

  return (
    <Card className="group overflow-hidden rounded-lg shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
        <CardHeader className="relative p-0">
            <Image
                src={booking.car?.image_urls?.[0] || '/images/placeholder-car.png'}
                alt={`${booking.car?.brand} ${booking.car?.model}`}
                width={400}
                height={250}
                className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <Badge className={cn("absolute top-3 right-3 text-white", statusColors[booking.status])}>
                {booking.status}
            </Badge>
        </CardHeader>
        
        <CardContent className="p-4">
            <CardTitle className="mb-2 line-clamp-1 text-lg font-bold text-foreground">
                {booking.car?.brand} {booking.car?.model} ({booking.car?.year})
            </CardTitle>
            
            <div className="mb-4 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1.5 h-4 w-4" />
                <span className="line-clamp-1">{booking.car?.location_text}</span>
            </div>

            <div className="space-y-4">
                {/* Customer Info */}
                {customer && (
                    <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-md">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={customer.avatar_url || ''} alt={customer.full_name} />
                            <AvatarFallback>{customer.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-foreground text-sm">Rented by</p>
                            <p className="text-muted-foreground text-sm">{customer.full_name}</p>
                        </div>
                    </div>
                )}

                {/* Booking Dates */}
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

                {/* Total Payout */}
                <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                        <p className="font-medium text-foreground">Total Payout</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(booking.total_price)}</p>
                    </div>
                </div>

                {/* Rejection Reason */}
                {booking.status === 'rejected' && booking.rejection_reason && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="font-semibold text-destructive text-sm">Rejection Reason</p>
                        <p className="text-sm text-destructive mt-1">
                            {booking.rejection_reason}
                        </p>
                    </div>
                )}
            </div>
        </CardContent>
        
        <CardFooter className="flex items-center justify-center bg-muted/20 p-4 mt-auto border-t border-border">
            <OwnerBookingActions booking={booking} onActionSuccess={handleActionSuccess} />
        </CardFooter>
    </Card>
  );
} 