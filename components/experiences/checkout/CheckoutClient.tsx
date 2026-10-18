"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/common/ErrorState";
import { AlertCircle, ArrowLeft, Calendar, Clock, Loader2, Lock, MapPin, Search, Users } from "@/components/icons";
import { FIELD_INPUT, FieldError, QuestionField } from "@/components/experiences/checkout/QuestionField";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth/auth-context";
import { getExperienceDetail, getOrderSummary } from "@/lib/experiences/api";
import {
  buildBookingAnswers,
  contactField,
  normalizeQuestionGroups,
  validateAnswers,
  visibleQuestions,
  type AnswerValue,
  type Answers,
  type QuestionGroups,
} from "@/lib/experiences/booking-questions";
import {
  checkoutErrorCode,
  checkoutFieldErrors,
  confirmCheckout,
  detailHrefFor,
  getBookingQuestions,
  getCheckoutOptions,
  getPickupPlaces,
  parseCheckoutQuery,
  readStoredCheckout,
  returnUrls,
  startCheckout,
  storeCheckout,
  type CheckoutOptions,
  type CheckoutSelection,
  type PickupPlace,
} from "@/lib/experiences/checkout";
import {
  cancellationText,
  coverImage,
  formatDateLabel,
  formatMoney,
  formatTimeLabel,
  guestLabel,
} from "@/lib/experiences/format";
import type { ExperienceDetail, OrderSummary } from "@/lib/api/schemas/experiences";
import { webAccountsEnabled } from "@/lib/flags";
import { cn } from "@/lib/utils";

const BLOCK = "rounded-3xl bg-white p-6 shadow-card sm:p-7";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Pickup =
  | { kind: "none" }
  | { kind: "meeting" }
  | { kind: "place"; placeId: string; label: string; room: string }
  | { kind: "custom"; text: string; room: string };

type Contact = { firstName: string; lastName: string; email: string; phone: string };

function pickupKey(p: Pickup | null): string {
  if (!p) return "";
  if (p.kind === "place") return `place:${p.placeId}:${p.room}`;
  if (p.kind === "custom") return `custom:${p.text}:${p.room}`;
  return p.kind;
}

function pickupLabel(p: Pickup | null): string | null {
  if (!p) return null;
  if (p.kind === "place") return p.room ? `${p.label}, room ${p.room}` : p.label;
  if (p.kind === "custom") return p.room ? `${p.text}, room ${p.room}` : p.text;
  if (p.kind === "meeting") return "Meeting point";
  return null;
}

function placeName(p: PickupPlace): string {
  return p.title ?? p.name ?? String(p.id);
}

export function CheckoutClient() {
  const router = useRouter();
  const { status, user } = useAuth();
  const [sel, setSel] = useState<CheckoutSelection | null | undefined>(undefined);
  const [experience, setExperience] = useState<ExperienceDetail | null>(null);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const [places, setPlaces] = useState<PickupPlace[]>([]);
  const [pickup, setPickup] = useState<Pickup | null>(null);

  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [options, setOptions] = useState<CheckoutOptions | null>(null);
  const [groups, setGroups] = useState<QuestionGroups>({ mainContact: [], perBooking: [], perPassenger: [] });
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const [contact, setContact] = useState<Contact>({ firstName: "", lastName: "", email: "", phone: "" });
  const [mainExtra, setMainExtra] = useState<Answers>({});
  const [perBooking, setPerBooking] = useState<Answers>({});
  const [passengerAnswers, setPassengerAnswers] = useState<Answers[]>([]);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [announce, setAnnounce] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const prefilled = useRef(false);
  const viewed = useRef(false);

  useEffect(() => {
    setSel(parseCheckoutQuery(window.location.search));
  }, []);

  useEffect(() => {
    if (!webAccountsEnabled || status !== "anonymous") return;
    const next = `${window.location.pathname}${window.location.search}`;
    router.replace(`/login/?next=${encodeURIComponent(next)}`);
  }, [status, router]);

  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    const phone = user.phone ? `${user.countryCode ? `${user.countryCode} ` : ""}${user.phone}`.trim() : "";
    setContact({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone });
  }, [user]);

  useEffect(() => {
    if (!sel || status !== "authenticated") return;
    let cancelled = false;
    setLoadError(false);
    Promise.all([
      getExperienceDetail(sel.slug),
      getOrderSummary(sel.slug, { local_date: sel.date, local_time: sel.time ?? undefined, guests: sel.guests }),
    ])
      .then(([exp, sum]) => {
        if (cancelled) return;
        setExperience(exp);
        setSummary(sum);
        const needsPickup = !!exp.pickup_required || !!exp.pickup_optional;
        if (needsPickup) {
          getPickupPlaces(sel.slug)
            .then((list) => !cancelled && setPlaces(list))
            .catch(() => !cancelled && setPlaces([]));
        } else {
          setPickup({ kind: "none" });
        }
        if (!viewed.current) {
          viewed.current = true;
          track("checkout_view", { experience: sel.slug });
        }
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [sel, status, attempt]);

  const travellers = useMemo(() => {
    if (!sel || !experience) return [];
    return sel.guests.flatMap((g) => {
      const type = experience.guest_types.find((t) => t.unit_id === g.unit_id);
      const label = guestLabel(type?.label);
      return Array.from({ length: g.quantity }, () => ({ unitId: g.unit_id, label }));
    });
  }, [sel, experience]);

  useEffect(() => {
    setPassengerAnswers((prev) => travellers.map((_, i) => prev[i] ?? {}));
  }, [travellers]);

  const committedKey = pickupKey(pickup);

  const begin = useCallback(
    async (forceNew = false) => {
      if (!sel || !experience || !pickup) return;
      setStarting(true);
      setStartError(null);
      setExpired(false);
      try {
        let id = forceNew ? null : readStoredCheckout(sel, committedKey);
        let opts: CheckoutOptions | null = null;
        if (id) {
          opts = await getCheckoutOptions(id, experience.currency).catch(() => null);
          if (!opts) id = null;
        }
        if (!id) {
          id = await startCheckout(sel.slug, {
            local_date: sel.date,
            local_time: sel.time ?? undefined,
            slot_id: sel.slot ?? undefined,
            guests: sel.guests,
            pickup_place_id: pickup.kind === "place" ? pickup.placeId : undefined,
            pickup_description: pickup.kind === "custom" ? pickup.text : undefined,
            pickup_room_number: pickup.kind === "place" || pickup.kind === "custom" ? pickup.room || undefined : undefined,
          });
          storeCheckout(sel, committedKey, id);
          opts = await getCheckoutOptions(id, experience.currency);
        }
        let parsed = normalizeQuestionGroups(opts?.booking_questions ?? {});
        if (!parsed.mainContact.length && !parsed.perBooking.length && !parsed.perPassenger.length) {
          parsed = normalizeQuestionGroups(await getBookingQuestions(sel.slug).catch(() => ({})));
        }
        setCheckoutId(id);
        setOptions(opts);
        setGroups(parsed);
      } catch (error) {
        if (checkoutErrorCode(error) === "checkout_expired") setExpired(true);
        else setStartError("We couldn't reserve this time. Please try again.");
      } finally {
        setStarting(false);
      }
    },
    [sel, experience, pickup, committedKey],
  );

  useEffect(() => {
    if (pickup) void begin();
  }, [pickup, begin]);

  const mainExtraQuestions = useMemo(() => groups.mainContact.filter((q) => !contactField(q.id)), [groups.mainContact]);
  const contactRequiresPhone = groups.mainContact.some((q) => contactField(q.id) === "phone" && q.required);

  const needsPickup = !!experience && (!!experience.pickup_required || !!experience.pickup_optional);
  const hasTravellerQuestions = groups.perPassenger.length > 0 && travellers.length > 0;
  const hasBookingQuestions = visibleQuestions(groups.perBooking, perBooking).length > 0;
  const steps = [
    needsPickup ? "pickup" : null,
    "lead",
    hasTravellerQuestions ? "travellers" : null,
    hasBookingQuestions ? "questions" : null,
    "pay",
  ].filter((s): s is string => !!s);
  const stepLabel = (key: string) => `Step ${steps.indexOf(key) + 1} of ${steps.length}`;

  const mainContactAnswers = (): Answers => {
    const merged: Answers = { ...mainExtra };
    for (const q of groups.mainContact) {
      const field = contactField(q.id);
      if (field) merged[q.id] = contact[field];
    }
    return merged;
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!contact.firstName.trim()) next["contact-firstName"] = "Please enter a first name.";
    if (!contact.lastName.trim() && groups.mainContact.some((q) => contactField(q.id) === "lastName" && q.required)) {
      next["contact-lastName"] = "Please enter a last name.";
    }
    if (!EMAIL.test(contact.email.trim())) next["contact-email"] = "Enter a valid email address.";
    if (contactRequiresPhone && !/^\+?[0-9 ()-]{6,20}$/.test(contact.phone.trim())) next["contact-phone"] = "Enter a valid phone number.";
    for (const [id, msg] of Object.entries(validateAnswers(mainExtraQuestions, mainExtra))) next[`main-${id}`] = msg;
    for (const [id, msg] of Object.entries(validateAnswers(groups.perBooking, perBooking))) next[`booking-${id}`] = msg;
    passengerAnswers.forEach((answers, i) => {
      for (const [id, msg] of Object.entries(validateAnswers(groups.perPassenger, answers))) next[`p${i}-${id}`] = msg;
    });
    if (!agree) next["agree"] = "Please accept the booking terms to continue.";
    return next;
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const find = (key: string) => document.getElementById(key) ?? document.querySelector<HTMLElement>(`[name="${key}"]`);
    window.requestAnimationFrame(() => {
      for (const key of Object.keys(errs)) {
        const details = find(key)?.closest("details");
        if (details) details.open = true;
      }
      const el = find(first);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  };

  const pay = async () => {
    if (!sel || !experience || !checkoutId || !options) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      const n = Object.keys(errs).length;
      setAnnounce(`Please fix ${n} ${n === 1 ? "field" : "fields"} before continuing.`);
      focusFirstError(errs);
      return;
    }
    setAnnounce("");
    setSubmitError(null);
    setSubmitting(true);
    track("checkout_step_complete", { step: "details" });
    track("checkout_pay_click", { experience: sel.slug, currency: options.currency ?? experience.currency ?? undefined });
    try {
      const redirect = await confirmCheckout(checkoutId, {
        preferred_payment: options.preferred_payment ?? undefined,
        currency: options.currency ?? experience.currency ?? undefined,
        contact_name: `${contact.firstName} ${contact.lastName}`.trim(),
        contact_email: contact.email.trim(),
        contact_phone: contact.phone.trim() || undefined,
        booking_answers: buildBookingAnswers({
          groups,
          bookingId: options.booking_id,
          mainContact: mainContactAnswers(),
          perBooking,
          passengers: travellers.map((t, i) => ({ unitId: t.unitId, answers: passengerAnswers[i] ?? {} })),
        }),
        ...returnUrls(checkoutId, sel.slug),
      });
      window.location.assign(redirect);
    } catch (error) {
      setSubmitting(false);
      const code = checkoutErrorCode(error);
      if (code === "checkout_expired") {
        setExpired(true);
        return;
      }
      const fieldMap: Record<string, string> = {
        contact_email: "contact-email",
        contact_name: "contact-firstName",
        contact_phone: "contact-phone",
      };
      const apiErrors = Object.fromEntries(
        Object.entries(checkoutFieldErrors(error)).map(([k, v]) => [fieldMap[k] ?? `booking-${k}`, v]),
      );
      if (Object.keys(apiErrors).length) {
        setErrors(apiErrors);
        setAnnounce("Please check the highlighted fields.");
        focusFirstError(apiErrors);
      } else {
        setSubmitError("We couldn't start the payment. Your details are saved — please try again.");
      }
    }
  };

  if (!webAccountsEnabled) {
    return (
      <div className="container-site py-16">
        <ErrorState title="Booking on the website is coming soon" hint="Book this experience in the Gamana app." />
      </div>
    );
  }

  if (sel === null) {
    return (
      <div className="container-site py-16">
        <ErrorState
          title="This checkout link is incomplete"
          hint="Choose a date and time on the experience page to book."
        />
        <div className="mt-6 text-center">
          <Link href="/experiences/" className="focus-ring rounded font-semibold text-brand-700">
            Browse experiences
          </Link>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || sel === undefined || (!experience && !loadError)) {
    return (
      <div className="container-site grid gap-8 py-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (loadError || !experience) {
    return (
      <div className="container-site py-16">
        <ErrorState title="Couldn't load this booking" onRetry={() => setAttempt((n) => n + 1)} />
      </div>
    );
  }

  const ready = !!checkoutId && !!options && !starting;
  const currency = summary?.pricing.currency ?? experience.currency;
  const operator = experience.operator_name ?? "the operator";
  const detailHref = detailHrefFor(sel);
  const cancellation = cancellationText(experience);

  return (
    <div className="container-site py-8 lg:py-12">
      <Link
        href={detailHref}
        className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to experience
      </Link>
      <h1 className="mt-2 font-display text-h2 font-bold text-ink">Complete your booking</h1>

      {expired && (
        <div role="alert" className="mt-6 flex flex-col gap-3 rounded-3xl bg-sunset-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-ink">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-sunset-600" aria-hidden />
            Your selection timed out. Choose a time again.
          </p>
          <Button asChild variant="outline" className="h-11 rounded-full">
            <Link href={detailHref}>Choose a time</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
        <aside className="lg:order-2" aria-label="Order summary">
          <div className={cn(BLOCK, "lg:sticky lg:top-28")}>
            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage(experience)} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0">
                <p className="line-clamp-2 font-display font-bold text-ink">{experience.title}</p>
                {experience.city && <p className="mt-1 text-sm text-ink-soft">{experience.city}</p>}
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-ink">
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-700" aria-hidden /> {formatDateLabel(sel.date)}
              </li>
              {sel.time && (
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-700" aria-hidden /> {formatTimeLabel(sel.time)}
                </li>
              )}
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-700" aria-hidden />
                {summary?.pricing.line_items.map((l) => `${l.quantity} ${guestLabel(l.label)}`).join(", ") ??
                  `${travellers.length} travellers`}
              </li>
              {pickupLabel(pickup) && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-700" aria-hidden /> {pickupLabel(pickup)}
                </li>
              )}
            </ul>
            {summary && (
              <div className="mt-5 border-t border-sand-100 pt-4">
                <ul className="space-y-1.5 text-sm text-ink-soft">
                  {summary.pricing.line_items.map((l) => (
                    <li key={l.unit_id} className="flex justify-between gap-3">
                      <span>
                        {l.quantity} × {guestLabel(l.label)}
                      </span>
                      <span>{formatMoney(l.total ?? (l.unit_price ?? 0) * l.quantity, l.currency ?? currency)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex items-baseline justify-between border-t border-sand-100 pt-3">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="font-display text-2xl font-bold text-ink">{formatMoney(summary.pricing.total, currency)}</span>
                </p>
                {summary.pricing.all_taxes_and_fees_included && <p className="mt-1 text-xs text-ink-muted">Taxes and fees included.</p>}
              </div>
            )}
            {cancellation && <p className="mt-4 text-sm text-ink-soft">{cancellation}</p>}
            <p className="mt-3 text-sm font-medium text-ink">You pay {operator} · Refunds by operator</p>
          </div>
        </aside>

        <div className="space-y-5 lg:order-1">
          {needsPickup && (
            <PickupStep
              label={stepLabel("pickup")}
              places={places}
              optional={!experience.pickup_required}
              customAllowed={experience.custom_pickup_allowed !== false}
              meetingPoint={experience.meeting_point_text ?? experience.meeting_point_address ?? null}
              committed={pickup}
              onCommit={(p) => {
                setPickup(p);
                track("checkout_step_complete", { step: "pickup" });
              }}
            />
          )}

          {pickup && starting && (
            <p className="flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Holding your spot…
            </p>
          )}
          {startError && <ErrorState compact title={startError} onRetry={() => void begin(true)} />}

          <section className={cn(BLOCK, !ready && "opacity-60")} aria-labelledby="step-lead">
            <p className="eyebrow">{stepLabel("lead")}</p>
            <h2 id="step-lead" className="text-h3 mt-1 text-ink">
              Lead traveller
            </h2>
            <p className="mt-1 text-sm text-ink-soft">Your booking confirmation will be sent here.</p>
            <fieldset disabled={!ready} className="mt-5 grid gap-4 sm:grid-cols-2">
              <ContactInput id="contact-firstName" label="First name" required autoComplete="given-name" value={contact.firstName} error={errors["contact-firstName"]} onChange={(v) => setContact((c) => ({ ...c, firstName: v }))} />
              <ContactInput id="contact-lastName" label="Last name" autoComplete="family-name" value={contact.lastName} error={errors["contact-lastName"]} onChange={(v) => setContact((c) => ({ ...c, lastName: v }))} />
              <ContactInput id="contact-email" label="Email" type="email" required autoComplete="email" value={contact.email} error={errors["contact-email"]} onChange={(v) => setContact((c) => ({ ...c, email: v }))} />
              <ContactInput id="contact-phone" label="Phone" type="tel" required={contactRequiresPhone} autoComplete="tel" value={contact.phone} error={errors["contact-phone"]} onChange={(v) => setContact((c) => ({ ...c, phone: v }))} />
              {visibleQuestions(mainExtraQuestions, mainExtra).map((q) => (
                <div key={q.id} className="sm:col-span-2">
                  <QuestionField
                    question={q}
                    idPrefix="main"
                    value={mainExtra[q.id]}
                    error={errors[`main-${q.id}`]}
                    onChange={(v) => setMainExtra((a) => ({ ...a, [q.id]: v }))}
                  />
                </div>
              ))}
            </fieldset>
          </section>

          {hasTravellerQuestions && (
            <section className={cn(BLOCK, !ready && "opacity-60")} aria-labelledby="step-travellers">
              <p className="eyebrow">{stepLabel("travellers")}</p>
              <h2 id="step-travellers" className="text-h3 mt-1 text-ink">
                Travellers
              </h2>
              <fieldset disabled={!ready} className="mt-4 space-y-3">
                {travellers.map((t, i) => (
                  <details key={i} open={i === 0} className="group rounded-2xl border border-sand-200 p-4 open:bg-sand-50/50">
                    <summary className="focus-ring flex min-h-[44px] cursor-pointer list-none items-center justify-between rounded font-semibold text-ink">
                      Traveller {i + 1} — {t.label}
                      {Object.keys(errors).some((k) => k.startsWith(`p${i}-`)) && (
                        <span className="text-sm font-normal text-red-700">Needs attention</span>
                      )}
                    </summary>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      {visibleQuestions(groups.perPassenger, passengerAnswers[i] ?? {}).map((q) => (
                        <div key={q.id} className={cn(q.kind === "textarea" && "sm:col-span-2")}>
                          <QuestionField
                            question={q}
                            idPrefix={`p${i}`}
                            value={passengerAnswers[i]?.[q.id]}
                            error={errors[`p${i}-${q.id}`]}
                            onChange={(v: AnswerValue) =>
                              setPassengerAnswers((all) => all.map((a, j) => (j === i ? { ...a, [q.id]: v } : a)))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </fieldset>
            </section>
          )}

          {hasBookingQuestions && (
            <section className={cn(BLOCK, !ready && "opacity-60")} aria-labelledby="step-questions">
              <p className="eyebrow">{stepLabel("questions")}</p>
              <h2 id="step-questions" className="text-h3 mt-1 text-ink">
                Booking questions
              </h2>
              <fieldset disabled={!ready} className="mt-5 space-y-5">
                {visibleQuestions(groups.perBooking, perBooking).map((q) => (
                  <QuestionField
                    key={q.id}
                    question={q}
                    idPrefix="booking"
                    value={perBooking[q.id]}
                    error={errors[`booking-${q.id}`]}
                    onChange={(v) => setPerBooking((a) => ({ ...a, [q.id]: v }))}
                  />
                ))}
              </fieldset>
            </section>
          )}

          <section className={cn(BLOCK, !ready && "opacity-60")} aria-labelledby="step-pay">
            <p className="eyebrow">{stepLabel("pay")}</p>
            <h2 id="step-pay" className="text-h3 mt-1 text-ink">
              Review &amp; pay
            </h2>
            <div className="mt-4 space-y-1">
              <label htmlFor="agree" className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm text-ink">
                <Checkbox
                  id="agree"
                  checked={agree}
                  disabled={!ready}
                  onCheckedChange={(c) => setAgree(c === true)}
                  aria-invalid={Boolean(errors.agree) || undefined}
                  aria-describedby={errors.agree ? "agree-error" : undefined}
                  className="mt-0.5"
                />
                <span>
                  I agree to {operator}&apos;s booking terms and Gamana&apos;s{" "}
                  <Link href="/terms-of-service/" target="_blank" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
                    Terms
                  </Link>
                  .
                </span>
              </label>
              <FieldError id="agree-error" error={errors.agree} />
            </div>
            <p aria-live="assertive" className="mt-3 min-h-[1.25rem] text-sm font-medium text-red-700">
              {announce}
            </p>
            {submitError && <ErrorState compact className="mt-2" title={submitError} />}
            <Button
              type="button"
              onClick={pay}
              disabled={!ready || submitting}
              className="mt-3 h-12 w-full rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 text-base font-semibold text-white hover:from-sunset-500 hover:to-sunset-600"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
              Continue to secure payment
            </Button>
            <p className="mt-3 text-center text-xs text-ink-muted">
              You&apos;ll pay {operator} on a secure payment page. Coins aren&apos;t used for experiences.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function ContactInput({
  id,
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? <span aria-hidden> *</span> : <span className="font-normal text-ink-muted"> (optional)</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_INPUT}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

function PickupStep({
  label,
  places,
  optional,
  customAllowed,
  meetingPoint,
  committed,
  onCommit,
}: {
  label: string;
  places: PickupPlace[];
  optional: boolean;
  customAllowed: boolean;
  meetingPoint: string | null;
  committed: Pickup | null;
  onCommit: (p: Pickup) => void;
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"place" | "custom" | "meeting">(committed?.kind === "custom" ? "custom" : committed?.kind === "meeting" ? "meeting" : "place");
  const [placeId, setPlaceId] = useState(committed?.kind === "place" ? committed.placeId : "");
  const [customText, setCustomText] = useState(committed?.kind === "custom" ? committed.text : "");
  const [room, setRoom] = useState(committed && "room" in committed ? committed.room : "");
  const [error, setError] = useState("");

  const filtered = places.filter((p) => `${placeName(p)} ${p.address ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));

  const commit = () => {
    if (mode === "meeting") return onCommit({ kind: "meeting" });
    if (mode === "custom") {
      if (!customText.trim()) return setError("Enter your hotel or pickup address.");
      setError("");
      return onCommit({ kind: "custom", text: customText.trim().slice(0, 500), room: room.trim() });
    }
    const place = places.find((p) => String(p.id) === placeId);
    if (!place) return setError("Choose your hotel from the list.");
    setError("");
    onCommit({ kind: "place", placeId: String(place.id), label: placeName(place), room: room.trim() });
  };

  return (
    <section className={BLOCK} aria-labelledby="step-pickup">
      <p className="eyebrow">{label}</p>
      <h2 id="step-pickup" className="text-h3 mt-1 text-ink">
        Pickup
      </h2>
      <div role="radiogroup" aria-label="Pickup option" className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["place", "Choose my hotel"],
            ...(customAllowed ? [["custom", "I don't see my hotel"]] : []),
            ...(optional ? [["meeting", "I'll go to the meeting point"]] : []),
          ] as [typeof mode, string][]
        ).map(([value, text]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            onClick={() => setMode(value)}
            className={cn(
              "focus-ring min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors",
              mode === value ? "border-brand-700 bg-brand-50 text-brand-800" : "border-sand-200 bg-white text-ink hover:border-brand-300",
            )}
          >
            {text}
          </button>
        ))}
      </div>

      {mode === "place" && (
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hotels"
              aria-label="Search pickup places"
              className={cn(FIELD_INPUT, "pl-9")}
            />
          </div>
          <div role="radiogroup" aria-label="Pickup places" className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {places.length === 0 ? (
              <p className="text-sm text-ink-soft">Loading pickup places…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-ink-soft">No matches. Try another name{customAllowed ? " or choose “I don't see my hotel”" : ""}.</p>
            ) : (
              filtered.map((p) => {
                const checked = placeId === String(p.id);
                return (
                  <button
                    key={String(p.id)}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setPlaceId(String(p.id))}
                    className={cn(
                      "focus-ring flex min-h-[44px] w-full flex-col rounded-2xl border px-4 py-2.5 text-left transition-colors",
                      checked ? "border-brand-700 bg-brand-50" : "border-sand-200 hover:border-brand-300",
                    )}
                  >
                    <span className="text-sm font-semibold text-ink">{placeName(p)}</span>
                    {p.address && <span className="text-xs text-ink-soft">{p.address}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {mode === "custom" && (
        <div className="mt-4 space-y-1.5">
          <Label htmlFor="pickup-custom" className="text-sm font-medium text-ink">
            Hotel name and address *
          </Label>
          <Textarea id="pickup-custom" value={customText} maxLength={500} rows={3} onChange={(e) => setCustomText(e.target.value)} className="rounded-xl" />
        </div>
      )}

      {mode === "meeting" && meetingPoint && (
        <p className="mt-4 flex items-start gap-2 text-sm text-ink-soft">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden /> {meetingPoint}
        </p>
      )}

      {mode !== "meeting" && (
        <div className="mt-4 max-w-xs space-y-1.5">
          <Label htmlFor="pickup-room" className="text-sm font-medium text-ink">
            Room number <span className="font-normal text-ink-muted">(optional)</span>
          </Label>
          <Input id="pickup-room" value={room} onChange={(e) => setRoom(e.target.value)} className={FIELD_INPUT} />
        </div>
      )}

      <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-sm text-red-700">
        {error}
      </p>
      <Button type="button" onClick={commit} className="mt-1 h-11 rounded-full px-6">
        {committed && committed.kind !== "none" ? "Update pickup" : "Continue"}
      </Button>
    </section>
  );
}
