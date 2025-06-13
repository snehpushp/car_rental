import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Car } from '@/lib/types/database';

async function CarsDataTable() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This should ideally not happen if the page is protected
    return <div>Please log in to see your cars.</div>;
  }

  const { data: cars, error } = await supabase
    .from('cars')
    .select('*, bookings(count)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cars:', error);
    return <div>Error loading cars. Please try again later.</div>;
  }

  const carsWithBookingCount =
    cars?.map((car) => ({
      ...car,
      booking_count: car.bookings[0]?.count || 0,
    })) || [];

  return <DataTable columns={columns} data={carsWithBookingCount} />;
}

export default function CarManagementPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Cars</h1>
        <Link href="/owner/cars/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Car
          </Button>
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <CarsDataTable />
      </Suspense>
    </div>
  );
} 