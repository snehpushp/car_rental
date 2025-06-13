'use client';

import { Booking } from '@/lib/types/database';
import { CancelBookingButton } from './cancel-booking-button';
import { ReviewBookingButton } from './review-booking-button';
import { canCancelBooking } from '@/lib/booking/client-validation';
import { useState } from 'react';

interface BookingActionsProps {
  booking: Booking;
  onCancelSuccess: () => void;
}

export function BookingActions({ booking: initialBooking, onCancelSuccess }: BookingActionsProps) {
  const [booking, setBooking] = useState(initialBooking);
  const isCancelable = canCancelBooking(booking);

  const handleCancelSuccess = () => {
    setBooking(prevBooking => ({ ...prevBooking, status: 'cancelled' }));
    onCancelSuccess();
  };

  return (
    <div className="flex items-center gap-2">
      {isCancelable && <CancelBookingButton bookingId={booking.id} onSuccess={handleCancelSuccess} />}
      {booking.status === 'completed' && <ReviewBookingButton booking={booking} />}
    </div>
  );
} 