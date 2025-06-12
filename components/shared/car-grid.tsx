import { Car } from '@/lib/types/database';
import { CarCard, CarCardSkeleton } from './car-card';
import { User } from '@/lib/types/auth';

interface CarGridProps {
  cars: Car[];
  isLoading?: boolean;
  skeletonCount?: number;
  user: User | null;
}

export function CarGrid({ cars, isLoading = false, skeletonCount = 8, user }: CarGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <CarCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40">
        <h3 className="text-xl font-semibold">No cars found</h3>
        <p className="mt-2 text-muted-foreground">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} user={user} />
      ))}
    </div>
  );
} 