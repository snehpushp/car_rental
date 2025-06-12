'use client';

import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useOnclickOutside } from '@/hooks/use-onclick-outside';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

interface LocationInputProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  defaultValue?: string;
}

export function LocationInput({ onLocationSelect, defaultValue = '' }: LocationInputProps) {
  const placesLibrary = useMapsLibrary('places');
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (placesLibrary) {
      // The places library is loaded, you can now use it.
      // @ts-ignore
      setPlacesService(new placesLibrary.PlacesService(document.createElement('div')));
    }
  }, [placesLibrary]);

  if (!placesLibrary) {
    return (
        <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Loading..." disabled className="pl-10" />
        </div>
    );
  }

  return <Autocomplete onLocationSelect={onLocationSelect} defaultValue={defaultValue} />;
}


function Autocomplete({ onLocationSelect, defaultValue }: LocationInputProps) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
      } = usePlacesAutocomplete({
        requestOptions: {
          types: ['(cities)'],
        },
        defaultValue,
        debounce: 300,
      });
    
      const ref = useOnclickOutside(() => {
        clearSuggestions();
      });
    
      const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      };
    
      const handleSelect = ({ description }: { description: string }) => () => {
        setValue(description, false);
        clearSuggestions();
    
        getGeocode({ address: description })
          .then((results) => getLatLng(results[0]))
          .then(({ lat, lng }) => {
            onLocationSelect({ address: description, lat, lng });
          })
          .catch((error) => {
            console.log('😱 Error: ', error);
          });
      };
    
      const renderSuggestions = () =>
        data.map((suggestion) => {
          const {
            place_id,
            structured_formatting: { main_text, secondary_text },
          } = suggestion;
    
          return (
            <li
              key={place_id}
              onClick={handleSelect(suggestion)}
              className="p-2 hover:bg-muted cursor-pointer rounded-md"
            >
              <strong>{main_text}</strong> <small>{secondary_text}</small>
            </li>
          );
        });
    
      return (
        <div ref={ref} className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={value}
            onChange={handleInput}
            disabled={!ready}
            placeholder="Enter a city"
            className="pl-10"
          />
          {status === 'OK' && <ul className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-2">{renderSuggestions()}</ul>}
        </div>
      );
} 