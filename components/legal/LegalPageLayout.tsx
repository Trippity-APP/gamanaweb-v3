"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "@/components/icons";
import { Calendar } from "@/components/icons";
import { cn } from "@/lib/utils";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import { EntityNotice } from "@/components/legal/EntityNotice";

type TocItem = { id: string; label: string };

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type LegalPageLayoutProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  effectiveDate: string;
  lastUpdated: string;
  children: ReactNode;
};

/**
 * Shared shell for policy pages: hero, "Who we are" entity notice, and a sticky
 * table of contents built from the article's h2s. Legal copy lives in each page.
 */
export function LegalPageLayout({ title, subtitle, icon: Icon, effectiveDate, lastUpdated, children }: LegalPageLayoutProps) {
  const articleRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    const headings = Array.from(article.querySelectorAll("h2"));
    const items = headings.map((h) => {
      if (!h.id) h.id = slug(h.textContent || "") || `section-${Math.random().toString(36).slice(2, 7)}`;
      return { id: h.id, label: h.textContent || "" };
    });
    setToc(items);

    const update = () => {
      const current = headings.filter((h) => h.getBoundingClientRect().top <= 120).pop();
      setActive(current ? current.id : headings[0]?.id ?? null);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <Header />
      <main className="bg-sand-50">
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
          <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-sunset-400/20 blur-3xl" aria-hidden />
          <div className="container-site">
            <div className="max-w-3xl">
              <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <h1 className="text-display">{title}</h1>
              <p className="text-lead mt-5 max-w-2xl text-white/85">{subtitle}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden />
                  Effective Date: {effectiveDate}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden />
                  Last Updated: {lastUpdated}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="container-site py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] xl:gap-16">
            <aside className="hidden lg:block">
              {toc.length > 0 && (
                <nav aria-label="On this page" className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">On this page</p>
                  <ol className="space-y-1 border-l border-ink/10">
                    {toc.map((t) => (
                      <li key={t.id}>
                        <a
                          href={`#${t.id}`}
                          className={cn(
                            "focus-ring -ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors",
                            active === t.id
                              ? "border-brand-600 font-semibold text-brand-800"
                              : "border-transparent text-ink-soft hover:border-ink/30 hover:text-ink"
                          )}
                        >
                          {t.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
            </aside>

            <article className="min-w-0 rounded-4xl bg-white p-6 shadow-card sm:p-10 lg:p-12">
              <div className="max-w-[70ch]">
                <EntityNotice />
                <div
                  ref={articleRef}
                  className={cn(
                    "mt-10 text-ink-soft",
                    "[&_h2]:scroll-mt-28 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-ink sm:[&_h2]:text-3xl",
                    "[&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink",
                    "[&_p]:leading-relaxed [&_li]:leading-relaxed [&_li]:marker:text-brand-500",
                    "[&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline-offset-4 hover:[&_a]:underline"
                  )}
                >
                  {children}
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
