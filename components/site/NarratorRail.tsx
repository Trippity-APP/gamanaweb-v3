"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "@/components/icons";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { NARRATORS, type Narrator } from "@/lib/data/narrators";
import { CardRail } from "@/components/site/CardRail";

function Waveform({ active }: { active: boolean }) {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("w-0.5 origin-bottom rounded-full bg-current", active ? "h-4 animate-wave" : "h-1.5")}
          style={active ? { animationDelay: `${i * 120}ms` } : undefined}
        />
      ))}
    </span>
  );
}

/** Narrator cards with voice previews. Only one sample plays at a time. */
export function NarratorRail({ narrators = NARRATORS, source = "narrator_rail" }: { narrators?: Narrator[]; source?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = (n: Narrator) => {
    const current = audioRef.current;
    if (playing === n.name && current) {
      current.pause();
      setPlaying(null);
      return;
    }
    current?.pause();
    const audio = new Audio(n.audio);
    audio.onended = () => setPlaying(null);
    audioRef.current = audio;
    audio.play().then(
      () => {
        setPlaying(n.name);
        trackEvent("narrator_preview", { narrator: n.name, source });
      },
      () => setPlaying(null)
    );
  };

  return (
    <CardRail label="Gamana narrators">
      {narrators.map((n) => {
        const active = playing === n.name;
        return (
          <article
            key={n.name}
            className={cn(
              "group relative w-[16rem] overflow-hidden rounded-3xl bg-white p-6 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift sm:w-[17.5rem]",
              active && "ring-2 ring-brand-500"
            )}
          >
            <div className="relative mx-auto h-28 w-28">
              <span
                className={cn(
                  "absolute inset-0 rounded-full bg-brand-400/30 transition-transform duration-700 ease-out-expo",
                  active ? "scale-125 animate-pulse" : "scale-100 group-hover:scale-110"
                )}
                aria-hidden
              />
              <Image
                src={n.image}
                alt={`${n.name}, ${n.role} narrator on Gamana`}
                width={112}
                height={112}
                className="relative h-28 w-28 rounded-full object-cover shadow-lg"
              />
            </div>
            <div className="mt-5 text-center">
              <h3 className="font-display text-xl font-bold text-ink">{n.name}</h3>
              <p className="mt-0.5 text-sm font-semibold text-brand-700">{n.role}</p>
              <p className="mt-1 text-xs text-ink-muted">{n.demographics}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(n)}
              aria-pressed={active}
              aria-label={`${active ? "Pause" : "Play"} ${n.name}'s voice sample`}
              className={cn(
                "focus-ring mx-auto mt-5 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-spring active:scale-95",
                active ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-800 hover:bg-brand-100"
              )}
            >
              {active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {active ? "Pause" : "Listen"}
              <Waveform active={active} />
            </button>
          </article>
        );
      })}
    </CardRail>
  );
}
