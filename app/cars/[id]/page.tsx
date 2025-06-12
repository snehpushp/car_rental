import { CarDetailsTabs } from "@/components/cars/car-details-tabs";
import { ImageGallery } from "@/components/cars/image-gallery";
import { OwnerInfo } from "@/components/cars/owner-info";
import { BookingWidget } from "@/components/booking/booking-widget";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { Car, Review } from "@/lib/types/database";
import { Fuel, Gauge, MapPin, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";

async function getCarDetails(id: string): Promise<Car | null> {
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/cars/${id}`, {
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error('Failed to fetch car details');
    }
    const responseData = await response.json();
    return responseData.data;
}

function calculateAverageRating(reviews?: Review[]) {
    if (!reviews || reviews.length === 0) return { average: 0, total: 0 };
    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    return { average: Math.round(average * 10) / 10, total };
}

export default async function CarDetailsPage({ params }: { params: { id: string } }) {
    const car = await getCarDetails(params.id);

    if (!car) {
        notFound();
    }

    const { average: averageRating, total: totalReviews } = calculateAverageRating(car.reviews);

    return (
        <PageSection>
            <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{car.brand} {car.model} ({car.year})</h1>
                <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{averageRating}</span>
                        <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-5 w-5"/>
                        <span>{car.location_text}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ImageGallery images={car.image_urls} />
                    <CarDetailsTabs car={car} />
                </div>
                <aside className="lg:col-span-1">
                    <div className="sticky top-24">
                       <BookingWidget car={car} />
                       <OwnerInfo owner={car.owner} />
                    </div>
                </aside>
            </div>
        </PageSection>
    );
} 