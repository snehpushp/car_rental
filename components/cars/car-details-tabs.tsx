import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car } from '@/lib/types/database';
import { ReviewsSection } from './reviews-section';
import { Users, Fuel, Wrench, Gauge, MapPin } from 'lucide-react';
import { MapView } from '../maps/map-view';

interface CarDetailsTabsProps {
  car: Car;
}

const specIconMapping = {
    seats: <Users className="h-5 w-5 text-primary" />,
    fuel_type: <Fuel className="h-5 w-5 text-primary" />,
    transmission: <Wrench className="h-5 w-5 text-primary" />,
    engine: <Gauge className="h-5 w-5 text-primary" />,
  };

export function CarDetailsTabs({ car }: CarDetailsTabsProps) {
  const specs = {
    seats: car.specs?.seats,
    fuel_type: car.fuel_type,
    transmission: car.transmission,
    engine: car.specs?.engine,
    ...car.specs,
  }

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({car.reviews?.length || 0})</TabsTrigger>
        <TabsTrigger value="location">Location</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <p className="text-muted-foreground">{car.description || 'No description provided.'}</p>
      </TabsContent>

      <TabsContent value="specs" className="mt-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {Object.entries(specs).map(([key, value]) => {
                if (!value) return null;
                const icon = specIconMapping[key as keyof typeof specIconMapping] || null;
                return (
                    <div key={key} className="flex items-start gap-3">
                        {icon}
                        <div>
                            <p className="font-semibold capitalize">{key.replace('_', ' ')}</p>
                            <p className="text-muted-foreground">{value}</p>
                        </div>
                    </div>
                )
            })}
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <ReviewsSection reviews={car.reviews} />
      </TabsContent>
      
      <TabsContent value="location" className="mt-6">
        <div className="flex items-center gap-2 mb-4 text-lg">
            <MapPin className="h-6 w-6" />
            <h3>{car.location_text}</h3>
        </div>
        <MapView latitude={car.latitude} longitude={car.longitude} />
      </TabsContent>
    </Tabs>
  );
} 