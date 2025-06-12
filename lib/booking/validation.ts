import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import type { BookingStatus } from '@/lib/types/database';

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface BookingConflictCheck {
  car_id: string;
  start_date: string;
  end_date: string;
  exclude_booking_id?: string; // For updates
}

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(range1: DateRange, range2: DateRange): boolean {
  const start1 = new Date(range1.start_date);
  const end1 = new Date(range1.end_date);
  const start2 = new Date(range2.start_date);
  const end2 = new Date(range2.end_date);

  // Two ranges overlap if: start1 < end2 AND start2 < end1
  return start1 < end2 && start2 < end1;
}

/**
 * Check if there are any booking conflicts for a car in a date range
 */
export async function checkBookingConflicts({
  car_id,
  start_date,
  end_date,
  exclude_booking_id
}: BookingConflictCheck): Promise<boolean> {
  try {
    const supabase = await getSupabaseRouteHandler();
    
    // Build query to find conflicting bookings
    let query = supabase
      .from('bookings')
      .select('id, start_date, end_date, status')
      .eq('car_id', car_id)
      .in('status', ['pending', 'upcoming', 'ongoing'] as BookingStatus[]);
    
    // Exclude specific booking ID if provided (for updates)
    if (exclude_booking_id) {
      query = query.neq('id', exclude_booking_id);
    }
    
    const { data: existingBookings, error } = await query;
    
    if (error) {
      console.error('Error checking booking conflicts:', error);
      throw new Error('Failed to check booking availability');
    }
    
    if (!existingBookings || existingBookings.length === 0) {
      return false; // No conflicts
    }
    
    // Check if any existing booking overlaps with the requested date range
    const requestedRange: DateRange = { start_date, end_date };
    
    return existingBookings.some(booking => 
      dateRangesOverlap(requestedRange, {
        start_date: booking.start_date,
        end_date: booking.end_date
      })
    );
  } catch (error) {
    console.error('Error in checkBookingConflicts:', error);
    throw error;
  }
}

/**
 * Check if a car is available for booking
 */
export async function isCarAvailable(car_id: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseRouteHandler();
    
    const { data: car, error } = await supabase
      .from('cars')
      .select('is_available')
      .eq('id', car_id)
      .single();
    
    if (error) {
      console.error('Error checking car availability:', error);
      return false;
    }
    
    return car?.is_available || false;
  } catch (error) {
    console.error('Error in isCarAvailable:', error);
    return false;
  }
}

/**
 * Validate booking date range
 */
export function validateBookingDateRange(start_date: string, end_date: string): {
  valid: boolean;
  error?: string;
} {
  const start = new Date(start_date);
  const end = new Date(end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  // Start date must be today or in the future
  if (start < today) {
    return { valid: false, error: 'Start date must be today or in the future' };
  }
  
  // End date must be after start date
  if (end <= start) {
    return { valid: false, error: 'End date must be after start date' };
  }
  
  // Maximum booking duration (e.g., 30 days)
  const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  if (end.getTime() - start.getTime() > maxDuration) {
    return { valid: false, error: 'Booking duration cannot exceed 30 days' };
  }
  
  // Minimum booking duration (e.g., 1 day)
  const minDuration = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  if (end.getTime() - start.getTime() < minDuration) {
    return { valid: false, error: 'Minimum booking duration is 1 day' };
  }
  
  return { valid: true };
}

/**
 * Get conflicting bookings for a date range (useful for error messages)
 */
export async function getConflictingBookings({
  car_id,
  start_date,
  end_date,
  exclude_booking_id
}: BookingConflictCheck) {
  try {
    const supabase = await getSupabaseRouteHandler();
    
    let query = supabase
      .from('bookings')
      .select(`
        id,
        start_date,
        end_date,
        status,
        customer:profiles!bookings_customer_id_fkey(full_name)
      `)
      .eq('car_id', car_id)
      .in('status', ['pending', 'upcoming', 'ongoing'] as BookingStatus[]);
    
    if (exclude_booking_id) {
      query = query.neq('id', exclude_booking_id);
    }
    
    const { data: existingBookings, error } = await query;
    
    if (error) {
      throw new Error('Failed to fetch conflicting bookings');
    }
    
    if (!existingBookings) return [];
    
    const requestedRange: DateRange = { start_date, end_date };
    
    return existingBookings.filter(booking => 
      dateRangesOverlap(requestedRange, {
        start_date: booking.start_date,
        end_date: booking.end_date
      })
    );
  } catch (error) {
    console.error('Error in getConflictingBookings:', error);
    return [];
  }
}

/**
 * Calculate number of days between two dates
 */
export function calculateBookingDays(start_date: string, end_date: string): number {
  const start = new Date(start_date);
  const end = new Date(end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

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