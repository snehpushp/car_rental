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
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Featured Cars</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">Discover our hand-picked selection of premium vehicles from trusted owners</p>
        </div>
        <Button 
          variant="outline" 
          asChild
          className="border-border text-foreground hover:bg-muted px-6 py-3 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Link href="/cars" className="inline-flex items-center">
            View All Cars
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
      <CarGrid cars={cars} />
    </div>
  );
}

FeaturedCars.Skeleton = function FeaturedCarsSkeleton() {
    return (
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Featured Cars</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl">Discover our hand-picked selection of premium vehicles from trusted owners</p>
                </div>
                <Button 
                  variant="outline" 
                  asChild
                  className="border-border text-foreground hover:bg-muted px-6 py-3 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Link href="/cars" className="inline-flex items-center">
                    View All Cars
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
            </div>
            <CarGrid isLoading={true} skeletonCount={8} />
        </div>
    );
} 