'use client';

import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Car } from '@/lib/types/database';
import { useState } from 'react';
import { CarCard } from '../shared/car-card';
import { UserLocationMarker } from './user-location-marker';

interface CarsMapProps {
  cars: Car[];
  selectedCarId?: string | null;
  onMarkerClick: (carId: string) => void;
}

export function CarsMap({ cars, selectedCarId, onMarkerClick }: CarsMapProps) {
    const [infoWindowCar, setInfoWindowCar] = useState<Car | null>(null);

    const handleMarkerClick = (car: Car) => {
        onMarkerClick(car.id);
        setInfoWindowCar(car);
    }
    
    // Default center to a central location if no cars are available
    const defaultCenter = cars.length > 0
    ? { lat: cars[0].latitude, lng: cars[0].longitude }
    : { lat: 51.5072, lng: -0.1276 };


  return (
    <div className="h-full min-h-[400px] w-full rounded-lg overflow-hidden">
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={8}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
        disableDefaultUI={true}
        gestureHandling={'greedy'}
      >
        <UserLocationMarker />
        {cars.map((car) => (
          <AdvancedMarker
            key={car.id}
            position={{ lat: car.latitude, lng: car.longitude }}
            onClick={() => handleMarkerClick(car)}
          >
            <Pin 
                background={selectedCarId === car.id ? '#DB2777' : '#0070F3'}
                borderColor={selectedCarId === car.id ? '#DB2777' : '#0070F3'}
                glyphColor={'#fff'}
            />
          </AdvancedMarker>
        ))}

        {infoWindowCar && (
            <InfoWindow 
                position={{ lat: infoWindowCar.latitude, lng: infoWindowCar.longitude }}
                onCloseClick={() => setInfoWindowCar(null)}
                pixelOffset={[0,-40]}
            >
                <div className="w-80">
                    <CarCard car={infoWindowCar} />
                </div>
            </InfoWindow>
        )}
      </Map>
    </div>
  );
} 