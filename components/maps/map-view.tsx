'use client';

import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface MapViewProps {
  latitude: number;
  longitude: number;
}

export function MapView({ latitude, longitude }: MapViewProps) {
  const position = { lat: latitude, lng: longitude };

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <Map
        defaultCenter={position}
        defaultZoom={14}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
        disableDefaultUI={true}
        gestureHandling={'greedy'}
      >
        <AdvancedMarker position={position} />
      </Map>
    </div>
  );
} 