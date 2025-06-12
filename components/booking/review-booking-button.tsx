'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Booking } from '@/lib/types/database';
import { ReviewForm } from './review-form';
import { useState } from 'react';

interface ReviewBookingButtonProps {
    booking: Booking;
}

export function ReviewBookingButton({ booking }: ReviewBookingButtonProps) {
    const [open, setOpen] = useState(false);
    
    // Customers can't review a car they've already reviewed
    const hasExistingReview = booking.car?.reviews?.some(r => r.booking_id === booking.id);

    if (hasExistingReview) {
        return <Button disabled variant="outline">Review Submitted</Button>
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Write a Review</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Review {booking.car?.brand} {booking.car?.model}</DialogTitle>
                    <DialogDescription>
                        Share your experience with this car to help others.
                    </DialogDescription>
                </DialogHeader>
                <ReviewForm bookingId={booking.id} carId={booking.car_id} onReviewSubmit={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
} 