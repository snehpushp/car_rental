'use client';

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

export function UserLocationMarker() {
    const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.info("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (error) => {
                // Log a more informative message. This is not a critical app error.
                console.info(`Could not get user location: ${error.message}`);
            }
        );
    }, []);

    if (!position) {
        return null;
    }

    return (
        <AdvancedMarker position={position} title="Your Location">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
        </AdvancedMarker>
    );
} 