import { Booking, BookingStatus } from '@/lib/types/database';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import BookingActions from './booking-actions';

interface BookingListProps {
  bookings: Booking[];
  status: BookingStatus;
}

export default function BookingList({ bookings, status }: BookingListProps) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center mt-8">
        <h3 className="text-2xl font-bold tracking-tight">No {status} bookings</h3>
        <p className="text-sm text-muted-foreground">
          You currently have no bookings with this status.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <Card key={booking.id} className="flex flex-col">
          <CardHeader className='flex-row gap-4 items-center'>
            <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                    src={booking.car.image_urls[0]}
                    alt={`${booking.car.brand} ${booking.car.model}`}
                    fill
                    className="rounded-md object-cover"
                />
            </div>
            <div>
              <CardTitle>{booking.car.brand} {booking.car.model}</CardTitle>
              <CardDescription>{booking.car.year}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={booking.customer.avatar_url || ''} />
                    <AvatarFallback>{booking.customer.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{booking.customer.full_name}</p>
                    <p className="text-sm text-muted-foreground">Renter</p>
                </div>
            </div>
             <div>
                <p className="font-semibold">Booking Dates</p>
                <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.start_date), 'MMM d, yyyy')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                </p>
             </div>
             <div>
                <p className="font-semibold">Total Price</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(booking.total_price)}</p>
             </div>
             {status === 'rejected' && booking.rejection_reason && (
                 <div>
                    <p className="font-semibold text-destructive">Rejection Reason</p>
                    <p className="text-sm text-destructive">{booking.rejection_reason}</p>
                 </div>
             )}
          </CardContent>
          <CardFooter>
            {status === 'pending' && <BookingActions bookingId={booking.id} />}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 