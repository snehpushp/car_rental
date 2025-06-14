import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Car } from '@/lib/types/database';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

async function CarsTable() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-sm text-gray-600">Please log in to see your cars.</p>
        </div>
      </div>
    );
  }

  const { data: cars, error } = await supabase
    .from('cars')
    .select('*, bookings(count)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cars:', error);
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Cars</h3>
          <p className="text-sm text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  const carsWithBookingCount =
    cars?.map((car) => ({
      ...car,
      booking_count: car.bookings[0]?.count || 0,
    })) || [];

  if (carsWithBookingCount.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex h-64 flex-col items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cars Listed</h3>
            <p className="text-sm text-gray-600 mb-4">Start by adding your first car to the platform.</p>
            <Link href="/owner/cars/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Car
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Car
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price/Day
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Bookings
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {carsWithBookingCount.map((car) => (
              <tr key={car.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                      {car.image_urls && car.image_urls.length > 0 ? (
                        <Image
                          src={car.image_urls[0]}
                          alt={`${car.brand} ${car.model}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {car.brand} {car.model}
                      </div>
                      <div className="text-sm text-gray-600">
                        {car.year} • {car.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(car.price_per_day)}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    car.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {car.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-900">
                    {car.booking_count} bookings
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <Link href={`/owner/cars/edit/${car.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      >
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/cars/${car.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-gray-600 border-gray-200 hover:bg-gray-50"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CarsTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Car
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price/Day
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Bookings
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-16 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="py-4 px-6">
                  <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
                </td>
                <td className="py-4 px-6">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CarManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Cars</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your car listings and track their performance</p>
          </div>
          <Link href="/owner/cars/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Car
            </Button>
          </Link>
        </div>

        {/* Cars Table */}
        <Suspense fallback={<CarsTableSkeleton />}>
          <CarsTable />
        </Suspense>
      </div>
    </div>
  );
} 