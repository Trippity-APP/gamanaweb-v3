"use client";

import { useEffect, useState } from "react";

/**
 * Rotating travel quotes for the About page.
 *
 * Sourcing rule for anything added here: public domain only. Every entry below is either
 * ancient, or by an author long out of copyright (Twain d.1910, Tagore d.1941, Machado
 * d.1939, Proust d.1922), so none of it carries the licensing exposure that ruled out the
 * Eliot lines originally requested for this section.
 *
 * `attributed: true` marks quotations that are widely credited to a figure but not traced
 * to a verified passage in their work — the credit line renders as "Attributed to …" so the
 * page doesn't overclaim.
 */
type Quote = {
  text: string;
  author: string;
  source?: string;
  attributed?: boolean;
};

const QUOTES: Quote[] = [
  {
    text: "Travelling, it leaves you speechless, then turns you into a storyteller.",
    author: "Ibn Battuta",
    source: "traveller, 1304–1369",
    attributed: true,
  },
  {
    text: "The traveller has to knock at every alien door to come to his own, and one has to wander through all the outer worlds to reach the innermost shrine at the end.",
    author: "Rabindranath Tagore",
    source: "Gitanjali, 1912",
  },
  {
    text: "Every day is a journey, and the journey itself is home.",
    author: "Matsuo Bashō",
    source: "The Narrow Road to the Deep North, 1694",
  },
  {
    text: "Travel is fatal to prejudice, bigotry, and narrow-mindedness.",
    author: "Mark Twain",
    source: "The Innocents Abroad, 1869",
  },
  {
    text: "Traveller, there is no path. The path is made by walking.",
    author: "Antonio Machado",
    source: "Proverbios y cantares, 1912",
  },
];

const FADE_MS = 1100;

export function TravelQuotes({ intervalMs = 12000 }: { intervalMs?: number }) {
  const [index, setIndex] = useState(0);
  // Fade out, swap, fade in — rather than cross-fading, which briefly renders two quotes
  // stacked on top of each other. Tolerable with photos; with text it reads as a glitch.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let swapTimer: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setVisible(false);
      swapTimer = setTimeout(() => {
        setIndex((current) => (current + 1) % QUOTES.length);
        setVisible(true);
      }, FADE_MS);
    }, intervalMs);

    return () => {
      clearInterval(id);
      clearTimeout(swapTimer);
    };
  }, [intervalMs]);

  const showQuote = (next: number) => {
    if (next === index) return;
    setVisible(false);
    setTimeout(() => {
      setIndex(next);
      setVisible(true);
    }, FADE_MS);
  };

  const quote = QUOTES[index];

  return (
    <div>
      {/* Fixed min-height stops the card resizing as quotes of different lengths cycle —
          the Tagore line is roughly three times the Lao Tzu one. */}
      <div className="relative min-h-[168px] sm:min-h-[150px] md:min-h-[160px]">
        <figure
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity ease-in-out ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          {/* Upright rather than italic, and the same weight/tracking as section headings
              elsewhere on the site, the italic serif-ish treatment read as a different
              typeface next to the rest of the page. */}
          <blockquote className="text-xl sm:text-2xl md:text-3xl text-gray-900 leading-snug font-semibold tracking-tight">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <figcaption className="mt-4 text-base sm:text-lg font-medium text-gray-500">
            {quote.attributed ? "Attributed to " : ""}
            {quote.author}
            {quote.source ? <>, {quote.source}</> : null}
          </figcaption>
        </figure>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {QUOTES.map((q, i) => (
          <button
            key={q.author}
            type="button"
            onClick={() => showQuote(i)}
            aria-label={`Show quote ${i + 1} of ${QUOTES.length}`}
            aria-current={i === index}
            className={`h-2 w-2 rounded-full transition-all hover:scale-125 ${
              i === index ? "bg-[#159895]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
