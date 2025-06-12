import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/lib/types/database';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { BookingActions } from './booking-actions';

interface BookingCardProps {
  booking: Booking;
}

const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-500',
    upcoming: 'bg-blue-500',
    ongoing: 'bg-green-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-600',
    rejected: 'bg-red-800',
  };

export function BookingCard({ booking }: BookingCardProps) {
    if (!booking.car) {
        return (
            <Card className="p-4 text-center text-red-500">
                This booking is associated with a car that has been deleted.
            </Card>
        )
    }

  return (
    <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-muted/40 p-4">
            <CardTitle className="text-lg">Booking #{booking.id.substring(0, 8)}</CardTitle>
            <Badge className={cn("text-white", statusColors[booking.status])}>{booking.status}</Badge>
        </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        <div className="md:col-span-1">
            <Link href={`/cars/${booking.car.id}`}>
                <Image
                    src={booking.car.image_urls?.[0] || '/images/placeholder-car.png'}
                    alt={booking.car.brand}
                    width={300}
                    height={200}
                    className="rounded-md object-cover aspect-video"
                />
            </Link>
        </div>
        <div className="md:col-span-2 space-y-4">
            <Link href={`/cars/${booking.car.id}`}>
                <h3 className="text-xl font-bold hover:underline">{booking.car.brand} {booking.car.model}</h3>
            </Link>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-semibold">From</p>
                    <p>{format(new Date(booking.start_date), 'EEE, MMM dd, yyyy')}</p>
                </div>
                <div>
                    <p className="font-semibold">To</p>
                    <p>{format(new Date(booking.end_date), 'EEE, MMM dd, yyyy')}</p>
                </div>
                <div>
                    <p className="font-semibold">Total Price</p>
                    <p>{formatCurrency(booking.total_price)}</p>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/40 p-4 flex justify-end">
        <BookingActions booking={booking} />
      </CardFooter>
    </Card>
  );
} 