import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from '@/lib/types/database';
import { Fuel, Gauge, Heart, MapPin, Users, Wrench } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Card className="group overflow-hidden rounded-lg shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
      <CardHeader className="relative p-0">
        <Link href={`/cars/${car.id}`} className="block">
          <Image
            src={car.image_urls?.[0] || '/images/placeholder-car.png'}
            alt={`${car.brand} ${car.model}`}
            width={400}
            height={250}
            className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="absolute right-3 top-3">
          <Button size="icon" variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white">
            <Heart className="h-5 w-5 text-gray-500" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
        </div>
        <Badge variant="secondary" className="absolute bottom-3 left-3">
          {car.type}
        </Badge>
      </CardHeader>
      <CardContent className="p-4">
        <Link href={`/cars/${car.id}`}>
          <CardTitle className="mb-2 line-clamp-1 text-lg font-bold group-hover:text-primary">
            {car.brand} {car.model} ({car.year})
          </CardTitle>
        </Link>
        <div className="mb-4 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1.5 h-4 w-4" />
          <span className="line-clamp-1">{car.location_text}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center">
            <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center">
            <Fuel className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{car.fuel_type}</span>
          </div>
          {car.specs?.seats && (
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{car.specs.seats} Seats</span>
            </div>
          )}
          {car.specs?.engine && (
             <div className="flex items-center">
              <Gauge className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{car.specs.engine}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="text-lg font-bold">
          ${car.price_per_day}
          <span className="text-sm font-normal text-muted-foreground">/day</span>
        </div>
        <Button asChild>
          <Link href={`/cars/${car.id}`}>Book Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export function CarCardSkeleton() {
    return (
      <Card className="overflow-hidden rounded-lg">
        <CardHeader className="p-0">
          <Skeleton className="h-52 w-full" />
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="mb-4 h-4 w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
        </CardFooter>
      </Card>
    );
  } 