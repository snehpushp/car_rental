import type { BookingStatus } from '@/lib/types/database';

/**
 * Check if a booking can be cancelled
 */
export function canCancelBooking(booking: {
  status: BookingStatus;
  start_date: string;
}): boolean {
  // Can only cancel pending bookings or upcoming bookings that start more than 24 hours from now
  if (booking.status === 'pending') return true;
  
  if (booking.status === 'upcoming') {
    const startDate = new Date(booking.start_date);
    const now = new Date();
    const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilStart > 24; // Allow cancellation up to 24 hours before start
  }
  
  return false;
}

/**
 * Check if a booking can be reviewed
 */
export function canReviewBooking(booking: { status: BookingStatus }): boolean {
  return booking.status === 'completed';
} 