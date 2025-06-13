import { Button } from '@/components/ui/button';
import { BookingSearchWidget } from './booking-search-widget';

export function HeroSection() {
  return (
    <div className="relative h-[70vh] min-h-[500px] sm:h-[75vh] lg:h-[85vh] bg-gradient-to-br from-foreground/95 via-foreground/90 to-foreground">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/30 z-10" />
        <img
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
            alt="Sports car"
            className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="relative z-20 flex h-full flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-background sm:text-6xl md:text-7xl lg:text-8xl">
            Find Your Perfect Ride
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-background/90 sm:text-2xl">
            Discover and book the best cars from trusted owners in your city.
          </p>
          <div className="pt-6">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                Browse Cars
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-20 left-1/2 z-30 w-full max-w-6xl -translate-x-1/2 px-6">
        <BookingSearchWidget />
      </div>
    </div>
  );
} 