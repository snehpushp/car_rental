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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Total Cars"
        value={totalCars}
        icon={<Car className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Pending Bookings"
        value={pendingBookings}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        description="Awaiting your approval"
      />
      <StatCard
        title="Active Bookings"
        value={activeBookings}
        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        description="Upcoming or in-progress"
      />
    </div>
  );
} 