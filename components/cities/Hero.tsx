import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import type { ImageVariant } from "@/lib/images";
import { ArrowDown, MapPin, MapPinned } from "@/components/icons";

export const Hero = ({ photo }: { photo: ImageVariant }) => {
    return (
        <section className="container-site pt-4 sm:pt-6">
            <div className="relative isolate flex min-h-[400px] items-end overflow-hidden rounded-4xl shadow-lift sm:min-h-[440px] lg:min-h-[480px]">
                <ResponsiveImage
                    image={photo}
                    alt="Travel destinations and cities around the world with Gamana"
                    title="Gamana Travel Destinations and Cities Around the World"
                    fill
                    priority
                    sizes="(min-width: 1280px) 1216px, 100vw"
                    className="-z-20"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/10" aria-hidden />
                <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-sunset-400/25 blur-3xl" aria-hidden />

                <div className="w-full px-5 pb-8 pt-16 sm:px-10 sm:pb-10 lg:px-14 lg:pb-12">
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        <MapPinned className="h-3.5 w-3.5" aria-hidden />
                        Explore our Cities
                    </p>
                    <h1 className="text-display mt-4 max-w-3xl text-balance text-white drop-shadow-sm">
                        Travel Destinations Made for Curious Travelers
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                        Experience travel destinations through immersive audio stories, local experiences, and walking tours that bring each city’s history, culture, and landmarks to life.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <a
                            href="#city-grid"
                            className="focus-ring inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 px-6 text-sm font-semibold text-white shadow-lift transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none"
                        >
                            <ArrowDown className="h-4 w-4" aria-hidden />
                            Browse Cities
                        </a>
                        <a
                            href="#request-place"
                            className="focus-ring inline-flex h-12 items-center gap-2 rounded-full border border-white/60 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <MapPin className="h-4 w-4" aria-hidden />
                            Request a Place
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
