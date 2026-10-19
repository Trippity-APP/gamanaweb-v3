"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardRail } from "@/components/site/CardRail";
import { SectionHeader } from "@/components/site/SectionHeader";
import { TourCard } from "@/components/site/TourCard";
import { UnlockCard } from "@/components/account/UnlockCard";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { ExperienceCard } from "@/components/experiences/ExperienceCard";
import { ExperiencesRail } from "@/components/experiences/ExperiencesRail";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { ArrowRight, Calendar, Headphones, Loader2, MapPin, Navigation, Ticket } from "@/components/icons";
import { toast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";
import { apiFetch } from "@/lib/api/client";
import { hasSessionHint } from "@/lib/api/session";
import { experienceSummarySchema, type ExperienceSummary } from "@/lib/api/schemas/experiences";
import type { BookingSummary } from "@/lib/api/schemas/bookings";
import type { LibraryUnlock } from "@/lib/api/schemas/library";
import { bookingId, fetchBookings, isUpcoming, listOf } from "@/lib/account/api";
import { fetchPersonalization, narratorLanguages, type PersonalizationDoc } from "@/lib/account/personalization";
import { useAuth } from "@/lib/auth/auth-context";
import { detectPricingCurrency } from "@/lib/coin-pricing";
import { formatDateLabel, formatTimeLabel } from "@/lib/experiences/format";
import { cityLabel, readLastCity, writeLastCity } from "@/lib/home/last-city";
import { isExpired, unlockTargetId, useLibrary } from "@/lib/library/library-context";
import {
  cityCatalog,
  getDefaultTourImage,
  getTourHref,
  mapStorylistToTour,
  type ApiStorylist,
} from "@/lib/marketplace-api";
import type { SearchTour, Tour } from "@/lib/marketplace-data";
import { loadSearchCatalog } from "@/lib/search-catalog";
import { fetchAllActiveCities, getCityHref, type ApiCity } from "@/lib/services/cityService";

type Place = { city: string | null; country: string | null };

const SHELF_SIZE = 10;
const CARD_WIDTH = "w-[260px] sm:w-[300px]";

/** Decision 18: profile home city → last city opened → country from pricing currency → none. */
function resolvePlace(doc: PersonalizationDoc | null): Place {
  const home = doc?.travel_profile?.home_city;
  if (typeof home === "string" && home.trim()) return { city: cityLabel(home), country: null };
  const last = readLastCity();
  if (last) return { city: cityLabel(last), country: null };
  return { city: null, country: detectPricingCurrency() === "INR" ? "India" : null };
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
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-72 w-[260px] shrink-0 rounded-3xl sm:w-[300px]" />
              ))}
            </div>
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

function Feed() {
  const [doc, setDoc] = useState<PersonalizationDoc | null | undefined>(undefined);
  const [place, setPlace] = useState<Place | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPersonalization()
      .catch(() => null)
      .then((d) => {
        if (cancelled) return;
        setDoc(d);
        setPlace(resolvePlace(d));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const changeCity = (name: string) => {
    const city = cityLabel(name);
    writeLastCity(city);
    setPlace({ city, country: null });
  };

  const languages = doc ? narratorLanguages(doc) : [];
  const { places: unlockedPlaces, tours: unlockedTours } = useLibrary();
  const [catalog, setCatalog] = useState<SearchTour[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSearchCatalog()
      .then((all) => !cancelled && setCatalog(all))
      .catch(() => !cancelled && setCatalog([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const inCity = useMemo(
    () => (place?.city && catalog ? cityCatalog(catalog, place.city, SHELF_SIZE) : { tours: [], stories: [] }),
    [catalog, place?.city],
  );

  const exclude = useMemo(() => {
    const ids = new Set<string>();
    for (const u of [...(unlockedPlaces ?? []), ...(unlockedTours ?? [])]) ids.add(unlockTargetId(u));
    for (const t of [...inCity.tours, ...inCity.stories]) ids.add(t.id);
    return ids;
  }, [unlockedPlaces, unlockedTours, inCity]);

  return (
    <div>
      <Welcome place={place} onCityChange={changeCity} />
      <NextExperience />
      <YourCollection />
      {place && (
        <>
          {place.city && <InCityShelves city={place.city} tours={inCity.tours} stories={inCity.stories} />}
          <PickedForYou city={place.city} languages={languages} catalog={catalog} exclude={exclude} />
          <Tracked shelf="experiences">
            <ExperiencesRail
              eyebrow="Book a local experience"
              title={place.city ? `Experiences in ${place.city}` : "Experiences for you"}
              query={place.city ? { city: place.city, page_size: SHELF_SIZE } : place.country ? { country: place.country, page_size: SHELF_SIZE } : { featured: true, page_size: SHELF_SIZE }}
              fallbackQuery={{ featured: true, page_size: SHELF_SIZE }}
              seeAllHref={place.city ? `/experiences/?city=${encodeURIComponent(place.city)}` : "/experiences/"}
            />
          </Tracked>
        </>
      )}
      <Saved />
    </div>
  );
}

function Welcome({ place, onCityChange }: { place: Place | null; onCityChange: (city: string) => void }) {
  const { user } = useAuth();
  const { places, tours } = useLibrary();
  const tracking = useShelfTracking("welcome");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [locating, setLocating] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);

  const pending = [...(places ?? []), ...(tours ?? [])].filter((u) => u.activation_status === "pending" && !isExpired(u)).length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onCityChange(draft);
    setEditing(false);
    setDraft("");
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Location isn't available in this browser." });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const nearest = nearestCity(await fetchAllActiveCities(), coords.latitude, coords.longitude);
          if (nearest) {
            onCityChange(nearest.name);
            setEditing(false);
          } else {
            toast({ title: "We couldn't find a Gamana city near you yet." });
          }
        } catch {
          toast({ title: "Couldn't look up cities right now.", variant: "destructive" });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast({ title: "Location permission was denied." });
      },
      { maximumAge: 600_000, timeout: 10_000 },
    );
  };

  return (
    <section ref={tracking.ref} onClickCapture={tracking.onClickCapture} className="section-tight bg-sand-50">
      <div className="container-site">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-h2 text-ink">Welcome back{user?.firstName ? `, ${user.firstName}` : ""}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
              {place?.city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-brand-700" aria-hidden /> Showing {place.city}
                </span>
              ) : place?.country ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-brand-700" aria-hidden /> Showing {place.country}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                aria-expanded={editing}
                className="focus-ring min-h-[44px] rounded px-1 font-semibold text-brand-700 hover:text-brand-800"
              >
                {place?.city ? "Change city" : "Pick a city"}
              </button>
            </div>
          </div>
        </div>

        {editing && (
          <form onSubmit={submit} className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="home-city" className="sr-only">
              City
            </label>
            <CityAutocomplete id="home-city" placeholder="Search a city" value={draft} onChange={setDraft} className="h-11 flex-1 rounded-full" />
            <div className="flex gap-2">
              <Button type="submit" className="h-11 rounded-full px-5">
                Show
              </Button>
              <Button type="button" variant="ghost" onClick={useMyLocation} disabled={locating} className="h-11 rounded-full px-4">
                {locating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Navigation className="h-4 w-4" aria-hidden />}
                Use my location
              </Button>
            </div>
          </form>
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
    const clat = Number(c.latitude);
    const clng = Number(c.longitude);
    if (!Number.isFinite(clat) || !Number.isFinite(clng)) continue;
    const dLat = ((clat - lat) * Math.PI) / 180;
    const dLng = ((clng - lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((clat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return bestDist <= 150 ? best : null;
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

function TourRail({ label, tours }: { label: string; tours: SearchTour[] }) {
  return (
    <CardRail label={label}>
      {tours.map((t) => (
        <div key={t.id} className={CARD_WIDTH}>
          <TourCard
            href={getTourHref(t)}
            title={t.title}
            location={t.location}
            image={t.image || getDefaultTourImage()}
            imageAlt={t.title}
            badge={t.price > 0 ? `${t.price} coins` : "Free"}
            cta={t.contentKind === "walk" ? "View walk" : "Listen"}
          />
        </div>
      ))}
    </CardRail>
  );
}

const storylistItem = z.custom<ApiStorylist>((v) => typeof v === "object" && v !== null);

function PickedForYou({
  city,
  languages,
  catalog,
  exclude,
}: {
  city: string | null;
  languages: string[];
  catalog: SearchTour[] | null;
  exclude: Set<string>;
}) {
  const [recommended, setRecommended] = useState<SearchTour[] | null>(null);
  const langKey = languages.join(",");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/tours/recommended", {
      auth: "required",
      version: "v2",
      query: { audio_language: langKey || undefined, city: city ?? undefined, page_size: SHELF_SIZE * 2 },
      schema: listOf(storylistItem),
    })
      .then((raw) => !cancelled && setRecommended(raw.map(mapStorylistToTour).filter((t): t is Tour => t !== null)))
      .catch(() => !cancelled && setRecommended([]));
    return () => {
      cancelled = true;
    };
  }, [city, langKey]);

  const source = recommended?.length ? recommended : (catalog ?? []).filter((t) => t.isRecommended);
  const tours = source.filter((t) => !exclude.has(t.id)).slice(0, SHELF_SIZE);

  if (recommended === null || !tours.length) return null;
  return (
    <Shelf shelf="picked_for_you" eyebrow="Audio tours & stories" title="Picked for you" action={{ href: "/marketplace/", label: "See all" }}>
      <TourRail label="Picked for you" tours={tours} />
    </Shelf>
  );
}

function useCityHref(city: string): string {
  const [href, setHref] = useState("/cities/");
  useEffect(() => {
    let cancelled = false;
    fetchAllActiveCities()
      .then((list) => {
        const match = list.find((c) => c.name.toLowerCase() === city.toLowerCase());
        if (!cancelled) setHref(match ? getCityHref(match) : "/cities/");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [city]);
  return href;
}

/** Same split as the city page: recommended audio tours, then audio stories. */
function InCityShelves({ city, tours, stories }: { city: string; tours: SearchTour[]; stories: SearchTour[] }) {
  const cityHref = useCityHref(city);
  const explore = { href: cityHref, label: `Explore ${city}` };

  return (
    <>
      {tours.length > 0 && (
        <Shelf
          shelf="city_tours"
          eyebrow="Audio tours"
          title={`Audio Tours in ${city}`}
          action={stories.length ? undefined : explore}
          className="bg-sand-50"
        >
          <TourRail label={`Audio Tours in ${city}`} tours={tours} />
        </Shelf>
      )}
      {stories.length > 0 && (
        <Shelf shelf="city_stories" eyebrow="Audio stories" title={`Audio stories in ${city}`} action={explore}>
          <TourRail label={`Audio stories in ${city}`} tours={stories} />
        </Shelf>
      )}
    </>
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
