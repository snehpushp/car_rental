'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { BookingWithRelations } from '@/lib/types/database';
import Image from 'next/image';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import OwnerBookingActions from './owner-booking-actions';
import { Badge } from '../ui/badge';

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

export function OwnerBookingCard({ booking }: BookingCardProps) {
  return (
    <Card key={booking.id} className="flex flex-col overflow-hidden">
        <div className="relative">
            <Image
                src={booking.car?.image_urls?.[0] || '/images/placeholder-car.png'}
                alt={booking.car?.brand || 'Car image'}
                width={400}
                height={200}
                className="object-cover w-full aspect-video"
            />
            <Badge className={cn("absolute top-2 right-2 text-white", statusColors[booking.status])}>
                {booking.status}
            </Badge>
        </div>
      <CardHeader className='p-4'>
        <CardTitle className="text-lg font-bold truncate">
            {booking.car?.brand} {booking.car?.model}
        </CardTitle>
        <CardDescription>{booking.car?.year}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow space-y-4">
         <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
                <p className="font-semibold">From</p>
                <p className="text-muted-foreground">
                    {format(new Date(booking.start_date), 'MMM d, yyyy')}
                </p>
            </div>
             <div>
                <p className="font-semibold">To</p>
                <p className="text-muted-foreground">
                    {format(new Date(booking.end_date), 'MMM d, yyyy')}
                </p>
             </div>
         </div>
         <div>
            <p className="font-semibold">Total Payout</p>
            <p className="text-sm font-bold text-green-600">{formatCurrency(booking.total_price)}</p>
         </div>
         {booking.status === 'rejected' && booking.rejection_reason && (
             <div>
                <p className="font-semibold text-destructive">Rejection Reason</p>
                <p className="text-sm text-destructive bg-red-50 border border-destructive rounded-md p-2">
                    {booking.rejection_reason}
                </p>
             </div>
         )}
      </CardContent>
      <CardFooter className="bg-muted/40 p-2 mt-auto">
        <OwnerBookingActions booking={booking} />
      </CardFooter>
    </Card>
  );
} 