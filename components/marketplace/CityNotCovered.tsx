'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPinOff, Check, ArrowRight } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/auth-context';

/**
 * Shown in place of an empty results grid when a search returns nothing.
 *
 * Searching a destination is the highest-intent action on this page — the visitor has
 * just named exactly what they want. Previously that landed on a blank grid with no path
 * forward, so the intent evaporated and we learned nothing. This captures it instead:
 * softens the dead end for the traveller, and accumulates a per-city demand list that
 * speaks directly to the open question of which destinations to build next.
 *
 * Deliberately lightweight rather than reusing the Cities page's full RequestPlace form
 * (map picker, Places autocomplete, audio-type checkboxes) — that form is a considered,
 * sit-down task, and dropping it into a search dead end would ask far too much of someone
 * who just typed a city name. Anyone who wants that depth gets a link to it.
 *
 * Requests are not persisted until a backend endpoint exists (browser storage is off-limits).
 */
export function CityNotCovered({ city, source }: { city: string; source: string }) {
  const { user } = useAuth();
  const accountEmail = user?.email || '';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Reset when the visitor searches a different city, so one capture doesn't leave the
  // confirmation state stuck across subsequent searches.
  useEffect(() => {
    setSubmitted(false);
    setEmail('');
  }, [city]);

  const effectiveEmail = email.trim() || accountEmail;
  // Deliberately loose — this is a "tell me when it's ready" field, not an auth flow, so
  // it only catches obvious typos rather than rejecting unusual but valid addresses.
  const emailLooksValid = !effectiveEmail || /^\S+@\S+\.\S+$/.test(effectiveEmail);

  const submit = () => {
    if (!emailLooksValid) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#159895]/30 bg-[#F0FBFA] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#159895]/15">
          <Check className="h-7 w-7 text-[#159895]" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Noted, {city} is on our list
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
          {effectiveEmail
            ? `We'll email ${effectiveEmail} the moment stories for ${city} go live.`
            : `Requests like yours decide which destinations we record next.`}
        </p>
        <div className="mt-5">
          <Link
            href="/cities"
            className="text-sm font-semibold text-[#159895] underline underline-offset-2 hover:text-[#128a86]"
          >
            Browse the cities we cover today
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
        <MapPinOff className="h-7 w-7 text-amber-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        No stories for {city} yet
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
        We&apos;re recording new destinations continuously, and traveller requests decide the
        order. Want us to tell you when {city} is ready?
      </p>

      <div className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row">
        {!accountEmail && (
          <Input
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && email.trim()) submit();
            }}
            className="h-11 flex-1"
          />
        )}
        <Button
          onClick={submit}
          disabled={!emailLooksValid}
          className="h-11 shrink-0 bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white hover:opacity-95"
        >
          Notify me about {city}
        </Button>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {!emailLooksValid
          ? 'That email doesn’t look right, check it, or clear it to request anyway.'
          : accountEmail
            // Signed-in visitors get told which address this will use, rather than having
            // it taken silently just because the input is hidden for them.
            ? `We’ll notify ${accountEmail}.`
            : 'Email is optional, the request still counts without it.'}
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:gap-6">
        <Link
          href="/cities"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#159895] hover:text-[#128a86]"
        >
          See the 50+ cities we cover
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/cities#request-place"
          className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
        >
          Request a specific place instead
        </Link>
      </div>
    </div>
  );
}
