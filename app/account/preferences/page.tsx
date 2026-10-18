"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, Loader2, Plus, X } from "@/components/icons";
import { ErrorState } from "@/components/common/ErrorState";
import { PersonalizationEditor } from "@/components/account/PersonalizationEditor";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api/client";
import {
  fetchPersonalization,
  mergeNarrators,
  narratorLanguages,
  narratorVoice,
  patchPersonalization,
  travelProfileToJourney,
  journeyToTravelProfile,
  type PersonalizationDoc,
} from "@/lib/account/personalization";
import { languageLabel } from "@/lib/experiences/format";
import { useJourney } from "@/lib/journey-context";
import { cn } from "@/lib/utils";

type Language = { code: string; label: string };
type Persona = { id: string; name: string; description?: string; image?: string };

const MAX_LANGUAGES = 3;

function pickArray(value: unknown, keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (value && typeof value === "object") {
    for (const key of keys) {
      const inner = (value as Record<string, unknown>)[key];
      if (Array.isArray(inner)) return inner as Record<string, unknown>[];
    }
  }
  return [];
}

function toLanguages(raw: unknown): Language[] {
  return pickArray(raw, ["languages", "items", "narrator_languages"])
    .map((l) => {
      const code = String(l.code ?? l.id ?? l.value ?? "");
      return { code, label: String(l.label ?? l.name ?? (code ? languageLabel(code) : "")) };
    })
    .filter((l) => l.code);
}

function toPersonas(raw: unknown): Persona[] {
  return pickArray(raw, ["items", "personas", "voice_personas"])
    .map((p) => ({
      id: String(p.id ?? p._id ?? p.persona_id ?? ""),
      name: String(p.name ?? p.display_name ?? "Narrator"),
      description: (p.description ?? p.tagline ?? p.style) as string | undefined,
      image: (p.persona_image_blob_url ?? p.image_url ?? p.image ?? p.avatar_url) as string | undefined,
    }))
    .filter((p) => p.id);
}

const SECTION = "rounded-3xl bg-white p-6 shadow-card sm:p-8";

function NarratorSection({ doc, onSaved }: { doc: PersonalizationDoc; onSaved: (doc: PersonalizationDoc) => void }) {
  const [catalog, setCatalog] = useState<Language[]>([]);
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [codes, setCodes] = useState<string[]>(() => narratorLanguages(doc));
  const voice = narratorVoice(doc);
  const [voiceId, setVoiceId] = useState<string | null>(voice.value);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/personalization/catalog", { auth: "optional" })
      .then((raw) => setCatalog(toLanguages(raw)))
      .catch(() => setCatalog([]));
    apiFetch("/voice-personas/mobile/active", { auth: "optional" })
      .then((raw) => setPersonas(toPersonas(raw)))
      .catch(() => setPersonas([]));
  }, []);

  const labelFor = (code: string) => catalog.find((l) => l.code === code)?.label ?? languageLabel(code);
  const dirty =
    JSON.stringify(codes) !== JSON.stringify(narratorLanguages(doc)) || voiceId !== narratorVoice(doc).value;

  async function save() {
    setSaving(true);
    try {
      const narrators = mergeNarrators(doc.narrators, { languages: { codes }, [voice.key]: voiceId });
      const updated = await patchPersonalization({ narrators });
      onSaved({ ...doc, ...(updated ?? {}), narrators });
      toast({ title: "Language and narrator saved" });
    } catch {
      toast({ title: "Couldn't save. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={SECTION} aria-labelledby="pref-narrator">
      <h2 id="pref-narrator" className="font-display text-h3 font-bold text-ink">
        Language &amp; narrator
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Stories play in these languages, in order. The first is your main language.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {codes.map((code, i) => (
          <span key={code} className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-brand-50 pl-4 pr-1 text-sm font-semibold text-brand-800">
            {labelFor(code)}
            {i === 0 && <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-700">Primary</span>}
            <button
              type="button"
              aria-label={`Remove ${labelFor(code)}`}
              onClick={() => setCodes((prev) => prev.filter((c) => c !== code))}
              className="focus-ring grid h-9 w-9 place-items-center rounded-full hover:bg-brand-100"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </span>
        ))}
        {codes.length < MAX_LANGUAGES && (
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="focus-ring inline-flex min-h-[44px] items-center gap-1 rounded-full border border-dashed border-sand-200 px-4 text-sm font-semibold text-ink-soft hover:text-ink"
              >
                <Plus className="h-4 w-4" aria-hidden /> Add language
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-0">
              <Command>
                <CommandInput placeholder="Search languages" />
                <CommandList className="max-h-64">
                  <CommandEmpty>No language found.</CommandEmpty>
                  {catalog
                    .filter((l) => !codes.includes(l.code))
                    .map((l) => (
                      <CommandItem
                        key={l.code}
                        value={`${l.label} ${l.code}`}
                        className="min-h-[44px]"
                        onSelect={() => {
                          setCodes((prev) => [...prev, l.code].slice(0, MAX_LANGUAGES));
                          setPickerOpen(false);
                        }}
                      >
                        {l.label}
                      </CommandItem>
                    ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <h3 className="mt-8 font-semibold text-ink">Narrator voice</h3>
      {personas === null ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : personas.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">Narrator voices aren&apos;t available right now.</p>
      ) : (
        <div role="radiogroup" aria-label="Narrator voice" className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {personas.map((p) => {
            const selected = voiceId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setVoiceId(selected ? null : p.id)}
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors",
                  selected ? "border-brand-600 bg-brand-50" : "border-sand-200 hover:border-brand-300",
                )}
              >
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sand-100 font-display font-bold text-ink">
                    {p.name[0]}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{p.name}</span>
                  {p.description && <span className="block truncate text-xs text-ink-soft">{p.description}</span>}
                </span>
                {selected && <Check className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        onClick={() => void save()}
        disabled={!dirty || saving || codes.length === 0}
        className="focus-ring mt-6 h-11 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 px-6 font-semibold text-white"
      >
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
        Save language &amp; narrator
      </Button>
      {codes.length === 0 && <p className="mt-2 text-sm text-ink-soft">Choose at least one language.</p>}
    </section>
  );
}

const NOTIFICATION_ROWS = [
  { key: "push", label: "Push notifications", hint: "Story reminders and booking updates on your phone" },
  { key: "email", label: "Email", hint: "Booking confirmations and occasional travel ideas" },
  { key: "sms", label: "SMS", hint: "Important booking updates by text" },
] as const;

function NotificationsSection({ doc, onSaved }: { doc: PersonalizationDoc; onSaved: (doc: PersonalizationDoc) => void }) {
  const [values, setValues] = useState({ push: true, email: true, sms: false, ...(doc.notifications ?? {}) });
  const [pending, setPending] = useState<string | null>(null);

  async function toggle(key: "push" | "email" | "sms", on: boolean) {
    const previous = values;
    const next = { ...values, [key]: on };
    setValues(next);
    setPending(key);
    try {
      await patchPersonalization({ notifications: next });
      onSaved({ ...doc, notifications: next });
    } catch {
      setValues(previous);
      toast({ title: "Couldn't update notifications", variant: "destructive" });
    } finally {
      setPending(null);
    }
  }

  return (
    <section className={SECTION} aria-labelledby="pref-notifications">
      <h2 id="pref-notifications" className="font-display text-h3 font-bold text-ink">
        Notifications
      </h2>
      <ul className="mt-4 divide-y divide-sand-200">
        {NOTIFICATION_ROWS.map((row) => (
          <li key={row.key} className="flex min-h-[64px] items-center justify-between gap-4 py-3">
            <div>
              <Label htmlFor={`notif-${row.key}`} className="text-base font-semibold text-ink">
                {row.label}
              </Label>
              <p className="text-sm text-ink-soft">{row.hint}</p>
            </div>
            <Switch
              id={`notif-${row.key}`}
              checked={Boolean(values[row.key])}
              disabled={pending === row.key}
              onCheckedChange={(on) => void toggle(row.key, on)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PreferencesPage() {
  const { updateJourney } = useJourney();
  const [doc, setDoc] = useState<PersonalizationDoc | null>(null);
  const [error, setError] = useState(false);

  const load = useMemo(
    () => () => {
      setError(false);
      fetchPersonalization()
        .then((d) => {
          setDoc(d);
          const journey = travelProfileToJourney(d.travel_profile);
          if (journey) updateJourney(journey);
        })
        .catch(() => setError(true));
    },
    [updateJourney],
  );

  useEffect(() => load(), [load]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-h2 font-bold text-ink">Preferences</h1>
      {error ? (
        <ErrorState title="Couldn't load your preferences" onRetry={load} />
      ) : !doc ? (
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      ) : (
        <>
          <NarratorSection doc={doc} onSaved={setDoc} />
          <section className={SECTION} aria-labelledby="pref-travel">
            <h2 id="pref-travel" className="font-display text-h3 font-bold text-ink">
              Travel personalization
            </h2>
            <p className="mb-5 mt-1 text-sm text-ink-soft">The same answers the Gamana app uses to shape your recommendations.</p>
            <PersonalizationEditor
              onSave={async (journey) => {
                const travel_profile = journeyToTravelProfile(journey);
                await patchPersonalization({ travel_profile });
                setDoc((d) => (d ? { ...d, travel_profile } : d));
                toast({ title: "Travel preferences saved" });
              }}
            />
          </section>
          <NotificationsSection doc={doc} onSaved={setDoc} />
        </>
      )}
    </div>
  );
}
