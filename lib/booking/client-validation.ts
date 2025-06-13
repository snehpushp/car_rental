import type { BookingStatus } from '@/lib/types/database';

/**
 * Check if a booking can be cancelled
 */
export function canCancelBooking(booking: {
  status: BookingStatus;
  start_date: string;
}): boolean {
  // Only pending bookings can be cancelled
  return booking.status === 'pending';
}

/**
 * Check if a booking can be reviewed
 */
export function canReviewBooking(booking: { status: BookingStatus }): boolean {
  return booking.status === 'completed';
} 