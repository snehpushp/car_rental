'use client';

import { BookingWithRelations } from '@/lib/types/database';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import { Label } from '../ui/label';
import { BookingStatus } from '@/lib/types/database';

interface OwnerBookingActionsProps {
  booking: BookingWithRelations;
  onActionSuccess: (status: BookingStatus, reason?: string) => void;
}

async function handleBookingAction(
  bookingId: string, 
  action: 'confirm' | 'reject', 
  reason?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  const url = `/api/bookings/${bookingId}/${action}`;
  const options: RequestInit = {
    method: action === 'reject' ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
  };
  if (reason) {
    options.body = JSON.stringify({ rejection_reason: reason });
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      // Attempt to parse error, but have a fallback
      try {
        const errorData = await response.json();
        return { success: false, error: errorData.error || `Failed to ${action} booking.` };
      } catch (e) {
        return { success: false, error: `Failed to ${action} booking. Server returned ${response.status}.` };
      }
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in handleBookingAction (${action}):`, error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export default function OwnerBookingActions({ booking, onActionSuccess }: OwnerBookingActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const onConfirm = async () => {
    toast.loading('Confirming booking...');
    const result = await handleBookingAction(booking.id, 'confirm');
    if (result.success) {
      toast.success('Booking confirmed successfully!');
      onActionSuccess('upcoming');
    } else {
      toast.error(result.error || 'Failed to confirm booking.');
    }
  };

  const onReject = async () => {
    if (!rejectionReason.trim()) {
        toast.error('Rejection reason is required.');
        return;
    }
    toast.loading('Rejecting booking...');
    const result = await handleBookingAction(booking.id, 'reject', rejectionReason);
     if (result.success) {
      toast.success('Booking rejected successfully!');
      onActionSuccess('rejected', rejectionReason);
      setDialogOpen(false);
    } else {
      toast.error(result.error || 'Failed to reject booking.');
    }
  };

  switch (booking.status) {
    case 'pending':
      return (
        <div className="flex justify-end gap-2 w-full">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Booking</DialogTitle>
                <DialogDescription>
                  Please provide a reason for rejecting this booking. This will be shared with the customer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="rejection_reason">Reason</Label>
                <Textarea
                  id="rejection_reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Vehicle is unavailable for the requested dates due to maintenance."
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={onReject}>Confirm Rejection</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      );
    // Add cases for other statuses here if needed
    // e.g., contact customer, view details, etc.
    default:
      return null;
  }
} 