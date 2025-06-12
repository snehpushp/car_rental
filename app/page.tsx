import { FeaturedCars } from '@/components/home/featured-cars';
import { HeroSection } from '@/components/home/hero-section';
import { PromoSection } from '@/components/home/promo-section';
import { PageSection } from '@/components/layout/page-section';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <PageSection>
        <Suspense fallback={<FeaturedCars.Skeleton />}>
          <FeaturedCars />
        </Suspense>
      </PageSection>
      <PageSection className="bg-muted/40">
        <PromoSection />
      </PageSection>
    </main>
  );
}
