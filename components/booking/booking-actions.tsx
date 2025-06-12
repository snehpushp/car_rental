import { Booking } from '@/lib/types/database';
import { CancelBookingButton } from './cancel-booking-button';
import { ReviewBookingButton } from './review-booking-button';
import { canCancelBooking } from '@/lib/booking/client-validation';

interface BookingActionsProps {
  booking: Booking;
}

export function BookingActions({ booking }: BookingActionsProps) {
  const isCancelable = canCancelBooking(booking);

  return (
    <div className="flex items-center gap-2">
      {isCancelable && <CancelBookingButton bookingId={booking.id} />}
      {booking.status === 'completed' && <ReviewBookingButton booking={booking} />}
    </div>
  );
} 