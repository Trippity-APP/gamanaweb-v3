"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardRail } from "@/components/site/CardRail";
import { CitySelect } from "@/components/site/CitySelect";
import { SectionHeader } from "@/components/site/SectionHeader";
import { UnlockCard } from "@/components/account/UnlockCard";
import { CatalogCard } from "@/components/marketplace/CatalogCard";
import { ExperienceCard } from "@/components/experiences/ExperienceCard";
import { ExperiencesRail } from "@/components/experiences/ExperiencesRail";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { ArrowRight, Calendar, Headphones, Loader2, MapPin, Navigation, Ticket } from "@/components/icons";
import { toast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";
import { apiFetch } from "@/lib/api/client";
import { hasSessionHint } from "@/lib/api/session";
import { experienceSummarySchema, type ExperienceSummary } from "@/lib/api/schemas/experiences";
import {
  bestPicksSchema,
  lenientList,
  placeCardSchema,
  placeCardToTour,
  tourCardSchema,
  tourCardToTour,
} from "@/lib/api/schemas/mobile-v2";
import type { BookingSummary } from "@/lib/api/schemas/bookings";
import type { LibraryUnlock } from "@/lib/api/schemas/library";
import { bookingId, fetchBookings, isUpcoming, listOf } from "@/lib/account/api";
import { fetchPersonalization, narratorLanguages, travelProfileHomeCity, type PersonalizationDoc } from "@/lib/account/personalization";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDateLabel, formatTimeLabel } from "@/lib/experiences/format";
import { cityLabel, readLastCity, readLastCityId, writeLastCity } from "@/lib/home/last-city";
import { isExpired, unlockTargetId, useLibrary } from "@/lib/library/library-context";
import { cityQueryVariants } from "@/lib/marketplace-api";
import type { Tour } from "@/lib/marketplace-data";
import { cityCoordinates, loadActiveCities, type ApiCity } from "@/lib/services/cityService";

const SHELF_SIZE = 10;
const CARD_WIDTH = "w-[260px] sm:w-[300px]";
/** The app's recommended-tours box: the city's coordinates ± 1°. */
const TOUR_BOX_DEGREES = 1;
/** The app's nearby-stories radius for Home. */
const NEARBY_RADIUS_METERS = 100_000;

function matchCity(cities: ApiCity[], name: string | null | undefined): ApiCity | null {
  if (!name?.trim()) return null;
  const variants = cityQueryVariants(cityLabel(name));
  return cities.find((c) => variants.includes(c.name.trim().toLowerCase())) ?? null;
}

function currentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge: 600_000, timeout: 10_000 });
  });
}

async function geolocationAllowed(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return false;
  try {
    const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
    return status ? status.state !== "denied" : true;
  } catch {
    return true;
  }
}

/** Profile home city → last city picked → browser location (nearest Gamana city) → none. */
async function resolveCity(doc: PersonalizationDoc | null, cities: ApiCity[]): Promise<ApiCity | null> {
  const home = matchCity(cities, travelProfileHomeCity(doc?.travel_profile));
  if (home) return home;

  const lastId = readLastCityId();
  const last = (lastId && cities.find((c) => String(c.id) === lastId)) || matchCity(cities, readLastCity());
  if (last) return last;

  if (!(await geolocationAllowed())) return null;
  try {
    const { coords } = await currentPosition();
    return nearestCity(cities, coords.latitude, coords.longitude);
  } catch {
    return null;
  }
}

function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
}

function countdownLabel(isoDate: string): string {
  const n = daysUntil(isoDate);
  if (n <= 0) return "Today";
  if (n === 1) return "Tomorrow";
  return `In ${n} days`;
}

/**
 * Logged-in home feed, rendered above the marketing page. Anonymous visitors (and crawlers)
 * get nothing from here, so the static page is unchanged for them.
 */
export function PersonalizedHome() {
  const { status } = useAuth();
  const [hint, setHint] = useState(false);

  useEffect(() => setHint(hasSessionHint()), []);

  if (status === "loading") return hint ? <FeedSkeleton /> : null;
  if (status !== "authenticated") return null;
  return <Feed />;
}

/** Wraps marketing blocks that only make sense for visitors; signed-in users get the feed only. */
export function AnonymousOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [hint, setHint] = useState(false);

  useEffect(() => setHint(hasSessionHint()), []);

  if (status === "authenticated" || (status === "loading" && hint)) return null;
  return <>{children}</>;
}

function RailSkeleton() {
  return (
    <div className="flex gap-5 overflow-hidden" role="status" aria-label="Loading">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-80 w-[260px] shrink-0 rounded-3xl sm:w-[300px]" />
      ))}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div role="status" aria-label="Loading your home">
      <div className="section-tight bg-sand-50">
        <div className="container-site space-y-4">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-6 w-48 rounded-xl" />
        </div>
      </div>
      {[0, 1].map((row) => (
        <div key={row} className="section-tight border-t border-ink/5 bg-white">
          <div className="container-site space-y-6">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <RailSkeleton />
          </div>
        </div>
      ))}
    </div>
  );
}

function useShelfTracking(shelf: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && el.offsetHeight > 0) {
          track("home_shelf_impression", { shelf });
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shelf]);
  const onClickCapture = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) track("home_shelf_click", { shelf });
  };
  return { ref, onClickCapture };
}

function Tracked({ shelf, children }: { shelf: string; children: ReactNode }) {
  const tracking = useShelfTracking(shelf);
  return (
    <div ref={tracking.ref} onClickCapture={tracking.onClickCapture}>
      {children}
    </div>
  );
}

function Shelf({
  shelf,
  eyebrow,
  title,
  action,
  className = "bg-white",
  children,
}: {
  shelf: string;
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tracked shelf={shelf}>
      <section className={`section-tight border-t border-ink/5 ${className}`}>
        <div className="container-site">
          <SectionHeader eyebrow={eyebrow} title={title} align="left" action={action} className="mb-6 sm:mb-8" />
          {children}
        </div>
      </section>
    </Tracked>
  );
}

function CatalogRail({ label, tours }: { label: string; tours: Tour[] }) {
  return (
    <CardRail label={label}>
      {tours.map((tour, index) => (
        <div key={tour.id} className={CARD_WIDTH}>
          <CatalogCard tour={tour} index={index} />
        </div>
      ))}
    </CardRail>
  );
}

function Feed() {
  const [doc, setDoc] = useState<PersonalizationDoc | null>(null);
  const [cities, setCities] = useState<ApiCity[] | null>(null);
  /** `undefined` while resolving; `null` when nothing matched and the visitor needs to pick. */
  const [city, setCity] = useState<ApiCity | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [personalization, list] = await Promise.all([
        fetchPersonalization().catch(() => null),
        loadActiveCities().catch(() => [] as ApiCity[]),
      ]);
      if (cancelled) return;
      setDoc(personalization);
      setCities(list);
      const resolved = await resolveCity(personalization, list);
      if (!cancelled) setCity((current) => (current === undefined ? resolved : current));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const changeCity = (next: ApiCity | null) => {
    if (!next) return;
    writeLastCity(next.name, next.id);
    setCity(next);
  };

  const languages = narratorLanguages(doc);

  return (
    <div>
      <Welcome city={city} cities={cities} onCityChange={changeCity} />
      <NextExperience />
      <YourCollection />
      {city === undefined ? (
        <div className="section-tight border-t border-ink/5 bg-white">
          <div className="container-site space-y-6">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <RailSkeleton />
          </div>
        </div>
      ) : city ? (
        <>
          <BestPicks key={`picks-${city.id}`} city={city} languages={languages} />
          <CityTours key={`tours-${city.id}`} city={city} languages={languages} />
          <CityStories key={`stories-${city.id}`} city={city} languages={languages} />
          <Tracked shelf="experiences">
            <ExperiencesRail
              eyebrow="Book a local experience"
              title={`Experiences in ${city.name}`}
              query={{ city: city.name, page_size: SHELF_SIZE }}
              fallbackQuery={{ country: city.country_name, page_size: SHELF_SIZE }}
              seeAllHref={`/experiences/?city=${encodeURIComponent(city.name)}`}
            />
          </Tracked>
        </>
      ) : null}
      <Saved />
    </div>
  );
}

function Welcome({
  city,
  cities,
  onCityChange,
}: {
  city: ApiCity | null | undefined;
  cities: ApiCity[] | null;
  onCityChange: (city: ApiCity | null) => void;
}) {
  const { user } = useAuth();
  const { places, tours } = useLibrary();
  const tracking = useShelfTracking("welcome");
  const [locating, setLocating] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);

  const pending = [...(places ?? []), ...(tours ?? [])].filter((u) => u.activation_status === "pending" && !isExpired(u)).length;

  const useMyLocation = async () => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Location isn't available in this browser." });
      return;
    }
    setLocating(true);
    try {
      const { coords } = await currentPosition();
      const nearest = nearestCity(cities ?? (await loadActiveCities()), coords.latitude, coords.longitude);
      if (nearest) onCityChange(nearest);
      else toast({ title: "We couldn't find a Gamana city near you yet." });
    } catch (error) {
      const denied = typeof GeolocationPositionError !== "undefined" && error instanceof GeolocationPositionError;
      toast(denied ? { title: "Location permission was denied." } : { title: "Couldn't look up cities right now.", variant: "destructive" });
    } finally {
      setLocating(false);
    }
  };

  return (
    <section ref={tracking.ref} onClickCapture={tracking.onClickCapture} className="section-tight bg-sand-50">
      <div className="container-site">
        <h1 className="text-h2 text-ink">Welcome back{user?.firstName ? `, ${user.firstName}` : ""}</h1>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="home-city" className="text-sm font-semibold text-ink-soft">
            Showing
          </label>
          <CitySelect
            id="home-city"
            value={city ?? null}
            onChange={onCityChange}
            cities={cities ?? undefined}
            placeholder={city === undefined ? "Finding your city…" : "Pick a city"}
            className="w-full sm:w-64"
          />
          <Button type="button" variant="ghost" onClick={useMyLocation} disabled={locating} className="h-11 w-fit rounded-full px-4">
            {locating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Navigation className="h-4 w-4" aria-hidden />}
            Use my location
          </Button>
        </div>

        {city === null && (
          <div className="mt-6 flex items-center gap-3 rounded-3xl bg-white p-5 shadow-card" role="status">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <MapPin className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="font-display font-bold text-ink">Pick your city</p>
              <p className="text-sm text-ink-soft">We&apos;ll show audio tours, stories and experiences for it, just like in the Gamana app.</p>
            </div>
          </div>
        )}

        {pending > 0 && (
          <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sunset-100 text-sunset-600">
                <Headphones className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="font-display font-bold text-ink">
                  {pending} {pending === 1 ? "story" : "stories"} waiting in your app
                </p>
                <p className="text-sm text-ink-soft">Your 30 days start the first time you open each one.</p>
              </div>
            </div>
            <Button type="button" onClick={() => setHandoffOpen(true)} className="h-11 rounded-full px-5">
              Open in app
            </Button>
          </div>
        )}
      </div>
      <AppHandoffSheet
        open={handoffOpen}
        onOpenChange={setHandoffOpen}
        source="home-pending-unlocks"
        title="Your stories are waiting in the Gamana app"
        steps={["Open Gamana on your phone", "Log in with the same account", "Find them in My Collection"]}
        deepLink="https://www.gamana.app/"
      />
    </section>
  );
}

function nearestCity(cities: ApiCity[], lat: number, lng: number): ApiCity | null {
  let best: ApiCity | null = null;
  let bestDist = Infinity;
  for (const c of cities) {
    const coords = cityCoordinates(c);
    if (!coords) continue;
    const dLat = ((coords.lat - lat) * Math.PI) / 180;
    const dLng = ((coords.lng - lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((coords.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return bestDist <= 150 ? best : null;
}

type ShelfProps = { city: ApiCity; languages: string[] };

/** Loads one v2 shelf; `null` while loading, `[]` when empty or failed (the shelf then hides). */
function useCityShelf<T>(load: () => Promise<T[]>, deps: unknown[], label: string): T[] | null {
  const [items, setItems] = useState<T[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    setItems(null);
    load()
      .then((list) => !cancelled && setItems(list))
      .catch((error) => {
        if (cancelled) return;
        console.warn(`Home shelf "${label}" failed`, error);
        setItems([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return items;
}

function ShelfBody({ items, label }: { items: Tour[] | null; label: string }) {
  if (items === null) return <RailSkeleton />;
  return <CatalogRail label={label} tours={items} />;
}

/** `GET /api/v2/cities/best-picks` — the app's "Today's best picks" (one tour, one story, one experience). */
function BestPicks({ city, languages }: ShelfProps) {
  const langKey = languages.join(",");
  type Pick = { key: string; node: ReactNode };
  const picks = useCityShelf<Pick>(
    async () => {
      const data = await apiFetch("/cities/best-picks", {
        version: "v2",
        auth: "required",
        query: { city: city.name, country: city.country_name, audio_language: languages },
        schema: bestPicksSchema,
      });
      const out: Pick[] = [];
      if (data.tour) {
        const tour = tourCardToTour(data.tour, city.name);
        out.push({ key: `tour-${tour.id}`, node: <CatalogCard tour={tour} eyebrow="Best audio tour" /> });
      }
      if (data.place) {
        const story = placeCardToTour(data.place, city.name);
        out.push({ key: `story-${story.id}`, node: <CatalogCard tour={story} eyebrow="Best audio story" /> });
      }
      const experience = experienceSummarySchema.safeParse(data.experience);
      if (experience.success) out.push({ key: `exp-${experience.data.id}`, node: <ExperienceCard experience={experience.data} /> });
      return out;
    },
    [city.id, langKey],
    "best_picks",
  );

  if (picks !== null && picks.length === 0) return null;
  return (
    <Shelf shelf="best_picks" eyebrow="Today's best picks" title={`Best of ${city.name} today`} className="bg-sand-50">
      {picks === null ? (
        <RailSkeleton />
      ) : (
        <CardRail label={`Best of ${city.name} today`}>
          {picks.map((p) => (
            <div key={p.key} className={CARD_WIDTH}>
              {p.node}
            </div>
          ))}
        </CardRail>
      )}
    </Shelf>
  );
}

/** `GET /api/v2/tours/recommended` over the city's ±1° box, as the app's Home does. */
function CityTours({ city, languages }: ShelfProps) {
  const coords = cityCoordinates(city);
  const langKey = languages.join(",");
  const tours = useCityShelf<Tour>(
    async () => {
      if (!coords) return [];
      const cards = await apiFetch("/tours/recommended", {
        version: "v2",
        auth: "required",
        query: {
          min_lat: coords.lat - TOUR_BOX_DEGREES,
          max_lat: coords.lat + TOUR_BOX_DEGREES,
          min_lon: coords.lng - TOUR_BOX_DEGREES,
          max_lon: coords.lng + TOUR_BOX_DEGREES,
          limit: SHELF_SIZE * 2,
          audio_language: languages,
        },
        schema: lenientList(tourCardSchema),
      });
      return cards.map((card) => tourCardToTour(card, city.name)).slice(0, SHELF_SIZE);
    },
    [city.id, langKey],
    "city_tours",
  );

  if (tours !== null && tours.length === 0) return null;
  const title = `Audio Tours in ${city.name}`;
  return (
    <Shelf
      shelf="city_tours"
      eyebrow="Audio tours"
      title={title}
      action={{ href: `/marketplace/tours/?city=${encodeURIComponent(city.id)}`, label: "See all" }}
    >
      <ShelfBody items={tours} label={title} />
    </Shelf>
  );
}

/** `GET /api/v2/places/nearby` around the city's coordinates, as the app's Home does. */
function CityStories({ city, languages }: ShelfProps) {
  const coords = cityCoordinates(city);
  const langKey = languages.join(",");
  const stories = useCityShelf<Tour>(
    async () => {
      if (!coords) return [];
      const cards = await apiFetch("/places/nearby", {
        version: "v2",
        auth: "required",
        query: {
          latitude: coords.lat,
          longitude: coords.lng,
          radius: NEARBY_RADIUS_METERS,
          skip: 0,
          limit: SHELF_SIZE,
          sort_by: "distance",
          sort_order: "asc",
          audio_language: languages,
        },
        schema: lenientList(placeCardSchema),
      });
      return cards.map((card) => placeCardToTour(card, city.name));
    },
    [city.id, langKey],
    "city_stories",
  );

  if (stories !== null && stories.length === 0) return null;
  const title = `Audio Stories in ${city.name}`;
  return (
    <Shelf
      shelf="city_stories"
      eyebrow="Audio stories"
      title={title}
      action={{ href: `/marketplace/story/?city=${encodeURIComponent(city.id)}`, label: "See all" }}
      className="bg-sand-50"
    >
      <ShelfBody items={stories} label={title} />
    </Shelf>
  );
}

function NextExperience() {
  const [next, setNext] = useState<BookingSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBookings()
      .then((list) => !cancelled && setNext(list.find(isUpcoming) ?? null))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!next) return null;
  const meeting = typeof next.meeting_point === "string" ? next.meeting_point : null;

  return (
    <Shelf shelf="next_experience" eyebrow="Coming up" title="Your next experience">
      <Link
        href={`/account/bookings/detail/?id=${encodeURIComponent(bookingId(next))}`}
        className="focus-ring group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-shadow hover:shadow-lift sm:flex-row"
      >
        {next.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={next.image_url} alt="" className="h-48 w-full object-cover sm:h-auto sm:w-72" />
        ) : (
          <span className="grid h-48 w-full place-items-center bg-brand-50 text-brand-700 sm:h-auto sm:w-72">
            <Ticket className="h-10 w-10" aria-hidden />
          </span>
        )}
        <div className="flex flex-1 flex-col gap-2 p-6">
          {next.local_date && (
            <span className="w-fit rounded-full bg-sunset-100 px-3 py-1 text-xs font-bold text-sunset-700">{countdownLabel(next.local_date)}</span>
          )}
          <h3 className="font-display text-xl font-bold text-ink">{next.title ?? "Your experience"}</h3>
          {next.local_date && (
            <p className="flex items-center gap-1.5 text-sm text-ink-soft">
              <Calendar className="h-4 w-4" aria-hidden />
              {formatDateLabel(next.local_date)}
              {next.local_time ? ` · ${formatTimeLabel(next.local_time)}` : ""}
            </p>
          )}
          {meeting && (
            <p className="flex items-center gap-1.5 text-sm text-ink-soft">
              <MapPin className="h-4 w-4" aria-hidden /> {meeting}
            </p>
          )}
          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-brand-700">
            View booking <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </Link>
    </Shelf>
  );
}

const COLLECTION_SIZE = 8;

function unlockedTime(u: LibraryUnlock): number {
  const raw = (u as Record<string, unknown>).unlocked_at ?? (u as Record<string, unknown>).created_at;
  const t = typeof raw === "string" ? Date.parse(raw) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function YourCollection() {
  const { places, tours } = useLibrary();
  const items = [
    ...(places ?? []).map((unlock) => ({ kind: "place" as const, unlock })),
    ...(tours ?? []).map((unlock) => ({ kind: "storylist" as const, unlock })),
  ]
    .filter(({ unlock }) => !isExpired(unlock))
    .sort((a, b) => unlockedTime(b.unlock) - unlockedTime(a.unlock))
    .slice(0, COLLECTION_SIZE);

  if (!items.length) return null;
  return (
    <Shelf shelf="your_collection" eyebrow="Unlocked by you" title="Your collection" action={{ href: "/account/collection/", label: "See all" }}>
      <CardRail label="Your collection">
        {items.map(({ kind, unlock }) => (
          <div key={`${kind}-${unlockTargetId(unlock)}`} className={CARD_WIDTH}>
            <UnlockCard kind={kind} unlock={unlock} compact />
          </div>
        ))}
      </CardRail>
    </Shelf>
  );
}

const wishlistItemSchema = z.union([
  experienceSummarySchema,
  z.object({ experience: experienceSummarySchema }).passthrough().transform((v) => v.experience),
]);

function Saved() {
  const [items, setItems] = useState<ExperienceSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/users/me/wishlists/experiences", { auth: "required", schema: listOf(wishlistItemSchema) })
      .then((list) => !cancelled && setItems(list))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items?.length) return null;
  return (
    <Shelf shelf="saved" eyebrow="Your wishlist" title="Saved experiences" action={{ href: "/account/wishlist/", label: "See all" }}>
      <CardRail label="Saved experiences">
        {items.slice(0, SHELF_SIZE).map((item) => (
          <div key={item.id} className={CARD_WIDTH}>
            <ExperienceCard
              experience={item}
              onWishlistChange={(saved) => !saved && setItems((list) => (list ?? []).filter((x) => x.id !== item.id))}
            />
          </div>
        ))}
      </CardRail>
    </Shelf>
  );
}
