'use client';

import { Booking } from '@/lib/types/database';
import { CancelBookingButton } from './cancel-booking-button';
import { ReviewBookingButton } from './review-booking-button';
import { canCancelBooking } from '@/lib/booking/client-validation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface BookingActionsProps {
  booking: Booking;
  onCancelSuccess: () => void;
}

export function BookingActions({ booking: initialBooking, onCancelSuccess }: BookingActionsProps) {
  const [booking, setBooking] = useState(initialBooking);
  const isCancelable = canCancelBooking(booking);

  // A booking can be reviewed if it's completed and has no reviews yet.
  // @ts-ignore
  const isReviewable = booking.status === 'completed' && (!booking.reviews || booking.reviews.length === 0);

  const handleCancelSuccess = () => {
    setBooking(prevBooking => ({ ...prevBooking, status: 'cancelled' }));
    onCancelSuccess();
  };

  return (
    <div className="flex items-center gap-2">
      {isCancelable && <CancelBookingButton bookingId={booking.id} onSuccess={handleCancelSuccess} />}
      {isReviewable && <ReviewBookingButton booking={booking} />}
      {booking.status === 'completed' && !isReviewable && (
        <Button disabled variant="outline">Review Submitted</Button>
      )}
    </div>
  );
} 