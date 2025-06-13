import { BookingWithRelations } from '@/lib/types/database';
import { OwnerBookingCard } from './booking-card';

interface BookingListProps {
  bookings: BookingWithRelations[];
}

export default function BookingList({ bookings }: BookingListProps) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40 col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-xl font-semibold">No bookings found</h3>
        <p className="mt-2 text-muted-foreground">
          There are no bookings with this status yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {bookings.map((booking) => (
        <OwnerBookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
} 