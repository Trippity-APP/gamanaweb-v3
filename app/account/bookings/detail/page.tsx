"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ErrorState } from "@/components/common/ErrorState";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { ReviewForm } from "@/components/account/ReviewForm";
import { ArrowLeft, Calendar, Clock, ExternalLink, Loader2, Mail, MapPin, Phone, Smartphone, Ticket, Users } from "@/components/icons";
import { toast } from "@/hooks/use-toast";
import {
  bookingTone,
  cancelBooking,
  fetchBookingBrief,
  fetchReviewable,
  TONE_CLASS,
  TONE_LABEL,
  type BookingBrief,
  type Reviewable,
} from "@/lib/account/bookings";
import { experienceHref, formatDateLabel, formatMoney, formatTimeLabel } from "@/lib/experiences/format";
import { downloadIcs } from "@/lib/experiences/ics";
import { cn } from "@/lib/utils";

const MeetingPointMap = dynamic(() => import("@/components/experiences/MeetingPointMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full rounded-3xl" />,
});

const CARD = "rounded-3xl bg-white p-6 shadow-card";

export default function BookingDetailPage() {
  const [id, setId] = useState<string | null | undefined>(undefined);
  const [brief, setBrief] = useState<BookingBrief | null>(null);
  const [error, setError] = useState(false);
  const [reviewable, setReviewable] = useState<Reviewable | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [handoff, setHandoff] = useState(false);

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id"));
  }, []);

  const load = useCallback(() => {
    if (!id) return;
    setError(false);
    fetchBookingBrief(id)
      .then(setBrief)
      .catch(() => setError(true));
    fetchReviewable()
      .then((list) => setReviewable(list.find((r) => String(r.booking_id ?? "") === id) ?? null))
      .catch(() => setReviewable(null));
  }, [id]);

  useEffect(load, [load]);

  const cancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await cancelBooking(id);
      toast({ title: "Booking cancelled", description: "The operator will process any refund." });
      setConfirmCancel(false);
      load();
    } catch {
      toast({ title: "Couldn't cancel this booking", description: "Please try again or contact the operator.", variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  if (id === null) {
    return <ErrorState title="Booking not found" hint="Open it from your bookings list." />;
  }
  if (error) {
    return <ErrorState title="Couldn't load this booking" onRetry={load} />;
  }
  if (!brief) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
    );
  }

  const tone = bookingTone(brief.status);
  const slug = brief.experience_slug ?? "";
  const meeting = brief.meeting_point_address ?? brief.meeting_point;
  const hasMap = typeof brief.latitude === "number" && typeof brief.longitude === "number";
  const operatorName = brief.operator?.name ?? brief.operator_name ?? "the operator";

  return (
    <div className="space-y-6">
      <Link href="/account/bookings/" className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded text-sm font-semibold text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All bookings
      </Link>

      <section className={CARD}>
        <div className="flex flex-col gap-5 sm:flex-row">
          {brief.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brief.image_url} alt="" className="h-32 w-full rounded-2xl object-cover sm:h-28 sm:w-28" />
          ) : (
            <span className="grid h-28 w-28 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Ticket className="h-8 w-8" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE_CLASS[tone])}>{TONE_LABEL[tone]}</span>
            <h1 className="mt-2 font-display text-h3 font-bold text-ink">{brief.title ?? "Your booking"}</h1>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
              {brief.local_date && (
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden /> {formatDateLabel(brief.local_date)}
                  {brief.local_time && (
                    <>
                      <Clock className="ml-2 h-4 w-4" aria-hidden /> {formatTimeLabel(brief.local_time)}
                    </>
                  )}
                </li>
              )}
              {brief.travellers && (
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" aria-hidden /> {brief.travellers}
                </li>
              )}
              {brief.confirmation_code && (
                <li>
                  Reference <span className="font-semibold text-ink">{brief.confirmation_code}</span>
                </li>
              )}
              {typeof brief.total_price === "number" && (
                <li>
                  Paid to {operatorName}: <span className="font-semibold text-ink">{formatMoney(brief.total_price, brief.currency)}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {brief.local_date && tone !== "cancelled" && (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full px-5"
              onClick={() =>
                downloadIcs({
                  uid: String(brief.booking_id ?? brief.id ?? id),
                  title: brief.title ?? "Gamana experience",
                  date: brief.local_date!,
                  time: brief.local_time,
                  durationMinutes: brief.duration_minutes,
                  location: brief.pickup ?? meeting,
                  description: brief.confirmation_code ? `Booking reference ${brief.confirmation_code}` : null,
                })
              }
            >
              <Calendar className="h-4 w-4" aria-hidden /> Add to calendar
            </Button>
          )}
          <Button type="button" variant="outline" className="h-11 rounded-full px-5" onClick={() => setHandoff(true)}>
            <Smartphone className="h-4 w-4" aria-hidden /> Open in app
          </Button>
          {slug && (
            <Button asChild variant="ghost" className="h-11 rounded-full px-5">
              <Link href={experienceHref(slug)}>View experience</Link>
            </Button>
          )}
        </div>
        <p className="mt-3 text-xs text-ink-muted">Your voucher lives in the Gamana app.</p>
      </section>

      {reviewable && slug && (
        <section className={CARD} aria-labelledby="rate-heading">
          <h2 id="rate-heading" className="text-h3 text-ink">
            Rate your experience
          </h2>
          <div className="mt-4">
            <ReviewForm slug={slug} bookingId={String(brief.booking_id ?? id)} reviewableId={String(reviewable.id)} onDone={() => undefined} />
          </div>
        </section>
      )}

      {(meeting || brief.pickup) && (
        <section className={CARD} aria-labelledby="meet-heading">
          <h2 id="meet-heading" className="text-h3 text-ink">
            {brief.pickup ? "Pickup" : "Meeting point"}
          </h2>
          <p className="mt-2 flex items-start gap-2 text-ink-soft">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand-700" aria-hidden /> {brief.pickup ?? meeting}
          </p>
          {hasMap && (
            <div className="mt-4 space-y-3">
              <MeetingPointMap lat={brief.latitude!} lng={brief.longitude!} label="Map of the meeting point" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${brief.latitude},${brief.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded text-sm font-semibold text-brand-700"
              >
                Open in Google Maps <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
          )}
        </section>
      )}

      {brief.what_to_bring.length > 0 && (
        <section className={CARD} aria-labelledby="bring-heading">
          <h2 id="bring-heading" className="text-h3 text-ink">
            What to bring
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
            {brief.what_to_bring.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={CARD} aria-labelledby="operator-heading">
        <h2 id="operator-heading" className="text-h3 text-ink">
          Operator
        </h2>
        <p className="mt-2 text-ink-soft">Bookings are fulfilled and paid to {operatorName}.</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          {brief.operator?.phone && (
            <a href={`tel:${brief.operator.phone.replace(/\s/g, "")}`} className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded font-semibold text-brand-700">
              <Phone className="h-4 w-4" aria-hidden /> {brief.operator.phone}
            </a>
          )}
          {brief.operator?.email && (
            <a href={`mailto:${brief.operator.email}`} className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded font-semibold text-brand-700">
              <Mail className="h-4 w-4" aria-hidden /> {brief.operator.email}
            </a>
          )}
        </div>
      </section>

      {(brief.cancellation_policy || brief.is_cancellable) && (
        <section className={CARD} aria-labelledby="cancel-heading">
          <h2 id="cancel-heading" className="text-h3 text-ink">
            Cancellation
          </h2>
          {brief.cancellation_policy && <p className="mt-2 text-ink-soft">{brief.cancellation_policy}</p>}
          {brief.refund_text && <p className="mt-2 text-sm text-ink-soft">{brief.refund_text}</p>}
          <p className="mt-2 text-sm text-ink-soft">Refunds are handled by {operatorName}.</p>
          {brief.is_cancellable && tone !== "cancelled" && (
            <Button type="button" variant="outline" onClick={() => setConfirmCancel(true)} className="mt-4 h-11 rounded-full border-destructive/40 px-5 text-destructive hover:bg-destructive/5">
              Cancel booking
            </Button>
          )}
        </section>
      )}

      <AlertDialog open={confirmCancel} onOpenChange={(o) => !cancelling && setConfirmCancel(o)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                {brief.cancellation_policy && <p>{brief.cancellation_policy}</p>}
                <p>{brief.refund_text ?? `Any refund is processed by ${operatorName} to your original payment method.`}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling} className="h-11 rounded-full">
              Keep booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void cancel();
              }}
              disabled={cancelling}
              className="h-11 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AppHandoffSheet
        open={handoff}
        onOpenChange={setHandoff}
        source="booking-detail"
        title="Your voucher is in the Gamana app"
        steps={["Open Gamana on your phone", "Go to My Collection → Bookings", "Show your voucher on the day"]}
        deepLink={`https://www.gamana.app/experiences/${encodeURIComponent(slug)}`}
      />
    </div>
  );
}
