'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, Sector, XAxis, YAxis } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    color: 'var(--chart-1)',
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
    color: '#374151',
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
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-60 w-full bg-muted rounded-lg animate-pulse" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Bookings by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-60 w-full bg-muted rounded-lg animate-pulse" />
                    </CardContent>
                </Card>
            </div>
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
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2 my-8">
        <Card>
            <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={revenueChartConfig}>
                    <BarChart accessibilityLayer data={monthlyRevenue}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) => `$${value.toLocaleString()}`}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
                Total Revenue: ${totalRevenue.toLocaleString()}
                <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
                Showing total revenue for the last 12 months
            </div>
            </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Bookings by Status</CardTitle>
                <CardDescription>Current distribution of all bookings</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={bookingStatusChartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
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
                            strokeWidth={5}
                            activeIndex={activeIndex}
                            activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                                <Sector {...props} outerRadius={outerRadius + 10} />
                            )}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                        />
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    {totalBookings} total bookings
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing distribution of all bookings by status.
                </div>
            </CardFooter>
        </Card>
    </div>
  );
} 