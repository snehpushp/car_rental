'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CancelBookingButtonProps {
    bookingId: string;
    onSuccess: () => void;
}

export function CancelBookingButton({ bookingId, onSuccess }: CancelBookingButtonProps) {
    const handleCancel = async () => {
        const promise = fetch(`/api/bookings/${bookingId}/cancel`, {
            method: 'PATCH',
        }).then(res => {
            if (!res.ok) {
                throw new Error('Failed to cancel booking.');
            }
            return res.json();
        });

        toast.promise(promise, {
            loading: 'Cancelling booking...',
            success: () => {
                onSuccess();
                return 'Booking cancelled successfully.';
            },
            error: 'Failed to cancel booking.'
        })
    }
    
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel Booking</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently cancel your booking request.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Back</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>Yes, Cancel</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
} 