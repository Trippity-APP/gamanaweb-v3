"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Smartphone } from "@/components/icons";
import { ErrorState } from "@/components/common/ErrorState";
import { apiFetch } from "@/lib/api/client";
import { fetchPersonalization, travelProfileHomeCity } from "@/lib/account/personalization";
import { DIAL_CODES } from "@/lib/auth/dial-codes";
import { useAuth } from "@/lib/auth/auth-context";

type SosNumber = { label: string; number: string };

function toNumbers(raw: unknown): SosNumber[] {
  const record = (raw ?? {}) as Record<string, unknown>;
  const list = Array.isArray(raw) ? raw : (record.services ?? record.numbers ?? record.items ?? record.contacts ?? []);
  if (Array.isArray(list)) {
    return list
      .map((n: Record<string, unknown>) => ({
        label: String(n.label ?? n.name ?? n.type ?? "Emergency"),
        number: String(n.number ?? n.phone ?? n.value ?? ""),
      }))
      .filter((n) => n.number);
  }
  // `{ police: "100", ambulance: "108" }`
  return Object.entries(record)
    .filter(([, v]) => typeof v === "string" || typeof v === "number")
    .map(([k, v]) => ({ label: k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()), number: String(v) }));
}

const COUNTRIES = Array.from(new Map(DIAL_CODES.map((d) => [d.iso, d])).values()).sort((a, b) => a.name.localeCompare(b.name));

function countryFromCity(city: string | undefined): string | null {
  if (!city) return null;
  const lower = city.toLowerCase();
  return COUNTRIES.find((c) => lower.endsWith(c.name.toLowerCase()))?.iso ?? null;
}

export default function SafetyPage() {
  const { user } = useAuth();
  const [country, setCountry] = useState<string>("");
  const [numbers, setNumbers] = useState<SosNumber[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const fromPhone = DIAL_CODES.find((d) => d.code === user?.countryCode)?.iso;
    fetchPersonalization()
      .then((doc) => {
        const tp = doc.travel_profile ?? {};
        setCountry(countryFromCity(travelProfileHomeCity(tp) ?? (tp.home_location as string)) ?? fromPhone ?? "IN");
      })
      .catch(() => setCountry(fromPhone ?? "IN"));
  }, [user?.countryCode]);

  useEffect(() => {
    if (!country) return;
    let cancelled = false;
    setNumbers(null);
    setError(false);
    apiFetch(`/sos/country/${country}`, { auth: "optional" })
      .then((raw) => !cancelled && setNumbers(toNumbers(raw)))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [country, attempt]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-h2 font-bold text-ink">Safety</h1>
      <section className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <div className="max-w-sm space-y-2">
          <Label htmlFor="sos-country">Emergency numbers for</Label>
          <select
            id="sos-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="focus-ring flex h-12 w-full rounded-xl border border-sand-200 bg-white px-3 text-base"
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6" aria-live="polite">
          {error ? (
            <ErrorState compact title="Couldn't load emergency numbers." onRetry={() => setAttempt((n) => n + 1)} />
          ) : numbers === null ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : numbers.length === 0 ? (
            <p className="text-sm text-ink-soft">We don&apos;t have emergency numbers for this country yet. Dial 112 from most mobile phones.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {numbers.map((n) => (
                <li key={`${n.label}-${n.number}`}>
                  <a
                    href={`tel:${n.number.replace(/[^\d+]/g, "")}`}
                    className="focus-ring flex min-h-[64px] items-center gap-3 rounded-2xl border border-sand-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunset-100 text-sunset-700">
                      <Phone className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink-soft">{n.label}</span>
                      <span className="block font-display text-xl font-bold text-ink">{n.number}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Smartphone className="h-4 w-4" aria-hidden />
        Live location sharing and family tracking are in the Gamana app.
      </p>
    </div>
  );
}
