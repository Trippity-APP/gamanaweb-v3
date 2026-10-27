"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { Check, Clock, Headphones, Loader2, MapPin, Route, Send, Smartphone } from "@/components/icons";
import { MarketplaceCoverImage } from "@/components/marketplace/marketplace-cover-image";
import { getTourHref } from "@/lib/marketplace-api";
import { toast } from "@/hooks/use-toast";
import type { LibraryUnlock } from "@/lib/api/schemas/library";
import { deepLinkFor, sendToPhone, unlockStatusLine, unlockTargetId, useLibrary, type UnlockKind } from "@/lib/library/library-context";
import { cn } from "@/lib/utils";

type UnlockCardProps = {
  kind: UnlockKind;
  unlock: LibraryUnlock;
  expired?: boolean;
  /** Vertical card for home rails; the default is the full-width collection row. */
  compact?: boolean;
  className?: string;
};

export function UnlockCard({ kind, unlock: u, expired = false, compact = false, className }: UnlockCardProps) {
  const library = useLibrary();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const id = unlockTargetId(u);
  const status = expired ? { text: "Expired", urgent: false } : unlockStatusLine(u);
  const title = u.title ?? u.name ?? (kind === "place" ? "Audio story" : "Audio tour");
  const narrator = typeof u.narrator === "string" ? u.narrator : null;
  const source = compact ? (kind === "place" ? "home-collection-story" : "home-collection-walk") : kind === "place" ? "collection-story" : "collection-walk";

  const send = useCallback(async () => {
    setSending(true);
    try {
      library.setLastHandoff(await sendToPhone(kind, id));
      toast({ title: "Sent. Check your phone." });
    } catch {
      toast({ title: "Couldn't send it to your phone", description: "Open the Gamana app to find it in My Collection.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }, [kind, id, library]);

  const KindIcon = kind === "place" ? Headphones : Route;

  const handoff = (
    <AppHandoffSheet
      open={open}
      onOpenChange={setOpen}
      source={source}
      title={`Open “${title}” in the Gamana app`}
      steps={["Open Gamana on your phone", "Log in with the same account", "Find it in My Collection and tap play"]}
      deepLink={deepLinkFor(kind, id)}
    />
  );

  if (compact) {
    const href = getTourHref({ id, contentKind: kind === "place" ? "story" : "walk" });
    return (
      <article
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          className,
        )}
      >
        <Link href={href} className="focus-ring flex flex-1 flex-col rounded-t-3xl">
          <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
            {u.image_url ? (
              <MarketplaceCoverImage
                src={u.image_url}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105 motion-reduce:transition-none"
                useDefaultFallback={kind === "place"}
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-700/15 via-brand-500/10 to-sand-100 text-brand-700">
                <KindIcon className="h-8 w-8" aria-hidden />
              </span>
            )}
            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-700 px-3 py-1 text-xs font-bold text-white">
              <Check className="h-3 w-3" aria-hidden />
              Unlocked
            </span>
          </div>
          <div className="flex flex-1 flex-col p-5 pb-3">
            {u.city && (
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{u.city}</span>
              </p>
            )}
            <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-ink">{title}</h3>
            <p className="mt-1.5 text-sm text-ink-muted">
              {kind === "place" ? "Audio story" : "Audio tour"}
              {" · "}
              {kind === "place" ? `Narrated by ${narrator ?? "Gamana"}` : "Organized by Gamana"}
            </p>
          </div>
        </Link>
        <div className="flex items-center justify-between gap-3 border-t border-ink/5 px-5 py-3.5">
          {status ? (
            <p className={cn("flex min-w-0 items-center gap-1 text-sm font-medium", status.urgent ? "text-sunset-600" : "text-ink-soft")}>
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{status.text}</span>
            </p>
          ) : (
            <span />
          )}
          {!expired && (
            <div className="flex shrink-0 gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)} className="min-h-11 rounded-full px-4">
                <Smartphone className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Open in app
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={send}
                disabled={sending}
                aria-label={`Send ${title} to my phone`}
                className="h-11 w-11 rounded-full px-0"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              </Button>
            </div>
          )}
        </div>
        {handoff}
      </article>
    );
  }

  return (
    <article
      className={cn(
        "flex gap-4 rounded-3xl bg-white shadow-card",
        "flex-col p-4 sm:flex-row sm:items-center sm:p-5",
        className,
      )}
    >
      <div className={"flex min-w-0 flex-1 items-center gap-4"}>
        {u.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={u.image_url}
            alt=""
            className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24"
          />
        ) : (
          <span
            className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 sm:h-24 sm:w-24"
          >
            <KindIcon className="h-7 w-7" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="line-clamp-2 font-display font-bold text-ink">{title}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
            {u.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden /> {u.city}
              </span>
            )}
            {narrator && <span>Narrated by {narrator}</span>}
          </p>
          {status && (
            <p className={cn("mt-1.5 flex items-center gap-1 text-sm font-medium", status.urgent ? "text-sunset-600" : "text-ink-soft")}>
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              {status.text}
            </p>
          )}
        </div>
      </div>
      {!expired && (
        <div className={"flex flex-wrap gap-2 sm:flex-col sm:items-stretch"}>
          <Button type="button" onClick={() => setOpen(true)} className="h-11 rounded-full px-5">
            <Smartphone className="h-4 w-4" aria-hidden /> Open in app
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={send}
            disabled={sending}
            className="h-11 rounded-full px-5"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            Send to my phone
          </Button>
        </div>
      )}
      {handoff}
    </article>
  );
}
