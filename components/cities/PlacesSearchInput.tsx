/// <reference types="google.maps" />
"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

import { GOOGLE_MAPS_API_KEY } from "@/lib/googleMaps";

export interface PlaceResult {
    name: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
}

interface PlacesSearchInputProps {
    onPlaceSelect: (place: PlaceResult) => void;
}

declare global {
    interface Window {
        google?: typeof google;
    }
}

function getComponent(place: google.maps.places.PlaceResult, type: string): string {
    const comp = place.address_components?.find((c) => c.types.includes(type));
    return comp?.long_name ?? "";
}

export function PlacesSearchInput({ onPlaceSelect }: PlacesSearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!inputRef.current) return;

        const initAutocomplete = () => {
            if (!window.google?.maps?.places?.Autocomplete || !inputRef.current) return;
            if (autocompleteRef.current) return;

            const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
                types: ["establishment", "geocode"],
            });
            autocompleteRef.current = autocomplete;

            const handlePlace = (place: google.maps.places.PlaceResult) => {
                if (!place.place_id) return;
                const hasGeometry = place.geometry?.location;
                const name = place.name ?? "";

                const applyPlace = (p: google.maps.places.PlaceResult) => {
                    const location = p.geometry?.location;
                    if (!location) return;
                    const lat = location.lat();
                    const lng = location.lng();
                    const city =
                        getComponent(p, "locality") ||
                        getComponent(p, "administrative_area_level_1") ||
                        getComponent(p, "sublocality");
                    const country = getComponent(p, "country");
                    onPlaceSelect({ name: p.name ?? name, city, country, lat, lng });
                };

                if (hasGeometry && place.address_components?.length) {
                    applyPlace(place);
                    return;
                }

                const div = document.createElement("div");
                const service = new google.maps.places.PlacesService(div);
                service.getDetails(
                    { placeId: place.place_id, fields: ["name", "geometry", "address_components"] },
                    (detail: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
                        if (status !== google.maps.places.PlacesServiceStatus.OK || !detail) return;
                        applyPlace(detail);
                    }
                );
            };

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                handlePlace(place);
            });
            setReady(true);
        };

        if (window.google?.maps?.places?.Autocomplete) {
            initAutocomplete();
            return () => {
                autocompleteRef.current = null;
            };
        }

        const scriptId = "google-maps-api";
        const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (existing) {
            existing.addEventListener("load", initAutocomplete);
            return () => {
                existing.removeEventListener("load", initAutocomplete);
                autocompleteRef.current = null;
            };
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => initAutocomplete();
        document.head.appendChild(script);
        return () => {
            autocompleteRef.current = null;
        };
    }, [onPlaceSelect]);

    return (
        <div className="space-y-2">
            <Label htmlFor="places-search">Search for a place (Google Maps)</Label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    id="places-search"
                    ref={inputRef}
                    type="text"
                    placeholder="e.g. Charminar, Hyderabad or The Louvre, Paris"
                    className="pl-10"
                    autoComplete="off"
                />
            </div>
            {ready && (
                <p className="text-xs text-muted-foreground">
                    Select a suggestion to fill the fields below and set the location.
                </p>
            )}
        </div>
    );
}
