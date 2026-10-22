"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { Clock, Headphones, Loader2, MapPin, Route, Send, Smartphone } from "@/components/icons";
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
  const title = u.title ?? u.name ?? (kind === "place" ? "Audio story" : "Audio walk");
  const narrator = typeof u.narrator === "string" ? u.narrator : null;
  const Heading = compact ? "h3" : "h2";
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

  return (
    <article
      className={cn(
        "flex gap-4 rounded-3xl bg-white shadow-card",
        compact ? "h-full flex-col p-4" : "flex-col p-4 sm:flex-row sm:items-center sm:p-5",
        className,
      )}
    >
      <div className={cn("flex min-w-0 flex-1 gap-4", compact ? "flex-col" : "items-center")}>
        {u.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={u.image_url}
            alt=""
            className={cn("shrink-0 rounded-2xl object-cover", compact ? "aspect-[4/3] w-full" : "h-20 w-20 sm:h-24 sm:w-24")}
          />
        ) : (
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700",
              compact ? "aspect-[4/3] w-full" : "h-20 w-20 sm:h-24 sm:w-24",
            )}
          >
            <KindIcon className="h-7 w-7" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <Heading className="line-clamp-2 font-display font-bold text-ink">{title}</Heading>
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
        <div className={cn("flex flex-wrap gap-2", compact ? "mt-auto" : "sm:flex-col sm:items-stretch")}>
          <Button type="button" onClick={() => setOpen(true)} className={cn("h-11 rounded-full px-5", compact && "flex-1")}>
            <Smartphone className="h-4 w-4" aria-hidden /> Open in app
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={send}
            disabled={sending}
            aria-label={compact ? `Send ${title} to my phone` : undefined}
            className={cn("h-11 rounded-full", compact ? "w-11 px-0" : "px-5")}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            {!compact && "Send to my phone"}
          </Button>
        </div>
      )}
      <AppHandoffSheet
        open={open}
        onOpenChange={setOpen}
        source={source}
        title={`Open “${title}” in the Gamana app`}
        steps={["Open Gamana on your phone", "Log in with the same account", "Find it in My Collection and tap play"]}
        deepLink={deepLinkFor(kind, id)}
      />
    </article>
  );
}
