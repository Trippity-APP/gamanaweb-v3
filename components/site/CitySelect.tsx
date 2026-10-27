"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, MapPin, X } from "@/components/icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { loadActiveCities, type ApiCity } from "@/lib/services/cityService";

type Props = {
  value: ApiCity | null;
  onChange: (city: ApiCity | null) => void;
  placeholder?: string;
  /** Shows a clear button when a city is selected. */
  clearable?: boolean;
  /** Pre-loaded list; fetched from /locations/cities when omitted. */
  cities?: ApiCity[];
  className?: string;
  id?: string;
};

/** Searchable picker over Gamana's active cities (`/locations/cities?active=true`), the same list the app uses. */
export function CitySelect({ value, onChange, placeholder = "All cities", clearable = false, cities: provided, className, id }: Props) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState<ApiCity[] | null>(provided ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (provided) {
      setLoaded(provided);
      return;
    }
    let cancelled = false;
    loadActiveCities()
      .then((list) => !cancelled && setLoaded(list))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [provided]);

  const groups = useMemo(() => {
    const list = [...(loaded ?? [])].sort((a, b) => a.name.localeCompare(b.name));
    const popular = list.filter((c) => c.is_popular);
    const byCountry = new Map<string, ApiCity[]>();
    for (const city of list) {
      const country = city.country_name?.trim() || "Other";
      byCountry.set(country, [...(byCountry.get(country) ?? []), city]);
    }
    const countries = Array.from(byCountry.entries()).sort(([a], [b]) => a.localeCompare(b));
    return { popular, countries };
  }, [loaded]);

  const select = (city: ApiCity) => {
    onChange(city);
    setOpen(false);
  };

  const renderItem = (city: ApiCity, group: string) => (
    <CommandItem
      key={`${group}-${city.id}`}
      value={`${city.name} ${city.state_name ?? ""} ${city.country_name ?? ""} ${group}-${city.id}`}
      onSelect={() => select(city)}
      className="min-h-11 cursor-pointer gap-2 rounded-xl px-3 data-[selected=true]:bg-sand-100 data-[selected=true]:text-ink"
    >
      <MapPin className="h-4 w-4 shrink-0 text-brand-700" aria-hidden />
      <span className="flex-1 truncate">
        <span className="font-semibold text-ink">{city.name}</span>
        {city.state_name && <span className="text-ink-muted">, {city.state_name}</span>}
      </span>
      {value?.id === city.id && <Check className="h-4 w-4 text-brand-700" aria-hidden />}
    </CommandItem>
  );

  return (
    <div className={cn("relative inline-flex", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={value ? `City: ${value.name}. Change city` : "Choose a city"}
            className={cn(
              "focus-ring inline-flex h-11 w-full min-w-0 items-center gap-2 rounded-full border border-ink/10 bg-white pl-4 text-sm font-semibold text-ink shadow-card transition-colors hover:border-brand-500/40",
              clearable && value ? "pr-11" : "pr-4",
            )}
          >
            <MapPin className="h-4 w-4 shrink-0 text-brand-700" aria-hidden />
            <span className={cn("truncate", !value && "text-ink-soft")}>{value?.name ?? placeholder}</span>
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border-ink/10 bg-white p-0 text-ink shadow-lift">
          <Command className="rounded-2xl bg-white text-ink">
            <CommandInput placeholder="Search a city" aria-label="Search a city" />
            <CommandList className="max-h-80 p-1">
              {loaded === null && !failed ? (
                <p className="py-6 text-center text-sm text-ink-muted" role="status">
                  Loading cities…
                </p>
              ) : failed ? (
                <p className="py-6 text-center text-sm text-ink-muted" role="alert">
                  Couldn&apos;t load cities. Try again in a moment.
                </p>
              ) : (
                <>
                  <CommandEmpty>No Gamana city matches that yet.</CommandEmpty>
                  {groups.popular.length > 0 && (
                    <CommandGroup heading="Popular cities">{groups.popular.map((c) => renderItem(c, "popular"))}</CommandGroup>
                  )}
                  {groups.countries.map(([country, list]) => (
                    <CommandGroup key={country} heading={country}>
                      {list.map((c) => renderItem(c, country))}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {clearable && value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={`Clear city ${value.name}`}
          className="focus-ring absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-sand-100 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
