"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Locate, MapPin } from "lucide-react";
import { PlacesSearchInput } from "./PlacesSearchInput";

// Ensure Google Maps (with Places) is loaded when this section is used
import { GOOGLE_MAPS_API_KEY } from "@/lib/googleMaps";

const AUDIO_TYPE_OPTIONS = [
    "Walking audio tour",
    "Historical storytelling",
    "Cultural / local insights",
    "Food & local experiences",
    "Nature or scenic narration",
] as const;

// Dynamically import MapPicker with no SSR to avoid window is not defined errors
const MapPicker = dynamic(() => import("./MapPicker"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading Map...</span>
        </div>
    ),
});

export const RequestPlace = () => {
    const [activeTab, setActiveTab] = useState("map");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [placeName, setPlaceName] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [audioTypes, setAudioTypes] = useState<string[]>([]);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Load Google Maps script with Places when section mounts (for Manual tab search)
    useEffect(() => {
        if (typeof window === "undefined" || document.getElementById("google-maps-api")) return;
        const script = document.createElement("script");
        script.id = "google-maps-api";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }, []);

    const handleAudioTypeChange = useCallback((type: string, checked: boolean) => {
        setAudioTypes((prev) =>
            checked ? (prev.includes(type) ? prev : [...prev, type]) : prev.filter((t) => t !== type)
        );
    }, []);

    const handleMapLocationSelect = useCallback((lat: number, lng: number) => {
        setCoordinates({ lat, lng });
        toast.info(`Location selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }, []);

    const handleUseCurrentLocation = useCallback(() => {
        if (typeof window === "undefined" || !navigator.geolocation) {
            toast.error("Location is not supported by your browser.");
            return;
        }
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoordinates({ lat: latitude, lng: longitude });
                toast.success("Current location pinned.");
                setIsGettingLocation(false);
            },
            (error: GeolocationPositionError) => {
                setIsGettingLocation(false);
                const message =
                    error.code === 1
                        ? "Location permission denied."
                        : error.code === 2
                          ? "Location unavailable."
                          : "Location request timed out.";
                toast.error(message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSuccess(true);
        toast.success("Request received! We'll look into covering this destination.");
    };

    if (isSuccess) {
        return (
            <section id="request-place" className="py-16 md:py-20 bg-muted/30 border-t border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
                    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Request Received!</h2>
                        <p className="text-muted-foreground mb-8">
                            Thanks for helping us map the world of audio. We've added your request to our discovery queue.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => window.open('https://apps.apple.com', '_blank')}>
                                Download on App Store
                            </Button>
                            <Button variant="outline" onClick={() => {
                                setIsSuccess(false);
                                setCoordinates(null);
                                setPlaceName("");
                                setCity("");
                                setCountry("");
                                setAudioTypes([]);
                                setUserName("");
                                setUserEmail("");
                            }}>
                                Request Another Place
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="request-place" className="py-16 md:py-20 bg-muted/30 border-t border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-4">Can’t Find the Place You’re Visiting?</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Pin a location and request an audio story or walking tour for your trip.
                    </p>
                </div>

                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="map">Pin Map Location</TabsTrigger>
                            <TabsTrigger value="manual">Search on Maps</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit}>
                            <TabsContent value="map" className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Drop a pin on the place you’re planning to visit</Label>
                                    {activeTab === "map" && (
                                        <MapPicker
                                            key="map-picker"
                                            initialLat={coordinates?.lat}
                                            initialLng={coordinates?.lng}
                                            onLocationSelect={handleMapLocationSelect}
                                        />
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleUseCurrentLocation}
                                        disabled={isGettingLocation}
                                        className="mt-2"
                                    >
                                        {isGettingLocation ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Locate className="h-4 w-4 mr-2" />
                                        )}
                                        {isGettingLocation ? "Getting location…" : "Pin current location"}
                                    </Button>
                                    <p className="text-sm text-muted-foreground mt-1">Tap the map to place a pin, or enter coordinates below.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pin-lat">Latitude</Label>
                                            <Input
                                                id="pin-lat"
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="e.g. 17.6828"
                                                value={coordinates != null && coordinates.lat !== 0 ? String(coordinates.lat) : ""}
                                                onChange={(e) => {
                                                    const v = e.target.value.trim();
                                                    const n = parseFloat(v);
                                                    if (v === "") setCoordinates((c) => (c ? { ...c, lat: 0 } : null));
                                                    else if (!Number.isNaN(n)) setCoordinates((c) => (c ? { ...c, lat: n } : { lat: n, lng: 0 }));
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pin-lng">Longitude</Label>
                                            <Input
                                                id="pin-lng"
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="e.g. 74.9989"
                                                value={coordinates != null && coordinates.lng !== 0 ? String(coordinates.lng) : ""}
                                                onChange={(e) => {
                                                    const v = e.target.value.trim();
                                                    const n = parseFloat(v);
                                                    if (v === "") setCoordinates((c) => (c ? { ...c, lng: 0 } : null));
                                                    else if (!Number.isNaN(n)) setCoordinates((c) => (c ? { ...c, lng: n } : { lat: 0, lng: n }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {coordinates && (coordinates.lat !== 0 || coordinates.lng !== 0) && (
                                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                            <MapPin className="w-4 h-4 shrink-0" />
                                            Location set: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="map-place-name">Name of place</Label>
                                        <Input
                                            id="map-place-name"
                                            placeholder="e.g. Charminar, Hyderabad"
                                            value={placeName}
                                            onChange={(e) => setPlaceName(e.target.value)}
                                            required={activeTab === "map"}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="manual" className="space-y-4">
                                {activeTab === "manual" && (
                                    <PlacesSearchInput
                                        onPlaceSelect={(place) => {
                                            setPlaceName(place.name);
                                            setCity(place.city);
                                            setCountry(place.country);
                                            setCoordinates({ lat: place.lat, lng: place.lng });
                                            toast.success(`Location set: ${place.name || place.city || "Place"}`);
                                        }}
                                    />
                                )}
                                <p className="text-sm text-muted-foreground">Or enter the details manually below.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="place">Place Name</Label>
                                        <Input
                                            id="place"
                                            placeholder="e.g. The Louvre"
                                            value={placeName}
                                            onChange={(e) => setPlaceName(e.target.value)}
                                            required={activeTab === "manual"}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City / Region</Label>
                                        <Input
                                            id="city"
                                            placeholder="e.g. Paris"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required={activeTab === "manual"}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            placeholder="e.g. France"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            required={activeTab === "manual"}
                                        />
                                    </div>
                                </div>
                                {coordinates && (coordinates.lat !== 0 || coordinates.lng !== 0) && (
                                    <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        Location pinned: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                                    </p>
                                )}
                            </TabsContent>

                            {/* Shared Fields */}
                            <div className="mt-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="user-name">Your name</Label>
                                        <Input
                                            id="user-name"
                                            type="text"
                                            placeholder="e.g. John Doe"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="user-email">Email</Label>
                                        <Input
                                            id="user-email"
                                            type="email"
                                            placeholder="e.g. john@example.com"
                                            value={userEmail}
                                            onChange={(e) => setUserEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base">What kind of audio do you want?</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {AUDIO_TYPE_OPTIONS.map((type) => (
                                            <label
                                                key={type}
                                                htmlFor={`audio-${type}`}
                                                className="flex items-center space-x-2 cursor-pointer"
                                            >
                                                <input
                                                    id={`audio-${type}`}
                                                    type="checkbox"
                                                    checked={audioTypes.includes(type)}
                                                    onChange={(e) => handleAudioTypeChange(type, e.target.checked)}
                                                    className="h-4 w-4 rounded border border-input bg-background accent-[#159895] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                />
                                                <span className="text-sm font-normal">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date" className="font-normal text-muted-foreground">Travel Month (optional)</Label>
                                    <Input id="date" placeholder="e.g. October 2024" />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A] text-white"
                                    disabled={isSubmitting || (activeTab === "map" && (!coordinates || !placeName.trim())) || (activeTab === "manual" && !placeName)}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Request Audio Story for This Place"
                                    )}
                                </Button>
                                <p className="text-center text-xs text-muted-foreground mt-2">
                                    We use these requests to decide what to build next.
                                </p>
                            </div>
                        </form>
                    </Tabs>
                </div>
            </div>
        </section>
    );
};
