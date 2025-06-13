import { FeaturedCars } from '@/components/home/featured-cars';
import { HeroSection } from '@/components/home/hero-section';
import { PromoSection } from '@/components/home/promo-section';
import { PageSection } from '@/components/layout/page-section';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Featured Cars Section */}
      <PageSection className="bg-muted/20">
        <Suspense fallback={<FeaturedCars.Skeleton />}>
          <FeaturedCars />
        </Suspense>
      </PageSection>
      
      {/* Promo Section */}
      <PageSection className="bg-background border-t border-border">
        <PromoSection />
      </PageSection>
    </main>
  );
}
