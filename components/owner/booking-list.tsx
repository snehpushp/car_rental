import { BookingWithRelations } from '@/lib/types/database';
import { OwnerBookingCard } from './booking-card';

interface BookingListProps {
  bookings: BookingWithRelations[];
}

export default function BookingList({ bookings }: BookingListProps) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center mt-8">
        <h3 className="text-2xl font-bold tracking-tight">No bookings found</h3>
        <p className="text-sm text-muted-foreground">
          There are no bookings with this status yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <OwnerBookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
} 