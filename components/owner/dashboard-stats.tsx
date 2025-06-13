'use client';

import StatCard from "@/components/shared/stat-card";
import { DollarSign, Car, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardStatsProps {
  stats: {
    totalCars: number;
    pendingBookings: number;
    activeBookings: number;
    totalRevenue: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const { totalCars, pendingBookings, activeBookings, totalRevenue } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={<DollarSign className="h-5 w-5" />}
        description="Lifetime earnings"
      />
      <StatCard
        title="Total Cars"
        value={totalCars}
        icon={<Car className="h-5 w-5" />}
        description="Active listings"
      />
      <StatCard
        title="Pending Bookings"
        value={pendingBookings}
        icon={<Clock className="h-5 w-5" />}
        description="Awaiting your approval"
      />
      <StatCard
        title="Active Bookings"
        value={activeBookings}
        icon={<CheckCircle className="h-5 w-5" />}
        description="Upcoming or in-progress"
      />
    </div>
  );
} 