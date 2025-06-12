import { Booking } from '@/lib/types/database';
import { BookingCard } from './booking-card';

interface BookingListProps {
  bookings: Booking[];
}

export function BookingList({ bookings }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40 p-12 text-center">
        <h3 className="text-xl font-semibold">No bookings found</h3>
        <p className="mt-2 text-muted-foreground">
          You don't have any bookings with this status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
} 