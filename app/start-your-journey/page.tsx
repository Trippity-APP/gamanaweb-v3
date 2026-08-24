"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { useAccount } from "@/lib/account-context";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Plus,
  X,
  Mail,
  Lock,
  LogIn,
  Calendar as CalendarIcon,
  User,
} from "lucide-react";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { OptionCard } from "@/components/personalization/OptionCard";
import { Chip } from "@/components/personalization/Chip";
import {
  type Corridor,
  type Depth,
  type TravelerProfile,
  blankProfile,
  corridorOptions,
  groupTypeOptions,
  interestCategoryOptions,
  subInterestOptions,
  depthOptions,
  depthLabels,
  walkingToleranceOptions,
  dietaryOptions,
} from "@/lib/personalization";

type AuthMethod = "google" | "apple" | "email" | null;

interface Answers {
  homeLocation: string;
  corridor: Corridor;
  groupType: string | null;
  travelingWithKidsOrElders: boolean;
  travelWindows: (DateRange | undefined)[];
  travelerProfiles: TravelerProfile[];
  depth: Depth;
  walkingTolerance: string | null;
  heatSensitive: boolean;
  additionalNotes: string;
  fullName: string;
  email: string;
  authMethod: AuthMethod;
}

const initialAnswers: Answers = {
  homeLocation: "",
  corridor: null,
  groupType: null,
  travelingWithKidsOrElders: false,
  travelWindows: [undefined],
  travelerProfiles: [blankProfile()],
  depth: null,
  walkingTolerance: null,
  heatSensitive: false,
  additionalNotes: "",
  fullName: "",
  email: "",
  authMethod: null,
};

// Narrator specialties, used to nominate a guide based on what the group told us they're
// into — rather than asking people to pick blind from six names they've never heard of.
const narrators = [
  { name: "Lewis", role: "Analytic Historian", image: "/narrator1.png", specialties: ["heritage", "art"] },
  { name: "Bella", role: "Human-Centered Historian", image: "/narrator2.png", specialties: ["food", "culture"] },
  { name: "Aria", role: "Renaissance Expert", image: "/narrator3.png", specialties: ["art", "culture"] },
  { name: "Arjun", role: "Systems Historian", image: "/narrator4.png", specialties: ["heritage", "offbeat"] },
  { name: "Aarti", role: "Indic Historian", image: "/narrator6.png", specialties: ["spiritual", "heritage"] },
  { name: "Neerja", role: "Punchy Comedian", image: "/narrator7.png", specialties: ["offbeat", "sports"] },
];

// Step indices
const STEP_WELCOME = 0;
const STEP_HOME = 1;
const STEP_GROUP = 2;
const STEP_TIMING = 3;
const STEP_TRAVELERS = 4;
const STEP_DEPTH = 5;
const STEP_PACE = 6;
const STEP_NARRATOR = 7;
const STEP_PRACTICALITIES = 8;
const STEP_ACCOUNT = 9;
const STEP_CONFIRMATION = 10;
const TOTAL_STEPS = STEP_CONFIRMATION;

function StepShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-sm font-semibold text-[#159895] uppercase tracking-wider mb-2">{eyebrow}</p>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function StartYourJourneyPage() {
  const { login, updateJourney } = useAccount();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [saveBanner, setSaveBanner] = useState({
    dismissed: false,
    saved: false,
    email: "",
    password: "",
    mode: "new" as "new" | "existing",
  });

  const update = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // --- Travel windows (multiple specific date ranges, all optional) ---
  const updateWindow = (index: number, value: DateRange | undefined) => {
    setAnswers((prev) => {
      const next = [...prev.travelWindows];
      next[index] = value;
      return { ...prev, travelWindows: next };
    });
  };
  const addWindow = () => {
    setAnswers((prev) =>
      prev.travelWindows.length >= 5 ? prev : { ...prev, travelWindows: [...prev.travelWindows, undefined] }
    );
  };
  const removeWindow = (index: number) => {
    setAnswers((prev) => ({
      ...prev,
      travelWindows: prev.travelWindows.length <= 1 ? prev.travelWindows : prev.travelWindows.filter((_, i) => i !== index),
    }));
  };

  // --- Traveler profiles (one per person in the group; interests, sub-interests, and
  // per-person dietary/religious/allergy info all live on the profile) ---
  const updateProfileName = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev.travelerProfiles];
      next[index] = { ...next[index], name: value };
      return { ...prev, travelerProfiles: next };
    });
  };
  const updateProfileField = (
    index: number,
    field: "dietary" | "religiousObservance" | "allergies",
    value: string
  ) => {
    setAnswers((prev) => {
      const next = [...prev.travelerProfiles];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, travelerProfiles: next };
    });
  };
  const addProfile = () => {
    setAnswers((prev) =>
      prev.travelerProfiles.length >= 6 ? prev : { ...prev, travelerProfiles: [...prev.travelerProfiles, blankProfile()] }
    );
  };
  const removeProfile = (index: number) => {
    setAnswers((prev) => ({
      ...prev,
      travelerProfiles:
        prev.travelerProfiles.length <= 1
          ? prev.travelerProfiles
          : prev.travelerProfiles.filter((_, i) => i !== index),
    }));
  };
  const toggleProfileInterest = (index: number, interestId: string) => {
    setAnswers((prev) => {
      const profile = prev.travelerProfiles[index];
      const has = profile.interests.includes(interestId);
      if (!has && profile.interests.length >= 5) return prev;
      const interests = has ? profile.interests.filter((i) => i !== interestId) : [...profile.interests, interestId];
      // Drop sub-interests belonging to a category the traveler just deselected.
      const subInterests = has
        ? profile.subInterests.filter((s) => !subInterestOptions[interestId]?.some((o) => o.id === s))
        : profile.subInterests;
      const next = [...prev.travelerProfiles];
      next[index] = { ...profile, interests, subInterests };
      return { ...prev, travelerProfiles: next };
    });
  };
  const toggleProfileSubInterest = (index: number, subId: string) => {
    setAnswers((prev) => {
      const profile = prev.travelerProfiles[index];
      const has = profile.subInterests.includes(subId);
      const next = [...prev.travelerProfiles];
      next[index] = {
        ...profile,
        subInterests: has ? profile.subInterests.filter((s) => s !== subId) : [...profile.subInterests, subId],
      };
      return { ...prev, travelerProfiles: next };
    });
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Narrator recommendations based on what the group told us they're into.
  const groupInterestIds = Array.from(new Set(answers.travelerProfiles.flatMap((p) => p.interests)));
  const rankedNarrators = narrators
    .map((n) => ({ ...n, matches: n.specialties.filter((s) => groupInterestIds.includes(s)) }))
    .sort((a, b) => b.matches.length - a.matches.length);

  // Full journey payload, shared by the save-progress banner (partial, mid-flow) and the
  // confirmation step (complete). Same shape the /account Personalization editor reads
  // and writes back through updateJourney.
  const buildJourneyPayload = () => ({
    homeLocation: answers.homeLocation,
    corridor: answers.corridor,
    groupType: answers.groupType,
    travelingWithKidsOrElders: answers.travelingWithKidsOrElders,
    travelWindows: answers.travelWindows
      .filter((w): w is DateRange => Boolean(w?.from))
      .map((w) => ({
        from: w.from?.toISOString(),
        to: w.to?.toISOString(),
      })),
    travelerProfiles: answers.travelerProfiles,
    depth: answers.depth,
    walkingTolerance: answers.walkingTolerance,
    heatSensitive: answers.heatSensitive,
    additionalNotes: answers.additionalNotes,
    interestLabels: groupInterestIds
      .map((id) => interestCategoryOptions.find((c) => c.id === id)?.label)
      .filter((l): l is string => Boolean(l)),
    savedAt: new Date().toISOString(),
  });

  // Hand off a light personalization signal to the marketplace so it can greet the user
  // with what they told us. Prototype stand-in for a real account/session — once real
  // accounts exist, this becomes a server-side profile instead of localStorage.
  useEffect(() => {
    if (step !== STEP_CONFIRMATION) return;
    updateJourney(buildJourneyPayload());
    if (answers.authMethod) {
      const loginEmail =
        answers.authMethod === "email"
          ? answers.email.trim() || "you@example.com"
          : answers.authMethod === "google"
          ? "you@gmail.com"
          : "you@icloud.com";
      login(loginEmail, answers.authMethod, answers.fullName.trim() || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const canContinue = (() => {
    switch (step) {
      case STEP_HOME:
        return answers.homeLocation.trim().length > 0 && answers.corridor !== null;
      case STEP_GROUP:
        return answers.groupType !== null;
      case STEP_TRAVELERS: {
        // Fully optional — skip freely with nothing filled in. "You" (index 0) has no name
        // field, so there's nothing to gate there. Any other traveler with a name filled in
        // needs at least one interest before moving on.
        const othersMissingInterests = answers.travelerProfiles
          .slice(1)
          .some((p) => p.name.trim().length > 0 && p.interests.length === 0);
        return !othersMissingInterests;
      }
      case STEP_DEPTH:
        return answers.depth !== null;
      case STEP_PACE:
        return answers.walkingTolerance !== null;
      default:
        return true;
    }
  })();

  const showSaveBanner =
    step >= STEP_TRAVELERS &&
    step <= STEP_PRACTICALITIES &&
    !saveBanner.dismissed &&
    !saveBanner.saved;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader variant="solid" />

      <div className="flex-1 py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          {step > 0 && step < TOTAL_STEPS && (
            <div className="max-w-2xl mx-auto mb-6 flex items-center gap-3">
              <div className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#159895] to-[#1A5F7A] transition-all duration-300"
                  style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Step {step} of {TOTAL_STEPS - 1}
              </span>
            </div>
          )}

          {showSaveBanner && (
            <div className="max-w-2xl mx-auto mb-6 bg-white border border-[#159895]/30 rounded-2xl p-5 shadow-sm relative">
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setSaveBanner((prev) => ({ ...prev, dismissed: true }))}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>

              <p className="text-sm font-semibold text-gray-900 pr-6">Don&apos;t lose this — save your progress</p>
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll keep everything you&apos;ve told us so far, tied to your Gamana account.
              </p>

              <div className="flex items-center gap-4 mt-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSaveBanner((prev) => ({ ...prev, mode: "new" }))}
                  className={`pb-1 border-b-2 transition-colors ${
                    saveBanner.mode === "new"
                      ? "text-[#159895] border-[#159895]"
                      : "text-gray-400 border-transparent hover:text-gray-600"
                  }`}
                >
                  Create a new account
                </button>
                <button
                  type="button"
                  onClick={() => setSaveBanner((prev) => ({ ...prev, mode: "existing" }))}
                  className={`pb-1 border-b-2 transition-colors ${
                    saveBanner.mode === "existing"
                      ? "text-[#159895] border-[#159895]"
                      : "text-gray-400 border-transparent hover:text-gray-600"
                  }`}
                >
                  Log into an existing account
                </button>
              </div>

              {saveBanner.mode === "existing" && (
                <div className="mt-3 grid gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      login("you@gmail.com", "google");
                      updateJourney(buildJourneyPayload());
                      setSaveBanner((prev) => ({ ...prev, email: "you@gmail.com", saved: true }));
                    }}
                    className="justify-start gap-3 h-10 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      G
                    </span>
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      login("you@icloud.com", "apple");
                      updateJourney(buildJourneyPayload());
                      setSaveBanner((prev) => ({ ...prev, email: "you@icloud.com", saved: true }));
                    }}
                    className="justify-start gap-3 h-10 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      A
                    </span>
                    Continue with Apple
                  </Button>
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">or use email</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                </div>
              )}

              <div className="mt-3 space-y-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={saveBanner.email}
                  onChange={(e) => setSaveBanner((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-9 text-sm"
                />
                {saveBanner.mode === "existing" && (
                  <Input
                    type="password"
                    placeholder="Password"
                    value={saveBanner.password}
                    onChange={(e) => setSaveBanner((prev) => ({ ...prev, password: e.target.value }))}
                    className="h-9 text-sm"
                  />
                )}
              </div>

              <Button
                onClick={() => {
                  if (!saveBanner.email.trim()) return;
                  setAnswers((prev) => ({ ...prev, email: saveBanner.email.trim() }));
                  login(saveBanner.email.trim(), "email");
                  updateJourney(buildJourneyPayload());
                  setSaveBanner((prev) => ({ ...prev, saved: true }));
                }}
                className="w-full mt-4 bg-[#159895] hover:bg-[#128a86]"
              >
                Save Progress
              </Button>

              <p className="text-[11px] text-gray-400 mt-2">
                Prototype note: neither path creates a real account or verifies a password yet.
              </p>
            </div>
          )}

          {saveBanner.saved && step > STEP_TRAVELERS && step <= STEP_PRACTICALITIES && (
            <div className="max-w-2xl mx-auto mb-6 text-xs text-[#159895] font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Progress saved to {saveBanner.email}
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
            {step === STEP_WELCOME && (
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <p className="text-sm font-semibold text-[#159895] uppercase tracking-wider">
                  Design concept — not live
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Let&apos;s shape your Gamana journey
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  A few honest questions — who you&apos;re traveling as, what pulls you in, which kind of guide
                  you&apos;d want beside you. Share as much or as little as you like — nothing here is shared or
                  sold; it exists only to make what you see, on the web and later in the app, feel like it was
                  made for you.
                </p>
                <Button
                  size="lg"
                  onClick={next}
                  className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A] rounded-full px-8"
                >
                  Begin
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === STEP_HOME && (
              <StepShell
                eyebrow="1 · Where you're coming from"
                title="Where do you call home, and where's this journey taking you?"
              >
                <div className="space-y-2">
                  <Label htmlFor="home">Where do you spend most of your year?</Label>
                  <CityAutocomplete
                    id="home"
                    placeholder="e.g. Bengaluru, India or Austin, USA"
                    value={answers.homeLocation}
                    onChange={(value) => update("homeLocation", value)}
                  />
                </div>
                <div className="grid gap-3 pt-2">
                  {corridorOptions.map((c) => (
                    <OptionCard
                      key={c.id}
                      label={c.label}
                      description={c.description}
                      selected={answers.corridor === c.id}
                      onClick={() => update("corridor", c.id)}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {step === STEP_GROUP && (
              <StepShell eyebrow="2 · Your group" title="Who usually travels with you on vacation?">
                <div className="grid gap-3">
                  {groupTypeOptions.map(
                    (g) => (
                      <OptionCard
                        key={g}
                        label={g}
                        selected={answers.groupType === g}
                        onClick={() => update("groupType", g)}
                      />
                    )
                  )}
                </div>
                <label className="flex items-center gap-3 pt-4 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={answers.travelingWithKidsOrElders}
                    onChange={(e) => update("travelingWithKidsOrElders", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#159895]"
                  />
                  Traveling with young children or elders who&apos;ll need a gentler pace
                </label>
                <p className="text-xs text-gray-400 pt-2">
                  We only ask this to shape pacing and safety tips — never shared, never sold.
                </p>
              </StepShell>
            )}

            {step === STEP_TIMING && (
              <StepShell
                eyebrow="3 · Timing"
                title="When do you expect to travel?"
                subtitle="Optional — add as many windows as apply, or skip this for now. Pick each range off the calendar."
              >
                <div className="space-y-3">
                  {answers.travelWindows.map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 justify-start text-left font-normal h-11"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
                            {w?.from ? (
                              w.to ? (
                                <span>
                                  {format(w.from, "MMM d, yyyy")} – {format(w.to, "MMM d, yyyy")}
                                </span>
                              ) : (
                                <span>{format(w.from, "MMM d, yyyy")} – pick an end date</span>
                              )
                            ) : (
                              <span className="text-gray-400">Pick a date range (optional)</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            defaultMonth={w?.from}
                            selected={w}
                            onSelect={(range) => updateWindow(i, range)}
                            numberOfMonths={1}
                            disabled={{ before: new Date() }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {answers.travelWindows.length > 1 && (
                        <button
                          type="button"
                          aria-label="Remove this window"
                          onClick={() => removeWindow(i)}
                          className="text-gray-400 hover:text-red-500 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {answers.travelWindows.length < 5 && (
                  <button
                    type="button"
                    onClick={addWindow}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#159895] hover:text-[#128a86] pt-1"
                  >
                    <Plus className="h-4 w-4" /> Add another window
                  </button>
                )}
              </StepShell>
            )}

            {step === STEP_TRAVELERS && (
              <StepShell
                eyebrow="4 · Your travel companions"
                title="Want to share some info on who travels with you?"
                subtitle="Totally optional — share as much or as little as you're comfortable with. If you add someone, give them at least one interest so we know how to plan for them. We'll ask for your name later, when you save your journey."
              >
                <div className="space-y-4">
                  {answers.travelerProfiles.map((profile, i) => (
                    <div key={i} className="rounded-xl border-2 border-gray-200 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        {i === 0 ? (
                          <p className="flex-1 text-sm font-semibold text-gray-900 py-2">
                            You
                          </p>
                        ) : (
                          <Input
                            placeholder="e.g. Partner, Mom, Kid (age 8)"
                            value={profile.name}
                            onChange={(e) => updateProfileName(i, e.target.value)}
                          />
                        )}
                        {i > 0 && (
                          <button
                            type="button"
                            aria-label="Remove this traveler"
                            onClick={() => removeProfile(i)}
                            className="text-gray-400 hover:text-red-500 shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {interestCategoryOptions.map((c) => (
                          <Chip
                            key={c.id}
                            label={c.label}
                            selected={profile.interests.includes(c.id)}
                            onClick={() => toggleProfileInterest(i, c.id)}
                            disabled={!profile.interests.includes(c.id) && profile.interests.length >= 5}
                          />
                        ))}
                      </div>

                      {profile.interests.length > 0 && (
                        <div className="space-y-3 pt-1 pl-3 border-l-2 border-[#159895]/20">
                          {profile.interests.map((catId) => {
                            const cat = interestCategoryOptions.find((c) => c.id === catId);
                            const subs = subInterestOptions[catId] || [];
                            return (
                              <div key={catId} className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-500">
                                  {cat?.label} — fine-tune (optional)
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {subs.map((s) => (
                                    <Chip
                                      key={s.id}
                                      label={s.label}
                                      selected={profile.subInterests.includes(s.id)}
                                      onClick={() => toggleProfileSubInterest(i, s.id)}
                                      small
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <p className="text-xs text-gray-400">{profile.interests.length}/5 interests selected</p>
                    </div>
                  ))}
                </div>
                {answers.travelerProfiles.length < 6 && (
                  <button
                    type="button"
                    onClick={addProfile}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#159895] hover:text-[#128a86] pt-1"
                  >
                    <Plus className="h-4 w-4" /> Add another traveler
                  </button>
                )}
              </StepShell>
            )}

            {step === STEP_DEPTH && (
              <StepShell eyebrow="5 · Depth" title="How deep do you like to go?">
                <div className="grid gap-3">
                  {depthOptions.map((d) => (
                    <OptionCard
                      key={d.id}
                      label={d.label}
                      description={d.description}
                      selected={answers.depth === d.id}
                      onClick={() => update("depth", d.id)}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {step === STEP_PACE && (
              <StepShell eyebrow="6 · Pace" title="How much walking feels right?">
                <div className="grid gap-3">
                  {walkingToleranceOptions.map(
                    (w) => (
                      <OptionCard
                        key={w}
                        label={w}
                        selected={answers.walkingTolerance === w}
                        onClick={() => update("walkingTolerance", w)}
                      />
                    )
                  )}
                </div>
                <label className="flex items-center gap-3 pt-4 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={answers.heatSensitive}
                    onChange={(e) => update("heatSensitive", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#159895]"
                  />
                  I'd like heat and hydration reminders in warmer destinations
                </label>
              </StepShell>
            )}

            {step === STEP_NARRATOR && (
              <StepShell
                eyebrow="7 · Your guides"
                title="Meet a few of the voices you might hear"
                subtitle={
                  groupInterestIds.length > 0
                    ? "Based on what you shared, these are the closest fits — you'll get to pick a narrator once you're in the app."
                    : "Sixteen narrator personalities live in the app — here's a preview. No need to choose one now."
                }
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {rankedNarrators.map((n) => (
                    <div
                      key={n.name}
                      className="rounded-xl border-2 border-gray-200 p-4 text-center"
                    >
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <Image src={n.image} alt={n.name} fill className="rounded-full object-cover" />
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{n.name}</p>
                      <p className="text-xs text-gray-500">{n.role}</p>
                      {n.matches.length > 0 && (
                        <span className="mt-1 inline-block text-[10px] font-semibold text-[#159895] bg-[#159895]/10 rounded-full px-2 py-0.5">
                          Recommended for you
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </StepShell>
            )}

            {step === STEP_PRACTICALITIES && (
              <StepShell
                eyebrow="8 · A few practicalities"
                title="Anything else we should keep in mind?"
                subtitle="A few details per traveler help us keep recommendations safe and comfortable — all optional."
              >
                {answers.groupType && answers.groupType !== "Just me" && answers.travelerProfiles.length === 1 && (
                  <p className="text-xs text-[#159895] bg-[#159895]/5 border border-[#159895]/20 rounded-lg px-3 py-2">
                    You mentioned traveling as &ldquo;{answers.groupType}&rdquo; — want to add the others below too?
                  </p>
                )}
                <div className="space-y-4">
                  {answers.travelerProfiles.map((profile, i) => (
                    <div key={i} className="rounded-xl border-2 border-gray-200 p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-800">
                        {profile.name.trim() || (i === 0 ? "You" : `Traveler ${i + 1}`)}
                      </p>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Dietary preference</Label>
                        <div className="flex flex-wrap gap-2">
                          {dietaryOptions.map((d) => (
                            <Chip
                              key={d}
                              label={d}
                              selected={profile.dietary === d}
                              onClick={() => updateProfileField(i, "dietary", profile.dietary === d ? "" : d)}
                              small
                            />
                          ))}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`religious-${i}`} className="text-xs text-gray-500">
                            Religious or cultural observance
                          </Label>
                          <Input
                            id={`religious-${i}`}
                            placeholder="e.g. Friday prayers, Sabbath"
                            value={profile.religiousObservance}
                            onChange={(e) => updateProfileField(i, "religiousObservance", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`allergies-${i}`} className="text-xs text-gray-500">
                            Allergies or restrictions
                          </Label>
                          <Input
                            id={`allergies-${i}`}
                            placeholder="e.g. peanuts, shellfish"
                            value={profile.allergies}
                            onChange={(e) => updateProfileField(i, "allergies", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {answers.travelerProfiles.length < 6 && (
                  <button
                    type="button"
                    onClick={addProfile}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#159895] hover:text-[#128a86]"
                  >
                    <Plus className="h-4 w-4" /> Add another traveler
                  </button>
                )}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="notes">Anything else you&apos;d like to tell us? (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Share as much as you'd like — mobility needs, a place you're avoiding, an occasion you're celebrating..."
                    value={answers.additionalNotes}
                    onChange={(e) => update("additionalNotes", e.target.value)}
                    rows={4}
                  />
                </div>
              </StepShell>
            )}

            {step === STEP_ACCOUNT && (
              <StepShell
                eyebrow="9 · Save your journey"
                title="Let's get this saved to your Gamana account"
                subtitle="This is the same account you'll log into on the app, so everything you told us carries over."
              >
                <div className="grid gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => update("authMethod", "google")}
                    className={`justify-start gap-3 h-12 ${answers.authMethod === "google" ? "border-[#159895] bg-[#159895]/5" : ""}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[11px] font-bold flex items-center justify-center">
                      G
                    </span>
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => update("authMethod", "apple")}
                    className={`justify-start gap-3 h-12 ${answers.authMethod === "apple" ? "border-[#159895] bg-[#159895]/5" : ""}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                      A
                    </span>
                    Continue with Apple
                  </Button>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                  type="button"
                  onClick={() => update("authMethod", "email")}
                  className="text-sm font-semibold text-[#159895] hover:text-[#128a86] flex items-center gap-1"
                >
                  <LogIn className="h-4 w-4" /> Continue with email instead
                </button>

                {answers.authMethod === "email" && (
                  <div className="grid gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Your name"
                          value={answers.fullName}
                          onChange={(e) => update("fullName", e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={answers.email}
                          onChange={(e) => update("email", e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Create a password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input id="password" type="password" placeholder="••••••••" className="pl-9" />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 pt-2">
                  Prototype note: this step doesn&apos;t create a real account or OAuth session yet — it&apos;s
                  here to show where account creation fits in the flow.
                </p>
              </StepShell>
            )}

            {step === STEP_CONFIRMATION && (
              <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your journey is taking shape</h2>
                <p className="text-gray-600">
                  Here&apos;s what you told us. In the app, this is what starts shaping your recommendations.
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#159895]" />
                    {answers.homeLocation || "—"} ·{" "}
                    {answers.corridor === "inbound"
                      ? "Coming to India"
                      : answers.corridor === "domestic"
                      ? "Exploring within India"
                      : answers.corridor === "outbound"
                      ? "Heading abroad from India"
                      : "—"}
                  </p>
                  <p>
                    Traveling as: {answers.groupType || "—"}
                    {answers.travelingWithKidsOrElders ? " (with kids or elders in the group)" : ""}
                  </p>
                  <p>
                    Travel windows:{" "}
                    {answers.travelWindows
                      .filter((w): w is DateRange & { from: Date; to: Date } => Boolean(w?.from && w?.to))
                      .map((w) => `${format(w.from, "MMM d, yyyy")} – ${format(w.to, "MMM d, yyyy")}`)
                      .join(", ") || "—"}
                  </p>
                  <p>
                    Traveling with:{" "}
                    {answers.travelerProfiles
                      .map((p, i) => ({
                        displayName: i === 0 ? answers.fullName.trim() || "You" : p.name,
                        engaged: i === 0 ? p.interests.length > 0 : p.name.trim().length > 0,
                        interests: p.interests,
                      }))
                      .filter((p) => p.engaged)
                      .map((p) => {
                        const interestLabels = p.interests
                          .map((id) => interestCategoryOptions.find((c) => c.id === id)?.label)
                          .filter(Boolean)
                          .join(", ");
                        return interestLabels ? `${p.displayName} (${interestLabels})` : p.displayName;
                      })
                      .join("; ") || "—"}
                  </p>
                  {answers.travelerProfiles.some((p) => p.dietary || p.religiousObservance || p.allergies) && (
                    <p>
                      Dietary & practical notes:{" "}
                      {answers.travelerProfiles
                        .filter((p) => p.dietary || p.religiousObservance || p.allergies)
                        .map((p) => {
                          const label = p.name.trim() || "Traveler";
                          const parts = [p.dietary, p.religiousObservance, p.allergies].filter(Boolean);
                          return `${label} (${parts.join(", ")})`;
                        })
                        .join("; ")}
                    </p>
                  )}
                  {answers.depth && (
                    <p>Depth: {depthLabels[answers.depth] ?? answers.depth}</p>
                  )}
                  {answers.walkingTolerance && (
                    <p>
                      Pace: {answers.walkingTolerance}
                      {answers.heatSensitive ? " · wants heat/hydration reminders" : ""}
                    </p>
                  )}
                  {answers.additionalNotes.trim() && <p>Anything else: {answers.additionalNotes.trim()}</p>}
                  <p>Account: {answers.authMethod ? `Signed up via ${answers.authMethod}` : "Not created yet"}</p>
                </div>
                <p className="text-sm text-gray-500">
                  This is just the start — explore your marketplace now, or download the Gamana app to keep
                  going in person.
                </p>
                <Link href="/marketplace-redesign">
                  <Button className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A] rounded-full px-8">
                    Start Exploring
                  </Button>
                </Link>
              </div>
            )}

            {step > 0 && step < TOTAL_STEPS && (
              <div className="max-w-2xl mx-auto flex items-center justify-between pt-10 mt-6 border-t border-gray-100">
                <Button variant="ghost" onClick={back} className="text-gray-500">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={next}
                  disabled={!canContinue}
                  className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A] rounded-full px-6"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
