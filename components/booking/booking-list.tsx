import { BookingCard } from './booking-card';
import { BookingWithRelations } from '@/lib/types/database';

interface BookingListProps {
  bookings: BookingWithRelations[];
}

export function BookingList({ bookings }: BookingListProps) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center mt-8 col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-2xl font-bold tracking-tight">No bookings found</h3>
        <p className="text-sm text-muted-foreground">
          Your search returned no results. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <>
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </>
  );
} 