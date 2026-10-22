"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { AlertCircle, Calendar, Check, Clock, Loader2, MapPin, Phone, Smartphone, Users, X } from "@/components/icons";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth/auth-context";
import { fetchBookingBrief, type BookingBrief } from "@/lib/account/bookings";
import { getExperienceDetail } from "@/lib/experiences/api";
import { clearStoredCheckout, getCheckoutState, retryPayment } from "@/lib/experiences/checkout";
import { experienceHref, formatDateLabel, formatTimeLabel } from "@/lib/experiences/format";
import { downloadIcs } from "@/lib/experiences/ics";
import type { CheckoutState } from "@/lib/api/schemas/bookings";

type View = "checking" | "confirmed" | "failed" | "cancelled" | "pending" | "expired" | "invalid";

const FAST_MS = 3000;
const FAST_WINDOW_MS = 30_000;
const SLOW_MS = 10_000;
const MAX_MS = 120_000;

function viewFor(state: CheckoutState): View | null {
  switch (state.status) {
    case "confirmed":
      return "confirmed";
    case "payment_failed":
      return "failed";
    case "expired":
    case "aborted":
      return "expired";
    default:
      return null;
  }
}

export function ReturnClient() {
  const { status: authStatus, openLogin } = useAuth();
  const [params, setParams] = useState<{ status: string; checkoutId: string; slug: string } | null>(null);
  const [view, setView] = useState<View>("checking");
  const [state, setState] = useState<CheckoutState | null>(null);
  const [brief, setBrief] = useState<BookingBrief | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");
  const [handoff, setHandoff] = useState(false);
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (view !== "pending" || !params?.slug) return;
    const controller = new AbortController();
    getExperienceDetail(params.slug, controller.signal)
      .then((exp) => setOperatorName(exp.operator_name?.trim() || null))
      .catch(() => undefined);
    return () => controller.abort();
  }, [view, params?.slug]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const checkoutId = q.get("checkout_id") ?? "";
    const slug = q.get("exp") ?? "";
    if (!checkoutId) {
      setView("invalid");
      return;
    }
    setParams({ status: q.get("status") ?? "", checkoutId, slug });
    if (q.get("status") === "cancel") setView("cancelled");
  }, []);

  useEffect(() => {
    if (!params || params.status === "cancel" || authStatus !== "authenticated") return;
    let cancelled = false;
    let timer: number | undefined;
    const started = Date.now();

    const poll = async () => {
      try {
        const next = await getCheckoutState(params.checkoutId);
        if (cancelled) return;
        setState(next);
        const terminal = viewFor(next);
        if (terminal) {
          setView(terminal);
          return;
        }
      } catch {
        // Keep polling: a transient error shouldn't end the wait.
      }
      const elapsed = Date.now() - started;
      if (elapsed >= MAX_MS) {
        setView("pending");
        return;
      }
      timer = window.setTimeout(poll, elapsed < FAST_WINDOW_MS ? FAST_MS : SLOW_MS);
    };
    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [params, authStatus]);

  useEffect(() => {
    if (!params || tracked.current) return;
    if (view === "confirmed") {
      tracked.current = true;
      clearStoredCheckout(params.slug);
      const confirmed = (b: BookingBrief | null) =>
        track("booking_confirmed", { slug: params.slug, value: b?.total_price ?? undefined, currency: b?.currency ?? undefined });
      if (state?.booking_id) {
        fetchBookingBrief(String(state.booking_id))
          .then((b) => {
            setBrief(b);
            confirmed(b);
          })
          .catch(() => {
            setBrief(null);
            confirmed(null);
          });
      } else {
        confirmed(null);
      }
    } else if (view === "failed" || view === "expired") {
      tracked.current = true;
      track("booking_failed", { slug: params.slug, reason: view });
    }
  }, [view, params, state]);

  const retry = async () => {
    if (!params) return;
    setRetrying(true);
    setRetryError("");
    try {
      window.location.assign(await retryPayment(params.checkoutId));
    } catch {
      setRetrying(false);
      setRetryError("We couldn't reopen the payment page. Please choose a time again.");
    }
  };

  const backHref = params?.slug ? experienceHref(params.slug) : "/experiences/";
  const bookingId = state?.booking_id ? String(state.booking_id) : null;

  if (view === "checking" && authStatus === "anonymous") {
    return (
      <Panel>
        <Heading icon="alert" title="Log in to see your booking" />
        <Actions>
          <Button type="button" onClick={() => openLogin({ reason: "to see your booking" })} className="h-11 rounded-full px-6">
            Log in
          </Button>
        </Actions>
      </Panel>
    );
  }

  if (view === "checking") {
    return (
      <Panel>
        <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
          <Loader2 className="h-10 w-10 animate-spin text-brand-700" aria-hidden />
          <h1 className="mt-5 font-display text-h3 text-ink">Confirming your booking…</h1>
          <p className="mt-2 text-ink-soft">This usually takes a few seconds. Please keep this page open.</p>
        </div>
      </Panel>
    );
  }

  if (view === "invalid") {
    return (
      <Panel>
        <Heading icon="alert" title="We couldn't find this checkout" />
        <Actions>
          <Button asChild className="h-11 rounded-full">
            <Link href="/account/bookings/">Go to my bookings</Link>
          </Button>
        </Actions>
      </Panel>
    );
  }

  if (view === "confirmed") {
    return (
      <Panel>
        <div className="flex flex-col items-center text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-700">
            <Check className="h-10 w-10" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-h2 font-bold text-ink">You&apos;re booked!</h1>
          {brief?.confirmation_code && (
            <p className="mt-2 text-ink-soft">
              Booking reference <span className="font-semibold text-ink">{brief.confirmation_code}</span>
            </p>
          )}
        </div>

        {brief === null && bookingId ? (
          <Skeleton className="mt-8 h-40 rounded-3xl" />
        ) : brief ? (
          <div className="mt-8 rounded-3xl border border-sand-100 bg-sand-50 p-5">
            <div className="flex gap-4">
              {brief.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brief.image_url} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
              )}
              <div className="min-w-0">
                <p className="font-display font-bold text-ink">{brief.title}</p>
                <ul className="mt-2 space-y-1 text-sm text-ink-soft">
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
                  {(brief.pickup || brief.meeting_point) && (
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {brief.pickup ?? brief.meeting_point}
                    </li>
                  )}
                  {brief.operator?.phone && (
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4" aria-hidden />
                      <a href={`tel:${brief.operator.phone.replace(/\s/g, "")}`} className="focus-ring rounded text-brand-700">
                        {brief.operator.name ? `${brief.operator.name} · ` : ""}
                        {brief.operator.phone}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <Actions>
          {bookingId && (
            <Button asChild className="h-11 rounded-full px-6">
              <Link href={`/account/bookings/detail/?id=${encodeURIComponent(bookingId)}`}>View booking</Link>
            </Button>
          )}
          {brief?.local_date && (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full px-6"
              onClick={() =>
                downloadIcs({
                  uid: bookingId ?? params?.checkoutId ?? "booking",
                  title: brief.title ?? "Gamana experience",
                  date: brief.local_date!,
                  time: brief.local_time,
                  durationMinutes: brief.duration_minutes,
                  location: brief.pickup ?? brief.meeting_point_address ?? brief.meeting_point,
                  description: brief.confirmation_code ? `Booking reference ${brief.confirmation_code}` : null,
                })
              }
            >
              <Calendar className="h-4 w-4" aria-hidden /> Add to calendar
            </Button>
          )}
        </Actions>

        <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-brand-200" aria-hidden />
            Your voucher and the story behind this place are in the Gamana app.
          </p>
          <Button type="button" onClick={() => setHandoff(true)} className="h-11 shrink-0 rounded-full bg-white px-6 text-ink hover:bg-sand-100">
            Open in the app
          </Button>
        </div>
        <AppHandoffSheet
          open={handoff}
          onOpenChange={setHandoff}
          source="booking-confirmed"
          title="Your booking is in the Gamana app"
          steps={["Open Gamana on your phone", "Go to My Collection → Bookings", "Show your voucher on the day"]}
          deepLink={`https://www.gamana.app/experiences/${encodeURIComponent(params?.slug ?? "")}`}
        />
      </Panel>
    );
  }

  if (view === "failed") {
    return (
      <Panel>
        <Heading icon="x" title="Payment didn't go through" />
        <p className="mt-2 text-center text-ink-soft">
          {state?.payment_failure?.user_message ?? "Your payment was declined. You haven't been charged."}
        </p>
        <RetryError message={retryError} />
        <Actions>
          {state?.can_retry_payment && (
            <Button type="button" onClick={retry} disabled={retrying} className="h-11 rounded-full px-6">
              {retrying && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Try payment again
            </Button>
          )}
          <Button asChild variant="outline" className="h-11 rounded-full px-6">
            <Link href={backHref}>Choose another time</Link>
          </Button>
        </Actions>
      </Panel>
    );
  }

  if (view === "cancelled") {
    return (
      <Panel>
        <Heading icon="alert" title="Payment cancelled" />
        <p className="mt-2 text-center text-ink-soft">You haven&apos;t been charged.</p>
        <RetryError message={retryError} />
        <Actions>
          <Button type="button" onClick={retry} disabled={retrying} className="h-11 rounded-full px-6">
            {retrying && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Return to payment
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6">
            <Link href={backHref}>Back to experience</Link>
          </Button>
        </Actions>
      </Panel>
    );
  }

  if (view === "pending") {
    return (
      <Panel>
        <Heading icon="clock" title="We're still confirming your booking" />
        <p className="mt-2 text-center text-ink-soft">
          We&apos;re still confirming with {operatorName ?? "the operator"}. We&apos;ll email you, and it will appear in Bookings.
        </p>
        <Actions>
          <Button asChild className="h-11 rounded-full px-6">
            <Link href="/account/bookings/">Go to my bookings</Link>
          </Button>
        </Actions>
      </Panel>
    );
  }

  return (
    <Panel>
      <Heading icon="alert" title="This checkout expired" />
      <p className="mt-2 text-center text-ink-soft">You haven&apos;t been charged. Choose a time again to book.</p>
      <Actions>
        <Button asChild className="h-11 rounded-full px-6">
          <Link href={backHref}>Back to experience</Link>
        </Button>
      </Actions>
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-site max-w-2xl py-12 lg:py-16">
      <div className="rounded-3xl bg-white p-6 shadow-card sm:p-10">{children}</div>
    </div>
  );
}

function Heading({ icon, title }: { icon: "alert" | "x" | "clock"; title: string }) {
  const Icon = icon === "x" ? X : icon === "clock" ? Clock : AlertCircle;
  return (
    <div className="flex flex-col items-center text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-sunset-100 text-sunset-600">
        <Icon className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-h3 text-ink">{title}</h1>
    </div>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>;
}

function RetryError({ message }: { message: string }) {
  return (
    <p aria-live="polite" className="mt-3 min-h-[1.25rem] text-center text-sm text-red-700">
      {message}
    </p>
  );
}
