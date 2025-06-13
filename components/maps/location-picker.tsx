'use client';

import { useState, useEffect, useCallback } from 'react';
import { Map, AdvancedMarker, useMapsLibrary, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { LocationInput } from './location-input';
import type { CarFormValues } from '@/components/owner/car-form';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';

export function LocationPicker() {
  const form = useFormContext<CarFormValues>();
  const geocodingLibrary = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState({ lat: 51.5072, lng: -0.1276 }); // Default to London
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    if (geocodingLibrary) {
      setGeocoder(new geocodingLibrary.Geocoder());
    }
  }, [geocodingLibrary]);

  // Set initial position from form values or geolocation
  useEffect(() => {
    if (!geocoder) return; // Wait for geocoder to be ready

    const lat = form.getValues('latitude');
    const lng = form.getValues('longitude');
    if (lat && lng && lat !== 0 && lng !== 0) {
      const pos = { lat, lng };
      setMarker(pos);
      setCenter(pos);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(pos);
          updateFormAndMarker(pos);
        },
        () => {
          console.warn("User denied geolocation. Defaulting to London.");
          updateFormAndMarker(center);
        }
      );
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocoder]); // Rerun when geocoder is initialized

  const handleCameraChange = (event: MapCameraChangedEvent) => {
    const newCenter = event.detail.center;
    const newZoom = event.detail.zoom;
    setCenter(newCenter);
    setZoom(newZoom);
  };

  const reverseGeocode = useCallback((position: { lat: number, lng: number }) => {
    if (!geocoder) {
        console.error("Geocoder service is not available.");
        return;
    }
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        form.setValue('location_text', results[0].formatted_address, { shouldValidate: true });
      } else {
        console.error('Geocoder failed due to: ' + status);
        form.setValue('location_text', `Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}`, { shouldValidate: true });
      }
    });
  }, [form, geocoder]);

  const updateFormAndMarker = useCallback((position: { lat: number, lng: number }) => {
    setMarker(position);
    form.setValue('latitude', position.lat, { shouldValidate: true, shouldDirty: true });
    form.setValue('longitude', position.lng, { shouldValidate: true, shouldDirty: true });
    reverseGeocode(position);
  }, [form, reverseGeocode]);


  const handleMapClick = (event: MapMouseEvent) => {
    if (event.detail.latLng) {
      const newPosition = {
        lat: event.detail.latLng.lat,
        lng: event.detail.latLng.lng,
      };
      updateFormAndMarker(newPosition);
    }
  };

  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
        const newPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        updateFormAndMarker(newPosition);
      }
  }

  const handleLocationSelect = useCallback(({ address, lat, lng }: { address: string; lat: number; lng: number }) => {
    const newPosition = { lat, lng };
    setCenter(newPosition);
    updateFormAndMarker(newPosition);
    form.setValue('location_text', address, { shouldValidate: true });
  }, [form, updateFormAndMarker]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="location_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
                <LocationInput 
                    onLocationSelect={handleLocationSelect} 
                    defaultValue={field.value}
                />
            </FormControl>
            <FormDescription>
              Search for an address or drag the pin on the map.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div style={{ height: '400px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <Map
          center={center}
          zoom={zoom}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
          onClick={handleMapClick}
          onCameraChanged={handleCameraChange}
          gestureHandling={'greedy'}
          zoomControl={true}
        >
          {marker && (
            <AdvancedMarker 
                position={marker} 
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
            />
          )}
        </Map>
      </div>
    </div>
  );
} 