"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "@/components/icons";

/** Hero search: writes `?q=` (debounced) and leaves the other filters in place. */
export function ExperienceHeroSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(current);

  useEffect(() => setDraft(current), [current]);

  const commit = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if (draft.trim() === current) return;
    const id = window.setTimeout(() => commit(draft), 400);
    return () => window.clearTimeout(id);
  }, [draft, current]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    commit(draft);
    document.getElementById("experience-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Search an experience or city"
        aria-label="Search an experience or city"
        className="focus-ring h-14 w-full rounded-full border-0 bg-white pl-14 pr-32 text-base text-ink shadow-lift placeholder:text-ink-muted"
      />
      <button
        type="submit"
        className="focus-ring absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 px-5 text-sm font-semibold text-white"
      >
        Search
      </button>
    </form>
  );
}
