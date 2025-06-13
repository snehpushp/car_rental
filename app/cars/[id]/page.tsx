import { CarDetailsTabs } from "@/components/cars/car-details-tabs";
import { ImageGallery } from "@/components/cars/image-gallery";
import { OwnerInfo } from "@/components/cars/owner-info";
import { BookingWidget } from "@/components/booking/booking-widget";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { Car, Review } from "@/lib/types/database";
import { Fuel, Gauge, MapPin, Wrench, Users, Star, Calendar, Zap, Settings, Shield } from "lucide-react";
import { notFound } from "next/navigation";
import { getServerUser } from "@/lib/utils/server-auth";
import { MapView } from "@/components/maps/map-view";

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

const specIconMapping = {
    seats: <Users className="h-5 w-5 text-muted-foreground" />,
    fuel_type: <Fuel className="h-5 w-5 text-muted-foreground" />,
    transmission: <Wrench className="h-5 w-5 text-muted-foreground" />,
    engine: <Gauge className="h-5 w-5 text-muted-foreground" />,
    year: <Calendar className="h-5 w-5 text-muted-foreground" />,
    mileage: <Zap className="h-5 w-5 text-muted-foreground" />,
    color: <Settings className="h-5 w-5 text-muted-foreground" />,
    safety_rating: <Shield className="h-5 w-5 text-muted-foreground" />,
};

export default async function CarDetailsPage({ params }: { params: { id: string } }) {
    const car = await getCarDetails(params.id);
    const user = await getServerUser();

    if (!car) {
        notFound();
    }

    const { average: averageRating, total: totalReviews } = calculateAverageRating(car.reviews);

    // Combine all specifications
    const allSpecs = {
        year: car.year,
        seats: car.specs?.seats,
        fuel_type: car.fuel_type,
        transmission: car.transmission,
        engine: car.specs?.engine,
        mileage: car.specs?.mileage,
        color: car.specs?.color,
        safety_rating: car.specs?.safety_rating,
        ...car.specs,
    };

    // Filter out undefined values and get display specifications
    const displaySpecs = Object.entries(allSpecs)
        .filter(([key, value]) => value && specIconMapping[key as keyof typeof specIconMapping])
        .map(([key, value]) => ({
            key,
            icon: specIconMapping[key as keyof typeof specIconMapping],
            label: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: String(value)
        }));

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background">
            <PageSection className="!py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Left Column - Sticky Image Gallery */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <ImageGallery images={car.image_urls} />
                    </div>

                    {/* Right Column - All Product Details */}
                    <div className="space-y-8">
                        {/* Product Header */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                                    {car.brand} {car.model}
                                </h1>
                            </div>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-3">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={`h-5 w-5 ${
                                                i < Math.floor(averageRating) 
                                                    ? 'fill-yellow-400 text-yellow-400' 
                                                    : 'text-muted-foreground'
                                            }`} 
                                        />
                                    ))}
                                </div>
                                <span className="font-semibold text-foreground">{averageRating}</span>
                                <span className="text-muted-foreground">({totalReviews} reviews)</span>
                            </div>
                            {/* Description */}
                        {car.description && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-foreground">Description</h3>
                                <p className="text-muted-foreground leading-relaxed">{car.description}</p>
                            </div>
                        )}

                        </div>

                        {/* All Specifications */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-foreground">Vehicle Specifications</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {displaySpecs.map((spec, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-muted/20 border border-border">
                                        {spec.icon}
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{spec.label}</p>
                                            <p className="text-sm text-muted-foreground capitalize">{spec.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        

                        

                        {/* Booking Widget */}
                        {user?.id !== car.owner_id && (
                            <div className="space-y-4 border-t border-border pt-8">
                                <h3 className="text-lg font-semibold text-foreground">Book This Car</h3>
                                <BookingWidget car={car} />
                            </div>
                        )}

                       

                        {/* Location */}
                        <div className="space-y-6 border-t border-border pt-8">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">Pickup Location</h3>
                                <p className="text-muted-foreground">{car.location_text}</p>
                            </div>
                            <div className="border border-border overflow-hidden aspect-video">
                                <MapView latitude={car.latitude} longitude={car.longitude} />
                            </div>
                        </div>
                        {/* Reviews */}
                        <CarDetailsTabs car={car} />

                         {/* Owner Information */}
                         <div className="space-y-6 border-t border-border pt-8">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">Meet Your Host</h3>
                            </div>
                            <OwnerInfo owner={car.owner} />
                        </div>
                    </div>
                </div>
            </PageSection>
        </div>
    );
} 