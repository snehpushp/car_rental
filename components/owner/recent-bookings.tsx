import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Define the structure of a booking based on the API response
interface Booking {
    id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    customer: {
        full_name: string;
        avatar_url: string | null;
    };
    car: {
        brand: string;
        model: string;
    };
}

interface RecentBookingsProps {
    bookings: Booking[];
}

export default function RecentBookings({ bookings }: RecentBookingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Pending Bookings</CardTitle>
                <CardDescription>
                    These bookings require your review and approval.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden sm:table-cell">Car</TableHead>
                            <TableHead className="hidden sm:table-cell">Dates</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings && bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="hidden h-9 w-9 sm:flex">
                                                <AvatarImage src={booking.customer.avatar_url || ''} alt="Avatar" />
                                                <AvatarFallback>{booking.customer.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{booking.customer.full_name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {booking.car.brand} {booking.car.model}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {format(new Date(booking.start_date), 'LLL dd, y')} - {format(new Date(booking.end_date), 'LLL dd, y')}
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(booking.total_price)}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/owner/bookings?bookingId=${booking.id}`}>
                                            <Button size="sm">View</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No pending bookings.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function RecentBookingsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32 hidden sm:block" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
} 