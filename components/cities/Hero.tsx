"use client";

import { Button } from "@/components/ui/button";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { ArrowDown, MapPin, MapPinned } from "lucide-react";
import { HeroEyebrow } from "@/components/HeroEyebrow";

export const Hero = () => {
    return (
        <section className="relative h-[62vh] sm:h-[68vh] flex items-center justify-center overflow-hidden">
            {/* Global collage photo behind the brand gradient — the flat teal wash alone read as
                a placeholder rather than a page about 50+ real cities. */}
            <div className="absolute inset-0">
                <HeroSlideshow
                    images={[
                        "/global-travel-collage-rome-tokyo-paris-audio-tour-app.png",
                        "/taj-mahal-sunrise-reflection-central-pool-agra.jpg",
                        "/dubai-marina-walk-golden-hour-self-guided-audio-tour.png",
                        "/kerala-alleppey-houseboat-backwaters-golden-hour.jpg",
                        "/rome-colosseum-tour.jpg",
                        "/mumbai-csmt-victorian-gothic-heritage-walk.jpg",
                    ]}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#159895]/25 via-[#1A5F7A]/20 to-[#57C5B6]/20"></div>
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Background decoration matching contact page */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-20 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/50 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-24 sm:pb-28">
                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <div className="space-y-4">
                        <div className="animate-fade-in pb-2">
                            <HeroEyebrow icon={MapPinned} label="Explore our Cities" />
                        </div>
                        <div className="inline-block w-fit">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-2 opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
                                {/* Placeholder heading — pending a final line. */}
                                Walk our Cities
                            </h1>
                            <div className="h-2 bg-white/60 rounded-full opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}></div>
                        </div>
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
                            Explore cities through immersive, location-aware audio stories.
                            <br className="hidden md:block" />
                            No reading. No planning. Just walk and listen.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
                        <Button
                            size="lg"
                            className="rounded-full px-8 h-12 text-base shadow-lg bg-white text-[#1A5F7A] hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 border-0 font-semibold"
                            onClick={() => {
                                document.getElementById("city-grid")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <ArrowDown className="mr-2 h-4 w-4" />
                            Browse Cities
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full px-8 h-12 text-base border-white text-white hover:bg-white/10 hover:text-white bg-transparent"
                            onClick={() => {
                                document.getElementById("request-place")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <MapPin className="mr-2 h-4 w-4" />
                            Request a Place
                        </Button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>
    );
};
