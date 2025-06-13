'use client';

import { Button } from '@/components/ui/button';
import { BookingSearchWidget } from './booking-search-widget';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function HeroSection() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme change with transition
  useEffect(() => {
    if (mounted) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [resolvedTheme, mounted]);

  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    // Prevent hydration mismatch by rendering placeholder
    return (
      <div className="relative h-[70vh] min-h-[500px] sm:h-[75vh] lg:h-[85vh] bg-gradient-to-br from-foreground/95 via-foreground/90 to-foreground">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-muted animate-pulse" />
        </div>
        <div className="relative z-20 flex h-full flex-col items-center justify-start text-center px-6 pt-16 sm:pt-20 lg:pt-24">
          <div className="max-w-4xl space-y-8">
            <h1 className="font-montserrat text-5xl font-black leading-tight tracking-tight text-gray-300 sm:text-6xl md:text-7xl lg:text-8xl">
              Find Your Perfect Ride
            </h1>
            <p className="font-poppins mx-auto max-w-2xl text-xl font-semibold leading-relaxed text-gray-400 sm:text-2xl">
              Discover and book the best cars from trusted owners in your city.
            </p>
          </div>
        </div>

        <div className="absolute -bottom-20 left-1/2 z-30 w-full max-w-6xl -translate-x-1/2 px-6">
          <BookingSearchWidget />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] min-h-[500px] sm:h-[75vh] lg:h-[85vh] bg-gradient-to-br from-foreground/95 via-foreground/90 to-foreground">
      <div className="absolute inset-0 z-0">
        {/* Light mode image */}
        <img
            src="/light_mode_hero.png"
            alt="Sports car - Light mode"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-in-out ${
              isDark ? 'opacity-0' : 'opacity-100'
            }`}
        />
        
        {/* Dark mode image */}
        <img
            src="/dark_mode_hero.png"
            alt="Sports car - Dark mode"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-in-out ${
              isDark ? 'opacity-100' : 'opacity-0'
            }`}
        />
      </div>
      
      <div className="relative z-20 flex h-full flex-col items-center justify-start text-center px-6 pt-16 sm:pt-20 lg:pt-24">
        <div className="max-w-4xl space-y-8">
          <h1 className={`font-montserrat text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl ${
            isDark ? 'text-gray-300' : 'text-background'
          }`}>
            Find Your Perfect Ride
          </h1>
          <p className={`font-poppins mx-auto max-w-2xl text-xl font-semibold leading-relaxed sm:text-2xl ${
            isDark ? 'text-gray-400' : 'text-background/90'
          }`}>
            Discover and book the best cars from trusted owners in your city.
          </p>
        </div>
      </div>

      <div className="absolute -bottom-20 left-1/2 z-30 w-full max-w-6xl -translate-x-1/2 px-6">
        <BookingSearchWidget />
      </div>
    </div>
  );
} 