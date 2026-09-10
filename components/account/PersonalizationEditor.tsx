"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { OptionCard } from "@/components/personalization/OptionCard";
import { Chip } from "@/components/personalization/Chip";
import { useAccount } from "@/lib/account-context";
import type { SavedJourney } from "@/lib/account-context";
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
import { Plus, X, Calendar as CalendarIcon, Pencil, Sparkles } from "lucide-react";

interface Draft {
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
}

function draftFromJourney(journey: SavedJourney | null): Draft {
  return {
    homeLocation: journey?.homeLocation || "",
    corridor: journey?.corridor ?? null,
    groupType: journey?.groupType ?? null,
    travelingWithKidsOrElders: journey?.travelingWithKidsOrElders ?? false,
    travelWindows:
      journey?.travelWindows && journey.travelWindows.length > 0
        ? journey.travelWindows.map((w) => ({
            from: w.from ? new Date(w.from) : undefined,
            to: w.to ? new Date(w.to) : undefined,
          }))
        : [undefined],
    travelerProfiles:
      journey?.travelerProfiles && journey.travelerProfiles.length > 0
        ? journey.travelerProfiles
        : [blankProfile()],
    depth: journey?.depth ?? null,
    walkingTolerance: journey?.walkingTolerance ?? null,
    heatSensitive: journey?.heatSensitive ?? false,
    additionalNotes: journey?.additionalNotes || "",
  };
}

/**
 * Every variable Start Your Gamana Journey collects, editable inline — no need to
 * replay the whole wizard for a one-field change. Reuses the exact same option lists
 * and picker components as the wizard (lib/personalization.ts,
 * components/personalization/*) so the two editing surfaces can't drift apart.
 */
export function PersonalizationEditor() {
  const { journey, updateJourney, account } = useAccount();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => draftFromJourney(journey));
  const [justSaved, setJustSaved] = useState(false);

  const startEditing = () => {
    setDraft(draftFromJourney(journey));
    setJustSaved(false);
    setEditing(true);
  };

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  // --- Travel windows ---
  const updateWindow = (index: number, value: DateRange | undefined) => {
    setDraft((prev) => {
      const next = [...prev.travelWindows];
      next[index] = value;
      return { ...prev, travelWindows: next };
    });
  };
  const addWindow = () =>
    setDraft((prev) =>
      prev.travelWindows.length >= 5 ? prev : { ...prev, travelWindows: [...prev.travelWindows, undefined] }
    );
  const removeWindow = (index: number) =>
    setDraft((prev) => ({
      ...prev,
      travelWindows: prev.travelWindows.length <= 1 ? prev.travelWindows : prev.travelWindows.filter((_, i) => i !== index),
    }));

  // --- Traveler profiles ---
  const updateProfileName = (index: number, value: string) => {
    setDraft((prev) => {
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
    setDraft((prev) => {
      const next = [...prev.travelerProfiles];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, travelerProfiles: next };
    });
  };
  const addProfile = () =>
    setDraft((prev) =>
      prev.travelerProfiles.length >= 6 ? prev : { ...prev, travelerProfiles: [...prev.travelerProfiles, blankProfile()] }
    );
  const removeProfile = (index: number) =>
    setDraft((prev) => ({
      ...prev,
      travelerProfiles:
        prev.travelerProfiles.length <= 1 ? prev.travelerProfiles : prev.travelerProfiles.filter((_, i) => i !== index),
    }));
  const toggleProfileInterest = (index: number, interestId: string) => {
    setDraft((prev) => {
      const profile = prev.travelerProfiles[index];
      const has = profile.interests.includes(interestId);
      if (!has && profile.interests.length >= 5) return prev;
      const interests = has ? profile.interests.filter((i) => i !== interestId) : [...profile.interests, interestId];
      const subInterests = has
        ? profile.subInterests.filter((s) => !subInterestOptions[interestId]?.some((o) => o.id === s))
        : profile.subInterests;
      const next = [...prev.travelerProfiles];
      next[index] = { ...profile, interests, subInterests };
      return { ...prev, travelerProfiles: next };
    });
  };
  const toggleProfileSubInterest = (index: number, subId: string) => {
    setDraft((prev) => {
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

  const save = () => {
    const groupInterestIds = Array.from(new Set(draft.travelerProfiles.flatMap((p) => p.interests)));
    const interestLabels = groupInterestIds
      .map((id) => interestCategoryOptions.find((c) => c.id === id)?.label)
      .filter((l): l is string => Boolean(l));
    updateJourney({
      homeLocation: draft.homeLocation,
      corridor: draft.corridor,
      groupType: draft.groupType,
      travelingWithKidsOrElders: draft.travelingWithKidsOrElders,
      travelWindows: draft.travelWindows
        .filter((w): w is DateRange => Boolean(w?.from))
        .map((w) => ({ from: w.from?.toISOString(), to: w.to?.toISOString() })),
      travelerProfiles: draft.travelerProfiles,
      depth: draft.depth,
      walkingTolerance: draft.walkingTolerance,
      heatSensitive: draft.heatSensitive,
      additionalNotes: draft.additionalNotes,
      interestLabels,
      savedAt: new Date().toISOString(),
    });
    setEditing(false);
    setJustSaved(true);
  };

  const hasAnyJourney = Boolean(
    journey &&
      (journey.homeLocation ||
        journey.corridor ||
        journey.groupType ||
        (journey.interestLabels && journey.interestLabels.length > 0))
  );

  // --- Read-only summary view ---
  if (!editing) {
    return (
      <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
        {justSaved && (
          <p className="text-xs font-medium text-[#159895]">Your preferences are saved.</p>
        )}

        {hasAnyJourney ? (
          <div className="space-y-2 text-sm text-gray-600">
            {journey?.homeLocation && (
              <p><span className="text-gray-400">Home base:</span> {journey.homeLocation}</p>
            )}
            {journey?.groupType && (
              <p><span className="text-gray-400">Usually travels:</span> {journey.groupType}</p>
            )}
            {journey?.travelerProfiles && journey.travelerProfiles.length > 1 && (
              <p><span className="text-gray-400">Travel companions:</span> {journey.travelerProfiles.length - 1}</p>
            )}
            {journey?.depth && (
              <p><span className="text-gray-400">Depth:</span> {depthLabels[journey.depth] ?? journey.depth}</p>
            )}
            {journey?.interestLabels && journey.interestLabels.length > 0 && (
              <p><span className="text-gray-400">Interests:</span> {journey.interestLabels.join(", ")}</p>
            )}
            {journey?.savedAt && (
              <p className="text-xs text-gray-400">
                Last updated {new Date(journey.savedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">You haven&apos;t personalized your recommendations yet.</p>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <Button onClick={startEditing} size="sm" variant="outline" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" /> {hasAnyJourney ? "Edit preferences" : "Fill this in now"}
          </Button>
          <Link href="/start-your-journey">
            <Button size="sm" variant="ghost" className="gap-1.5 text-gray-500">
              <Sparkles className="h-3.5 w-3.5" /> Redo the full journey instead
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- Full inline editor ---
  const groupInterestIds = Array.from(new Set(draft.travelerProfiles.flatMap((p) => p.interests)));

  return (
    <div className="rounded-2xl border border-[#159895]/30 p-5 space-y-8">
      {/* Home & corridor */}
      <div className="space-y-3">
        <Label htmlFor="pz-home">Where do you spend most of your year?</Label>
        <CityAutocomplete
          id="pz-home"
          placeholder="e.g. Bengaluru, India or Austin, USA"
          value={draft.homeLocation}
          onChange={(value) => update("homeLocation", value)}
        />
        <div className="grid gap-2 pt-1">
          {corridorOptions.map((c) => (
            <OptionCard
              key={c.id}
              label={c.label}
              description={c.description}
              selected={draft.corridor === c.id}
              onClick={() => update("corridor", c.id)}
            />
          ))}
        </div>
      </div>

      {/* Group */}
      <div className="space-y-3">
        <Label>Who usually travels with you on vacation?</Label>
        <div className="grid gap-2">
          {groupTypeOptions.map((g) => (
            <OptionCard key={g} label={g} selected={draft.groupType === g} onClick={() => update("groupType", g)} />
          ))}
        </div>
        <label className="flex items-center gap-3 pt-1 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={draft.travelingWithKidsOrElders}
            onChange={(e) => update("travelingWithKidsOrElders", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-[#159895]"
          />
          Traveling with young children or elders who&apos;ll need a gentler pace
        </label>
      </div>

      {/* Travel windows */}
      <div className="space-y-3">
        <Label>When do you expect to travel?</Label>
        <div className="space-y-2">
          {draft.travelWindows.map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="flex-1 justify-start text-left font-normal h-11">
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
              {draft.travelWindows.length > 1 && (
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
        {draft.travelWindows.length < 5 && (
          <button
            type="button"
            onClick={addWindow}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#159895] hover:text-[#128a86]"
          >
            <Plus className="h-4 w-4" /> Add another window
          </button>
        )}
      </div>

      {/* Traveler roster — interests, sub-interests, and practicalities combined per person */}
      <div className="space-y-3">
        <div>
          <Label>Your travel companions</Label>
          <p className="text-xs text-gray-500 mt-1">
            &ldquo;You&rdquo; uses the name from your Profile above. Add anyone else who usually
            travels with you, with at least one interest each.
          </p>
        </div>
        <div className="space-y-4">
          {draft.travelerProfiles.map((profile, i) => (
            <div key={i} className="rounded-xl border-2 border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                {i === 0 ? (
                  <p className="flex-1 text-sm font-semibold text-gray-900 py-2">
                    {account?.fullName?.trim() || "You"}
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
                        <p className="text-xs font-semibold text-gray-500">{cat?.label}, fine-tune (optional)</p>
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

              <div className="space-y-1.5 pt-1">
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
                  <Label htmlFor={`pz-religious-${i}`} className="text-xs text-gray-500">
                    Religious or cultural observance
                  </Label>
                  <Input
                    id={`pz-religious-${i}`}
                    placeholder="e.g. Friday prayers, Sabbath"
                    value={profile.religiousObservance}
                    onChange={(e) => updateProfileField(i, "religiousObservance", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`pz-allergies-${i}`} className="text-xs text-gray-500">
                    Allergies or restrictions
                  </Label>
                  <Input
                    id={`pz-allergies-${i}`}
                    placeholder="e.g. peanuts, shellfish"
                    value={profile.allergies}
                    onChange={(e) => updateProfileField(i, "allergies", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {draft.travelerProfiles.length < 6 && (
          <button
            type="button"
            onClick={addProfile}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#159895] hover:text-[#128a86]"
          >
            <Plus className="h-4 w-4" /> Add another traveler
          </button>
        )}
      </div>

      {/* Depth */}
      <div className="space-y-3">
        <Label>How deep do you like to go?</Label>
        <div className="grid gap-2">
          {depthOptions.map((d) => (
            <OptionCard
              key={d.id}
              label={d.label}
              description={d.description}
              selected={draft.depth === d.id}
              onClick={() => update("depth", d.id)}
            />
          ))}
        </div>
      </div>

      {/* Pace */}
      <div className="space-y-3">
        <Label>How much walking feels right?</Label>
        <div className="grid gap-2">
          {walkingToleranceOptions.map((w) => (
            <OptionCard
              key={w}
              label={w}
              selected={draft.walkingTolerance === w}
              onClick={() => update("walkingTolerance", w)}
            />
          ))}
        </div>
        <label className="flex items-center gap-3 pt-1 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={draft.heatSensitive}
            onChange={(e) => update("heatSensitive", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-[#159895]"
          />
          I&apos;d like heat and hydration reminders in warmer destinations
        </label>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="pz-notes">Anything else you&apos;d like to tell us? (optional)</Label>
        <Textarea
          id="pz-notes"
          placeholder="Share as much as you'd like, mobility needs, a place you're avoiding, an occasion you're celebrating..."
          value={draft.additionalNotes}
          onChange={(e) => update("additionalNotes", e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Button onClick={save} className="bg-gradient-to-r from-[#159895] to-[#1A5F7A]">
          Save changes
        </Button>
        <Button variant="outline" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
      {groupInterestIds.length === 0 && (
        <p className="text-[11px] text-gray-400">
          Tip: give at least one traveler an interest so we have something to personalize around.
        </p>
      )}
    </div>
  );
}
