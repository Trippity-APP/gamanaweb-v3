/// <reference types="google.maps" />
"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { GOOGLE_MAPS_API_KEY } from "@/lib/googleMaps";

declare global {
  interface Window {
    google?: typeof google;
  }
}

interface CityAutocompleteProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * City-scoped Google Places autocomplete input. Same script-loading pattern as
 * components/cities/PlacesSearchInput.tsx (used on the Cities "Request a Place" form),
 * restricted to `(cities)` results instead of establishments/POIs. Relies on
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — if that's already configured for Request a Place,
 * this works automatically with no extra setup.
 */
export function CityAutocomplete({ id, placeholder, value, onChange, className }: CityAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const handleTyping = () => onChangeRef.current(inputEl.value);
    inputEl.addEventListener("input", handleTyping);

    const initAutocomplete = () => {
      if (!window.google?.maps?.places?.Autocomplete || !inputEl || autocompleteRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(inputEl, {
        types: ["(cities)"],
      });
      autocompleteRef.current = autocomplete;

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const formatted = place.formatted_address ?? place.name ?? inputEl.value;
        inputEl.value = formatted;
        onChangeRef.current(formatted);
      });
    };

    if (!GOOGLE_MAPS_API_KEY) {
      // No key configured (e.g. local dev without .env.local) — don't attempt to load Google's
      // script, since a blank key throws an intrusive "This page can't load Google Maps
      // correctly" dialog. Fall back silently to a plain text input instead.
      console.warn(
        "[CityAutocomplete] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set, falling back to plain text input. " +
          "Set it in .env.local and restart the dev server to enable live suggestions."
      );
      return () => inputEl.removeEventListener("input", handleTyping);
    }

    if (window.google?.maps?.places?.Autocomplete) {
      initAutocomplete();
    } else {
      const scriptId = "google-maps-api";
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", initAutocomplete);
      } else {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initAutocomplete;
        script.onerror = () =>
          console.error("[CityAutocomplete] Failed to load the Google Maps script, check the API key and network access.");
        document.head.appendChild(script);
      }
    }

    return () => {
      inputEl.removeEventListener("input", handleTyping);
      autocompleteRef.current = null;
    };
  }, []);

  return (
    <Input
      id={id}
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      defaultValue={value}
      className={className}
      autoComplete="off"
    />
  );
}
