'use client';

import { APIProvider as GoogleMapsAPIProvider } from '@vis.gl/react-google-maps';

interface APIProviderProps {
    children: React.ReactNode;
}

export function APIProvider({ children }: APIProviderProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error("Google Maps API key is missing.");
        return <div className="text-center p-4 bg-red-100 text-red-700">Google Maps API Key is not configured. Maps cannot be displayed.</div>;
    }
    
    return (
        <GoogleMapsAPIProvider apiKey={apiKey} libraries={['places', 'geocoding']}>
            {children}
        </GoogleMapsAPIProvider>
    );
} 