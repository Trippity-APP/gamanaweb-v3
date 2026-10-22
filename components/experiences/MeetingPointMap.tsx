"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import L from "leaflet";

/** Loaded with `next/dynamic` (`ssr: false`): Leaflet touches `window` on import. */
export default function MeetingPointMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { center: [lat, lng], zoom: 14, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.circleMarker([lat, lng], { radius: 10, color: "#0F7C78", fillColor: "#26AFA4", fillOpacity: 0.9, weight: 3 }).addTo(map);
    return () => {
      map.remove();
    };
  }, [lat, lng]);

  return <div ref={ref} role="img" aria-label={label} className="isolate z-0 h-64 w-full overflow-hidden rounded-3xl" />;
}
