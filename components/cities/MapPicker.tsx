/// <reference types="google.maps" />
"use client";

import { useEffect, useRef, useState } from "react";

import { GOOGLE_MAPS_API_KEY } from "@/lib/googleMaps";

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

declare global {
    interface Window {
        google?: typeof google;
    }
}

const MapPicker = ({ onLocationSelect, initialLat, initialLng }: MapPickerProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const [scriptError, setScriptError] = useState<string | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const initMap = () => {
            if (!window.google?.maps?.Map || !mapContainerRef.current) return;

            const hasInitial = initialLat != null && initialLng != null && !Number.isNaN(initialLat) && !Number.isNaN(initialLng);
            const center = hasInitial
                ? { lat: initialLat, lng: initialLng }
                : { lat: 20.5937, lng: 78.9629 };

            const map = new google.maps.Map(mapContainerRef.current, {
                center,
                zoom: hasInitial ? 12 : 3,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
                zoomControl: true,
            });
            mapRef.current = map;

            const addOrUpdateMarker = (lat: number, lng: number, notifyParent = true) => {
                if (markerRef.current) {
                    markerRef.current.setPosition({ lat, lng });
                } else {
                    markerRef.current = new google.maps.Marker({
                        position: { lat, lng },
                        map,
                        draggable: true,
                    });
                    markerRef.current.addListener("dragend", () => {
                        const pos = markerRef.current?.getPosition();
                        if (pos) onLocationSelect(pos.lat(), pos.lng());
                    });
                }
                if (notifyParent) onLocationSelect(lat, lng);
            };

            map.addListener("click", (e: google.maps.MapMouseEvent) => {
                const lat = e.latLng?.lat();
                const lng = e.latLng?.lng();
                if (lat == null || lng == null) return;
                addOrUpdateMarker(lat, lng);
            });

            if (hasInitial) {
                addOrUpdateMarker(initialLat, initialLng, false);
            }

            setTimeout(() => {
                google.maps.event.trigger(map, "resize");
            }, 100);
        };

        if (window.google?.maps?.Map) {
            initMap();
            return () => {
                markerRef.current = null;
                mapRef.current = null;
            };
        }

        const scriptId = "google-maps-api";
        const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (existing) {
            if (window.google?.maps?.Map) initMap();
            else existing.addEventListener("load", initMap);
            return () => {
                existing.removeEventListener("load", initMap);
                markerRef.current = null;
                mapRef.current = null;
            };
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap();
        script.onerror = () => setScriptError("Failed to load Google Maps.");
        document.head.appendChild(script);

        return () => {
            markerRef.current = null;
            mapRef.current = null;
        };
    }, [onLocationSelect, initialLat, initialLng]);

    if (scriptError) {
        return (
            <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-md bg-muted flex items-center justify-center">
                <p className="text-muted-foreground text-sm">{scriptError}</p>
            </div>
        );
    }

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-md z-0 relative">
            <div ref={mapContainerRef} className="h-full w-full z-0 min-h-[400px]" />
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-medium shadow-sm text-slate-600 pointer-events-none">
                Tap map to drop pin
            </div>
        </div>
    );
};

export default MapPicker;
