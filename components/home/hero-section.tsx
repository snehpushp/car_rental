import { Button } from '@/components/ui/button';
import { BookingSearchWidget } from './booking-search-widget';

export function HeroSection() {
  return (
    <div className="relative h-[60vh] min-h-[400px] sm:h-[70vh] lg:h-[80vh]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
            alt="Sports car"
            className="h-full w-full object-cover"
        />
      </div>
      <div className="relative z-20 flex h-full flex-col items-center justify-center text-center text-white">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Find Your Perfect Ride
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-200 md:text-xl">
          Discover and book the best cars from trusted owners in your city.
        </p>
        <Button size="lg" className="mt-8">
            Browse Cars
        </Button>
      </div>

      <div className="absolute bottom-0 left-1/2 z-30 w-full max-w-6xl -translate-x-1/2 translate-y-1/2 px-4">
        <BookingSearchWidget />
      </div>
    </div>
  );
} 