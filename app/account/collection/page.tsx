"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { BookingsList } from "@/components/account/BookingsList";
import { UnlockCard } from "@/components/account/UnlockCard";
import { Headphones, Route, Smartphone } from "@/components/icons";
import { apiFetch } from "@/lib/api/client";
import { idField, nullish } from "@/lib/api/schemas/common";
import { listOf } from "@/lib/account/api";
import { deepLinkFor, isExpired, unlockTargetId, useLibrary, type UnlockKind } from "@/lib/library/library-context";

type Tab = "stories" | "walks" | "tours" | "bookings";

const TABS: { value: Tab; label: string }[] = [
  { value: "stories", label: "Stories" },
  { value: "walks", label: "Audio Walks" },
  { value: "tours", label: "Tours" },
  { value: "bookings", label: "Bookings" },
];

const myStorylistSchema = z
  .object({
    id: nullish(idField),
    _id: nullish(idField),
    title: nullish(z.string()),
    name: nullish(z.string()),
    city: nullish(z.string()),
    image_url: nullish(z.string()),
    stops_count: nullish(z.number()),
    updated_at: nullish(z.string()),
  })
  .passthrough();

type MyStorylist = z.infer<typeof myStorylistSchema>;

function initialTab(): Tab {
  if (typeof window === "undefined") return "stories";
  const t = new URLSearchParams(window.location.search).get("tab");
  return TABS.some((x) => x.value === t) ? (t as Tab) : "stories";
}

export default function CollectionPage() {
  const [tab, setTab] = useState<Tab>("stories");

  useEffect(() => setTab(initialTab()), []);

  const select = (value: string) => {
    setTab(value as Tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-h2 font-bold text-ink">My Collection</h1>
        <p className="mt-2 text-ink-soft">Everything you&apos;ve unlocked or booked — the same collection as your Gamana app.</p>
      </div>
      <Tabs value={tab} onValueChange={select}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-3xl bg-white p-1 shadow-card sm:rounded-full">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="min-h-[44px] rounded-full px-5 data-[state=active]:bg-brand-700 data-[state=active]:text-white"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="stories" className="mt-6">
          <UnlockList kind="place" />
        </TabsContent>
        <TabsContent value="walks" className="mt-6">
          <UnlockList kind="storylist" />
        </TabsContent>
        <TabsContent value="tours" className="mt-6">
          <MyTours />
        </TabsContent>
        <TabsContent value="bookings" className="mt-6">
          <BookingsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 rounded-3xl" />
      <Skeleton className="h-28 rounded-3xl" />
    </div>
  );
}

function UnlockList({ kind }: { kind: UnlockKind }) {
  const library = useLibrary();
  const list = kind === "place" ? library.places : library.tours;
  const [showExpired, setShowExpired] = useState(false);

  if (list === null) {
    return library.loading ? <ListSkeleton /> : <ErrorState title="Couldn't load your collection" onRetry={() => void library.invalidate()} />;
  }

  const active = list.filter((u) => !isExpired(u));
  const expired = list.filter((u) => isExpired(u));

  if (active.length === 0 && expired.length === 0) {
    return (
      <EmptyState
        icon={kind === "place" ? Headphones : Route}
        title={kind === "place" ? "No stories yet" : "No audio walks yet"}
        hint={
          kind === "place"
            ? "Unlock an audio story with your coins and it shows up here and in your Gamana app."
            : "Unlock an audio walk and it shows up here and in your Gamana app."
        }
        action={
          <Button asChild className="h-11 rounded-full px-6">
            <Link href={kind === "place" ? "/marketplace/story/" : "/marketplace/tours/"}>
              {kind === "place" ? "Browse audio stories" : "Browse audio walks"}
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {active.length > 0 ? (
        <ul className="space-y-4">
          {active.map((u) => (
            <li key={`${kind}-${unlockTargetId(u)}`}>
              <UnlockCard kind={kind} unlock={u} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">Nothing active right now.</p>
      )}
      {expired.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowExpired((v) => !v)}
            aria-expanded={showExpired}
            className="focus-ring min-h-[44px] rounded text-sm font-semibold text-brand-700"
          >
            {showExpired ? "Hide" : "Show"} expired ({expired.length})
          </button>
          {showExpired && (
            <ul className="mt-3 space-y-4 opacity-70">
              {expired.map((u) => (
                <li key={`${kind}-exp-${unlockTargetId(u)}`}>
                  <UnlockCard kind={kind} unlock={u} expired />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function MyTours() {
  const [list, setList] = useState<MyStorylist[] | null>(null);
  const [error, setError] = useState(false);
  const [handoff, setHandoff] = useState<MyStorylist | null>(null);

  const load = useCallback(() => {
    setError(false);
    setList(null);
    apiFetch("/storylists/my-storylists", { auth: "required", schema: listOf(myStorylistSchema) })
      .then(setList)
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  if (error) return <ErrorState title="Couldn't load your tours" onRetry={load} />;
  if (list === null) return <ListSkeleton />;
  if (list.length === 0) {
    return (
      <EmptyState
        icon={Route}
        title="No tours yet"
        hint="Build your own tour from stories in the Gamana app — it shows up here."
        action={
          <Button asChild className="h-11 rounded-full px-6">
            <Link href="/marketplace/">Find stories to add</Link>
          </Button>
        }
      />
    );
  }

  const handoffId = handoff ? String(handoff.id ?? handoff._id ?? "") : "";

  return (
    <>
      <ul className="space-y-4">
        {list.map((t) => {
          const id = String(t.id ?? t._id ?? "");
          return (
            <li key={id} className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:p-5">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Route className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="line-clamp-2 font-display font-bold text-ink">{t.title ?? t.name ?? "My tour"}</h2>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-ink-soft">
                    {t.city && <span>{t.city}</span>}
                    {typeof t.stops_count === "number" && (
                      <span>
                        {t.stops_count} stop{t.stops_count === 1 ? "" : "s"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={() => setHandoff(t)} className="h-11 rounded-full px-5">
                <Smartphone className="h-4 w-4" aria-hidden /> Edit in app
              </Button>
            </li>
          );
        })}
      </ul>
      <AppHandoffSheet
        open={handoff !== null}
        onOpenChange={(o) => !o && setHandoff(null)}
        source="collection-tour"
        title="Edit your tour in the Gamana app"
        steps={["Open Gamana on your phone", "Go to My Collection → Tours", "Tap your tour to edit it"]}
        deepLink={handoffId ? deepLinkFor("storylist", handoffId) : "https://www.gamana.app/"}
      />
    </>
  );
}
