"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Headphones,
  Hotel,
  Languages,
  MapPin,
  Share2,
  ShieldCheck,
  Users,
  X,
  Zap,
  type IconProps,
} from "@/components/icons";
import { EmptyState } from "@/components/common/EmptyState";
import { AvailabilityCard } from "@/components/experiences/AvailabilityCard";
import { ExperienceReviews } from "@/components/experiences/ExperienceReviews";
import { ExperiencesRail } from "@/components/experiences/ExperiencesRail";
import { PriceTag } from "@/components/experiences/PriceTag";
import { RatingInline } from "@/components/experiences/RatingInline";
import { WishlistButton } from "@/components/experiences/WishlistButton";
import { DetailGallery } from "@/components/marketplace/detail/DetailGallery";
import { MarketplaceCoverImage } from "@/components/marketplace/marketplace-cover-image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExperienceDetail } from "@/lib/api/schemas/experiences";
import { getExperienceDetail } from "@/lib/experiences/api";
import {
  cancellationText,
  confirmationText,
  formatDuration,
  galleryImages,
  hasFreeCancellation,
  isPickup,
  languageLabels,
  locationLabel,
  refundText,
} from "@/lib/experiences/format";
import { useAvailability } from "@/lib/experiences/use-availability";
import { isStaticSpaParam } from "@/lib/static-spa";
import { cn } from "@/lib/utils";

const MeetingPointMap = dynamic(() => import("@/components/experiences/MeetingPointMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-3xl" />,
});

function resolveSlug(param: string): string {
  if (!isStaticSpaParam(param) || typeof window === "undefined") return param;
  const match = window.location.pathname.match(/\/experiences\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : param;
}

export type LinkedStory = {
  href: string;
  title: string;
  image: string;
  narrator?: string;
  duration?: string;
};

type ExperienceDetailClientProps = {
  slugParam: string;
  initial: ExperienceDetail | null;
  linkedStory?: LinkedStory | null;
};

export function ExperienceDetailClient({ slugParam, initial, linkedStory }: ExperienceDetailClientProps) {
  const [experience, setExperience] = useState<ExperienceDetail | null>(initial);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(initial ? "ready" : "loading");

  useEffect(() => {
    const slug = resolveSlug(slugParam);
    if (isStaticSpaParam(slug)) {
      if (!initial) setStatus("missing");
      return;
    }
    const controller = new AbortController();
    getExperienceDetail(slug, controller.signal)
      .then((live) => {
        setExperience(live);
        setStatus("ready");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        if (!initial) setStatus("missing");
      });
    return () => controller.abort();
  }, [slugParam, initial]);

  if (status === "loading") return <DetailSkeleton />;
  if (status === "missing" || !experience) {
    return (
      <div className="container-site py-20">
        <EmptyState
          title="We couldn't find this experience"
          hint="It may have been removed or renamed."
          action={
            <Button asChild className="rounded-full bg-brand-700 text-white hover:bg-brand-800">
              <Link href="/experiences/">Browse experiences</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <ExperienceDetailView experience={experience} linkedStory={linkedStory ?? null} />;
}

function ExperienceDetailView({ experience, linkedStory }: { experience: ExperienceDetail; linkedStory: LinkedStory | null }) {
  const availability = useAvailability(experience);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slug = experience.slug ?? experience.id;
  const location = locationLabel(experience);
  const images = galleryImages(experience);
  const about = experience.long_description || experience.description;
  const operator = experience.operator_name;

  const share = async () => {
    const url = window.location.href.split("?")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title: experience.title, url });
        return;
      } catch {
        // Fall through to copying when the share sheet is dismissed or unavailable.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="pb-28 lg:pb-0">
      <div className="container-site pt-6 lg:pt-10">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
            <Crumb href="/experiences/">Experiences</Crumb>
            {experience.country && <Crumb href={`/experiences/?country=${encodeURIComponent(experience.country)}`}>{experience.country}</Crumb>}
            {experience.city && <Crumb href={`/experiences/?city=${encodeURIComponent(experience.city)}`}>{experience.city}</Crumb>}
          </ol>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-display-title text-3xl text-ink sm:text-4xl">{experience.title}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
              <RatingInline rating={experience.average_rating} count={experience.review_count} />
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {location}
                </span>
              )}
              {operator && <span>by {operator}</span>}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={share}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-sand-200 bg-white px-4 text-sm font-semibold text-ink hover:border-brand-300"
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Share
            </button>
            <WishlistButton experienceRef={slug} variant="inline" />
          </div>
        </div>

        <div className="mt-6">
          <DetailGallery
            cover={{ src: images[0] ?? "", alt: experience.title }}
            extras={images.slice(1).map((src) => ({ src, alt: experience.title }))}
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <KeyFacts experience={experience} />

            {experience.why_gamana_recommends && (
              <Section>
                <div className="rounded-3xl bg-brand-50 p-6">
                  <p className="eyebrow text-brand-700">Gamana pick</p>
                  <p className="mt-2 text-ink">{experience.why_gamana_recommends}</p>
                </div>
              </Section>
            )}

            {linkedStory && <ListenBeforeYouGo story={linkedStory} />}

            {experience.highlights.length > 0 && (
              <Section title="Highlights">
                <CheckList items={experience.highlights} />
              </Section>
            )}

            {about && (
              <Section title="About this experience">
                <ClampedText text={about} />
              </Section>
            )}

            {(experience.inclusions.length > 0 || experience.exclusions.length > 0) && (
              <Section title="What's included">
                <div className="grid gap-6 sm:grid-cols-2">
                  {experience.inclusions.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-ink">Included</h3>
                      <CheckList items={experience.inclusions} />
                    </div>
                  )}
                  {experience.exclusions.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-ink">Not included</h3>
                      <ul className="space-y-2">
                        {experience.exclusions.map((item) => (
                          <li key={item} className="flex gap-2 text-sm text-ink-soft">
                            <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Section>
            )}

            <Itinerary items={experience.itinerary} />
            <MeetingPoint experience={experience} />
            <BeforeYouGo experience={experience} />

            {(cancellationText(experience) || refundText(experience) || operator) && (
              <Section title="Cancellation & refunds">
                <div className="space-y-3 text-sm leading-relaxed text-ink">
                  {cancellationText(experience) && <p>{cancellationText(experience)}</p>}
                  {refundText(experience) && <p className="text-ink-soft">{refundText(experience)}</p>}
                  {operator && <p className="text-ink-soft">You pay {operator} directly. Refunds are handled by the operator.</p>}
                </div>
              </Section>
            )}

            <Section title="Reviews">
              <ExperienceReviews slug={slug} />
            </Section>

            {operator && (
              <Section title="Operator">
                <p className="font-semibold text-ink">{operator}</p>
                <p className="mt-1 text-sm text-ink-soft">Bookings are fulfilled and paid to {operator}.</p>
              </Section>
            )}
          </div>

          <aside className="hidden lg:block" aria-label="Availability">
            <div className="sticky top-28">
              <AvailabilityCard experience={experience} state={availability} />
            </div>
          </aside>
        </div>
      </div>

      {experience.city && (
        <ExperiencesRail
          title={`More experiences in ${experience.city}`}
          query={{ city: experience.city, page_size: 9 }}
          seeAllHref={`/experiences/?city=${encodeURIComponent(experience.city)}`}
          excludeId={experience.id}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-3">
          <PriceTag amount={experience.from_price} currency={experience.currency} compareAt={experience.compare_at_price} className="flex-1" />
          <Button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="h-12 rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 px-6 text-base font-semibold text-white hover:from-sunset-500 hover:to-sunset-500"
          >
            Check availability
          </Button>
        </div>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-xl">Check availability</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <AvailabilityCard experience={experience} state={availability} bare />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function Crumb({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <Link href={href} className="focus-ring rounded transition-colors hover:text-ink">
        {children}
      </Link>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
    </li>
  );
}

function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="border-t border-sand-200 py-8 first:border-t-0 first:pt-0">
      {title && <h2 className="text-h3 mb-4 text-ink">{title}</h2>}
      {children}
    </section>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-ink">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ClampedText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 480 || text.split("\n").length > 6;
  return (
    <div>
      <p className={cn("whitespace-pre-line text-sm leading-relaxed text-ink", !open && long && "line-clamp-6")}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="focus-ring mt-2 rounded text-sm font-semibold text-brand-700 hover:underline" aria-expanded={open}>
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

type Fact = { key: string; label: string; value: string; Icon: ComponentType<IconProps> };

function KeyFacts({ experience }: { experience: ExperienceDetail }) {
  const facts: Fact[] = [];
  const duration = formatDuration(experience.duration_minutes);
  if (duration) facts.push({ key: "duration", label: "Duration", value: duration, Icon: Clock });
  const langs = languageLabels(experience.languages);
  if (langs.length) facts.push({ key: "lang", label: "Languages", value: langs.join(", "), Icon: Languages });
  if (isPickup(experience)) facts.push({ key: "pickup", label: "Pickup", value: experience.pickup_optional ? "Pickup available" : "Hotel pickup", Icon: Hotel });
  else if (experience.meeting_point_text || experience.meeting_point_address)
    facts.push({ key: "meet", label: "Meeting point", value: "See details below", Icon: MapPin });
  const confirmation = confirmationText(experience);
  if (confirmation) facts.push({ key: "confirm", label: "Confirmation", value: confirmation, Icon: Zap });
  const cancel = cancellationText(experience);
  if (cancel) facts.push({ key: "cancel", label: "Cancellation", value: hasFreeCancellation(experience) ? "Free cancellation" : cancel, Icon: hasFreeCancellation(experience) ? CheckCircle2 : ShieldCheck });
  const maxGroup = Math.max(0, ...experience.guest_types.map((g) => g.max_quantity ?? 0));
  if (maxGroup > 0 && maxGroup < 99) facts.push({ key: "group", label: "Group size", value: `Up to ${maxGroup}`, Icon: Users });

  if (!facts.length) return null;
  return (
    <Section>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {facts.map(({ key, label, value, Icon }) => (
          <li key={key} className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-ink-soft">{label}</span>
              <span className="block text-sm font-semibold text-ink [overflow-wrap:anywhere]">{value}</span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

type ItineraryStop = { title: string; description?: string; duration?: string };

function toStops(items: unknown[]): ItineraryStop[] {
  return items.flatMap((raw) => {
    if (typeof raw === "string") return raw.trim() ? [{ title: raw.trim() }] : [];
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Record<string, unknown>;
    const title = [row.title, row.name, row.heading].find((v): v is string => typeof v === "string" && !!v.trim());
    const description = [row.description, row.body, row.text].find((v): v is string => typeof v === "string" && !!v.trim());
    if (!title && !description) return [];
    const minutes = typeof row.duration_minutes === "number" ? row.duration_minutes : null;
    return [{ title: title ?? description!, description: title ? description : undefined, duration: formatDuration(minutes) ?? undefined }];
  });
}

function Itinerary({ items }: { items: unknown[] }) {
  const stops = toStops(items);
  if (!stops.length) return null;
  return (
    <Section title="Itinerary">
      <ol className="relative space-y-6 border-l-2 border-brand-100 pl-6">
        {stops.map((stop, i) => (
          <li key={`${stop.title}-${i}`} className="relative">
            <span className="absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">{i + 1}</span>
            <p className="font-semibold text-ink">{stop.title}</p>
            {stop.duration && <p className="text-xs text-ink-soft">{stop.duration}</p>}
            {stop.description && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{stop.description}</p>}
          </li>
        ))}
      </ol>
    </Section>
  );
}

function MeetingPoint({ experience }: { experience: ExperienceDetail }) {
  const pickup = isPickup(experience);
  const { latitude: lat, longitude: lng } = experience;
  const hasCoords = typeof lat === "number" && typeof lng === "number" && (lat !== 0 || lng !== 0);
  const text = experience.meeting_point_text;
  const address = experience.meeting_point_address;
  if (!pickup && !text && !address && !hasCoords) return null;

  return (
    <Section title={pickup ? "Pickup" : "Meeting point"}>
      <div className="space-y-2 text-sm text-ink">
        {pickup && <p>Pickup available from selected hotels — choose at checkout.</p>}
        {text && <p>{text}</p>}
        {address && <p className="text-ink-soft">{address}</p>}
      </div>
      {hasCoords && (
        <div className="mt-4 space-y-3">
          <MeetingPointMap lat={lat!} lng={lng!} label={`Map of ${pickup ? "the pickup area" : "the meeting point"}`} />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-700 hover:underline"
          >
            Open in Google Maps
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      )}
    </Section>
  );
}

function BeforeYouGo({ experience }: { experience: ExperienceDetail }) {
  const groups = [
    { key: "know", title: "Know before you go", items: experience.know_before_you_go },
    { key: "unsuitable", title: "Not suitable for", items: experience.not_suitable_for },
    { key: "bring", title: "What to bring", items: experience.what_to_bring },
    { key: "info", title: "Important information", items: experience.important_information },
  ].filter((g) => g.items.length > 0);
  if (!groups.length) return null;

  return (
    <Section title="Before you go">
      <Accordion type="multiple" defaultValue={groups.map((g) => g.key)}>
        {groups.map((group) => (
          <AccordionItem key={group.key} value={group.key}>
            <AccordionTrigger className="text-sm font-semibold text-ink">{group.title}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

function ListenBeforeYouGo({ story }: { story: LinkedStory }) {
  const meta = [story.narrator, story.duration].filter(Boolean).join(" · ");
  return (
    <Section title="Listen before you go">
      <Link
        href={story.href}
        className="focus-ring group flex items-center gap-4 rounded-3xl bg-white p-3 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand-100 sm:h-28 sm:w-28">
          <MarketplaceCoverImage src={story.image} alt="" fill useDefaultFallback className="object-cover" />
        </div>
        <div className="min-w-0 flex-1 py-1 pr-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            <Headphones className="h-3.5 w-3.5" aria-hidden />
            Audio story
          </p>
          <p className="mt-1 line-clamp-2 font-display text-base font-bold leading-snug text-ink group-hover:text-brand-800">
            {story.title}
          </p>
          {meta && <p className="mt-1 text-sm text-ink-soft">{meta}</p>}
          <p className="mt-2 text-xs text-ink-muted">Unlock it with coins and listen in the Gamana app.</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </Section>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-site space-y-6 py-10" aria-busy="true" aria-label="Loading experience">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-[240px] w-full rounded-4xl sm:h-[340px] lg:h-[420px]" />
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
        <Skeleton className="hidden h-80 w-full rounded-3xl lg:block" />
      </div>
    </div>
  );
}
