'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Filter } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { apiFetch } from '@/lib/api/client';
import {
  DEFAULT_STORY_FILTERS,
  DEFAULT_TOUR_FILTERS,
  STORY_FLAG_OPTIONS,
  STORY_PRICE_OPTIONS,
  STORY_RADIUS_OPTIONS,
  STORY_SORT_OPTIONS,
  TOUR_ACCESS_OPTIONS,
  TOUR_DURATION_OPTIONS,
  TOUR_PRICE_OPTIONS,
  TOUR_SORT_OPTIONS,
  TOUR_STOP_OPTIONS,
  type FilterOption,
  type StoryFilters,
  type TourFilters,
} from '@/lib/catalog-filters';
import { cn } from '@/lib/utils';

const optionSchema = z.object({ id: z.coerce.string(), label: z.coerce.string(), count: z.number().nullish() }).passthrough();
const filterOptionsSchema = z
  .object({
    categories: z.array(optionSchema).nullish(),
    duration: z.array(optionSchema).nullish(),
    price: z.array(optionSchema).nullish(),
    sort: z.array(optionSchema).nullish(),
    audio_walks: z.array(optionSchema).nullish(),
  })
  .passthrough();

export type TourFilterOptions = {
  categories: FilterOption[];
  duration: FilterOption[];
  price: FilterOption[];
  stops: FilterOption[];
  sort: FilterOption[];
};

const toOption = (o: z.infer<typeof optionSchema>): FilterOption => ({ id: o.id, label: o.label, count: o.count ?? undefined });

/** `GET /api/v2/tours/filter-options` — the app's own chip list. Signed-in only; `null` until loaded or on failure. */
export function useTourFilterOptions(enabled: boolean): Partial<TourFilterOptions> | null {
  const [options, setOptions] = useState<Partial<TourFilterOptions> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setOptions(null);
      return;
    }
    let cancelled = false;
    apiFetch('/tours/filter-options', { version: 'v2', auth: 'required', schema: filterOptionsSchema })
      .then((data) => {
        if (cancelled) return;
        const stops = (data.audio_walks ?? []).filter((o) => o.id !== 'all' && o.id !== 'unlocked' && o.id !== 'locked');
        setOptions({
          categories: data.categories?.map(toOption),
          duration: data.duration?.map(toOption),
          price: data.price?.map(toOption),
          stops: stops.length ? stops.map(toOption) : undefined,
          sort: data.sort?.map(toOption),
        });
      })
      .catch((error) => {
        if (!cancelled) console.warn('Tour filter options unavailable, using catalog-derived options', error);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return options;
}

function ChipGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.id)}
              className={cn(
                'focus-ring min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-300',
                active ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink/10 bg-white text-ink-soft hover:border-brand-500/40 hover:text-ink',
              )}
            >
              {option.label}
              {option.count !== undefined && <span className={cn('ml-1.5 text-xs', active ? 'text-white/80' : 'text-ink-muted')}>{option.count}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

const single = (current: string, id: string, fallback: string) => (current === id ? fallback : id);
const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);

type Props = {
  activeCount: number;
  signedIn: boolean;
  hasCity: boolean;
} & (
  | { kind: 'story'; value: StoryFilters; onApply: (next: StoryFilters) => void }
  | { kind: 'walk'; value: TourFilters; onApply: (next: TourFilters) => void; options: TourFilterOptions }
);

export function CatalogFilterSheet(props: Props) {
  const { activeCount, signedIn, hasCity } = props;
  const [open, setOpen] = useState(false);
  const [storyDraft, setStoryDraft] = useState<StoryFilters>(DEFAULT_STORY_FILTERS);
  const [tourDraft, setTourDraft] = useState<TourFilters>(DEFAULT_TOUR_FILTERS);

  useEffect(() => {
    if (!open) return;
    if (props.kind === 'story') setStoryDraft(props.value);
    else setTourDraft(props.value);
    // Re-seed the draft only when the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const apply = () => {
    if (props.kind === 'story') props.onApply(storyDraft);
    else props.onApply(tourDraft);
    setOpen(false);
  };

  const reset = () => {
    if (props.kind === 'story') setStoryDraft(DEFAULT_STORY_FILTERS);
    else setTourDraft(DEFAULT_TOUR_FILTERS);
  };

  const title = props.kind === 'story' ? 'Filter audio stories' : 'Filter audio tours';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-card transition-colors hover:border-brand-500/40"
        >
          <Filter className="h-4 w-4 text-brand-700" aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-700 px-1.5 text-[11px] font-bold text-white">
              {activeCount}
              <span className="sr-only"> active</span>
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden bg-sand-50 p-0 sm:max-w-md max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:h-[85vh] max-sm:rounded-t-3xl"
      >
        <SheetHeader className="border-b border-ink/5 px-6 pb-4 pt-6 text-left">
          <SheetTitle className="font-display text-xl font-bold text-ink">{title}</SheetTitle>
          <SheetDescription className="text-ink-soft">The same filters you get in the Gamana app.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          {props.kind === 'story' ? (
            <>
              {hasCity ? (
                <ChipGroup
                  legend="Radius"
                  options={STORY_RADIUS_OPTIONS}
                  selected={[storyDraft.radius]}
                  onToggle={(id) => setStoryDraft((d) => ({ ...d, radius: single(d.radius, id, 'all') }))}
                />
              ) : (
                <p className="rounded-2xl bg-white p-4 text-sm text-ink-soft shadow-card">
                  Pick a city to filter and sort stories by distance.
                </p>
              )}
              <ChipGroup
                legend="Show"
                options={STORY_FLAG_OPTIONS.filter((o) => signedIn || o.id !== 'unlocked')}
                selected={[storyDraft.flag]}
                onToggle={(id) => setStoryDraft((d) => ({ ...d, flag: single(d.flag, id, 'all') }))}
              />
              <ChipGroup
                legend="Price"
                options={STORY_PRICE_OPTIONS}
                selected={[storyDraft.price]}
                onToggle={(id) => setStoryDraft((d) => ({ ...d, price: single(d.price, id, 'all') }))}
              />
              <ChipGroup
                legend="Sort"
                options={STORY_SORT_OPTIONS.filter((o) => hasCity || (o.id !== 'nearest' && o.id !== 'farthest'))}
                selected={[storyDraft.sort]}
                onToggle={(id) => setStoryDraft((d) => ({ ...d, sort: id }))}
              />
            </>
          ) : (
            <>
              <ChipGroup
                legend="Sort"
                options={props.options.sort}
                selected={[tourDraft.sort]}
                onToggle={(id) => setTourDraft((d) => ({ ...d, sort: id }))}
              />
              {signedIn && (
                <ChipGroup
                  legend="Access"
                  options={TOUR_ACCESS_OPTIONS}
                  selected={[tourDraft.access]}
                  onToggle={(id) => setTourDraft((d) => ({ ...d, access: single(d.access, id, 'all') }))}
                />
              )}
              <ChipGroup
                legend="Categories"
                options={props.options.categories}
                selected={tourDraft.categories}
                onToggle={(id) => setTourDraft((d) => ({ ...d, categories: toggle(d.categories, id) }))}
              />
              <ChipGroup
                legend="Stops"
                options={props.options.stops}
                selected={tourDraft.stops}
                onToggle={(id) => setTourDraft((d) => ({ ...d, stops: toggle(d.stops, id) }))}
              />
              <ChipGroup
                legend="Duration"
                options={props.options.duration}
                selected={tourDraft.duration}
                onToggle={(id) => setTourDraft((d) => ({ ...d, duration: toggle(d.duration, id) }))}
              />
              <ChipGroup
                legend="Price"
                options={props.options.price}
                selected={tourDraft.price}
                onToggle={(id) => setTourDraft((d) => ({ ...d, price: toggle(d.price, id) }))}
              />
            </>
          )}
        </div>

        <SheetFooter className="flex-row gap-3 border-t border-ink/5 bg-white px-6 py-4 sm:space-x-0">
          <Button type="button" variant="outline" onClick={reset} className="h-11 flex-1 rounded-full">
            Reset
          </Button>
          <Button type="button" onClick={apply} className="h-11 flex-1 rounded-full">
            Show results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const FALLBACK_TOUR_OPTIONS: Omit<TourFilterOptions, 'categories'> = {
  duration: TOUR_DURATION_OPTIONS,
  price: TOUR_PRICE_OPTIONS,
  stops: TOUR_STOP_OPTIONS,
  sort: TOUR_SORT_OPTIONS,
};
