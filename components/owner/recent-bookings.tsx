import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Calendar, User, ArrowRight } from "lucide-react";

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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Recent Pending Bookings</h3>
                        <p className="text-sm text-gray-600">These bookings require your review and approval</p>
                    </div>
                    {bookings.length > 0 && (
                        <Link href="/owner/bookings">
                            <Button variant="outline" size="sm" className="gap-2">
                                View all
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
            
            {bookings && bookings.length > 0 ? (
                <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Car
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                    <AvatarImage src={booking.customer.avatar_url || ''} alt="Avatar" />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                                                        {booking.customer.full_name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.customer.full_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 sm:hidden">
                                                        {booking.car.brand} {booking.car.model}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <div className="text-sm font-medium text-gray-900">
                                                {booking.car.brand} {booking.car.model}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                            <div className="text-sm text-gray-900">
                                                <div className="font-medium">
                                                    {format(new Date(booking.start_date), 'MMM dd, yyyy')}
                                                </div>
                                                <div className="text-gray-500">
                                                    to {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(booking.total_price)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link href={`/owner/bookings?bookingId=${booking.id}`}>
                                                <Button 
                                                    size="sm" 
                                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Review
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="px-6 py-12">
                    <div className="text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-2">No pending bookings</h3>
                        <p className="text-sm text-gray-500">
                            All caught up! New booking requests will appear here.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export function RecentBookingsSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48 bg-gray-200" />
                        <Skeleton className="h-4 w-64 bg-gray-100" />
                    </div>
                    <Skeleton className="h-8 w-20 bg-gray-200" />
                </div>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24 bg-gray-200" />
                                    <Skeleton className="h-3 w-32 bg-gray-100" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-20 bg-gray-100 hidden md:block" />
                                <Skeleton className="h-4 w-16 bg-gray-200" />
                                <Skeleton className="h-8 w-20 bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
} 