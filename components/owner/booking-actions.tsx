'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";


async function updateBookingStatus(
    bookingId: string, 
    status: 'upcoming' | 'rejected', 
    rejectionReason: string | null,
    token: string | null
) {
    const url = status === 'upcoming' 
        ? `/api/bookings/${bookingId}/confirm` 
        : `/api/bookings/${bookingId}/reject`;

    const body = status === 'rejected' ? { rejection_reason: rejectionReason } : {};

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${status} booking.`);
    }

    return response.json();
}


export default function BookingActions({ bookingId }: { bookingId: string }) {
    const router = useRouter();
    const { session } = useAuth();
    const [rejectionReason, setRejectionReason] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleConfirm = async () => {
        toast.loading("Confirming booking...");
        try {
            await updateBookingStatus(bookingId, 'upcoming', null, session?.access_token || null);
            toast.success("Booking confirmed successfully!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Rejection reason cannot be empty.");
            return;
        }
        toast.loading("Rejecting booking...");
        try {
            await updateBookingStatus(bookingId, 'rejected', rejectionReason, session?.access_token || null);
            toast.success("Booking rejected.");
            setIsDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    return (
        <div className="flex w-full gap-2">
            <Button onClick={handleConfirm} className="w-full">Confirm</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">Reject</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Booking</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this booking. This will be shared with the customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="reason">Rejection Reason</Label>
                        <Textarea 
                            id="reason" 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Car is unavailable for maintenance."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject}>Reject Booking</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 