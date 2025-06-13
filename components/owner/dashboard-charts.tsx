'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, Sector, XAxis, YAxis } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { ChartConfig } from '@/components/ui/chart';

const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(220, 70%, 50%)',
  },
} satisfies ChartConfig;

const bookingStatusChartConfig = {
  bookings: {
    label: 'Bookings',
  },
  pending: {
    label: 'Pending',
    color: '#F59E0B',
  },
  upcoming: {
    label: 'Upcoming',
    color: '#3B82F6',
  },
  ongoing: {
    label: 'Ongoing',
    color: '#22C55E',
  },
  completed: {
    label: 'Completed',
    color: '#6B7280',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#DC2626',
  },
  rejected: {
    label: 'Rejected',
    color: '#991B1B',
  }
} satisfies ChartConfig;

interface ChartData {
  monthlyRevenue: { name: string; revenue: number }[];
  bookingStatusDistribution: { name: string; value: number }[];
}

export default function DashboardCharts({ data }: { data: ChartData }) {
    const [activeIndex, setActiveIndex] = React.useState(0);
    
    if (!data || !data.monthlyRevenue || !data.bookingStatusDistribution) {
        return (
            <>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="h-80 w-full bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-52 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="h-80 w-full bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                </div>
            </>
        )
    }
    
    const { monthlyRevenue, bookingStatusDistribution } = data;
    const totalRevenue = monthlyRevenue.reduce((acc, curr) => acc + curr.revenue, 0);

    const donutChartData = bookingStatusDistribution.map(status => ({
      name: status.name.toLowerCase(),
      value: status.value,
      fill: `var(--color-${status.name.toLowerCase()})`,
    }));

    const totalBookings = bookingStatusDistribution.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <>
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
                <p className="text-sm text-gray-600">Last 12 months performance</p>
            </div>
            <div className="p-6">
                <ChartContainer config={revenueChartConfig} className="h-80 w-full">
                    <BarChart accessibilityLayer data={monthlyRevenue}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <ChartTooltip
                            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                            <LabelList
                                position="top"
                                offset={8}
                                className="fill-gray-700"
                                fontSize={10}
                                formatter={(value: number) => value > 0 ? `$${value.toLocaleString()}` : ''}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                        Total: ${totalRevenue.toLocaleString()}
                    </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                    Showing total revenue for the last 12 months
                </p>
            </div>
        </div>
        
        {/* Bookings Status Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Bookings by Status</h3>
                <p className="text-sm text-gray-600">Current distribution of all bookings</p>
            </div>
            <div className="p-6">
                <ChartContainer
                    config={bookingStatusChartConfig}
                    className="h-80 w-full"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={donutChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={120}
                            strokeWidth={2}
                            stroke="#ffffff"
                            activeIndex={activeIndex}
                            activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                                <Sector {...props} outerRadius={outerRadius + 8} />
                            )}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                        />
                        <ChartLegend 
                            content={<ChartLegendContent nameKey="name" />}
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                    </PieChart>
                </ChartContainer>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                        {totalBookings} total bookings
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Showing distribution of all bookings by status
                    </p>
                </div>
            </div>
        </div>
    </>
  );
} 