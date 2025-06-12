import { CarGrid } from '@/components/shared/car-grid';
import { Button } from '@/components/ui/button';
import { Car } from '@/lib/types/database';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

async function getFeaturedCars(): Promise<Car[]> {
  // On the server, we need to use the full URL
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/cars?limit=8`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  if (!response.ok) {
    // You could log the error here or handle it more gracefully
    console.error('Failed to fetch featured cars');
    return [];
  }

  const data = await response.json();
  return data.data.data; // The API returns { success: true, data: { data: Car[], pagination: ... } }
}

export async function FeaturedCars() {
  const cars = await getFeaturedCars();

  return (
    <div className="mt-24">
       <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Featured Cars</h2>
        <Button variant="outline" asChild>
          <Link href="/cars">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <CarGrid cars={cars} />
    </div>
  );
}

FeaturedCars.Skeleton = function FeaturedCarsSkeleton() {
    return (
        <div className="mt-24">
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Featured Cars</h2>
                <Button variant="outline" asChild>
                <Link href="/cars">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </Button>
            </div>
            <CarGrid isLoading={true} skeletonCount={8} />
        </div>
    );
} 