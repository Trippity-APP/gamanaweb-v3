"use client";

import { useState } from "react";
import { Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ResponsiveSheet } from "@/components/common/ResponsiveSheet";
import { StoreBadges } from "@/components/site/StoreBadges";
import { StatsStrip } from "@/components/site/StatsStrip";
import { TrustBar } from "@/components/site/TrustBar";
import { PromoBanner } from "@/components/site/PromoBanner";
import { TourCard } from "@/components/site/TourCard";
import { CityTile } from "@/components/site/CityTile";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { CoinChip } from "@/components/account/CoinChip";
import { DESTINATION_IMAGES } from "@/lib/data/destination-images";
import { getPhoto } from "@/lib/images";
import { durations, easings } from "@/lib/guidelines/tokens";
import { ComponentCard } from "../ComponentCard";
import { CopyChip } from "../CopyChip";
import { SectionHeader, SubHeading } from "../SectionHeader";

const BUTTON_STATE: Record<string, string> = {
  default: "",
  hover: "bg-primary/90",
  "focus-visible": "ring-2 ring-ring ring-offset-2",
  active: "scale-95",
  disabled: "",
  loading: "",
};

function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open sheet</Button>
      <ResponsiveSheet
        open={open}
        onOpenChange={setOpen}
        title="Download for offline"
        description="Stories play without signal once downloaded."
        footer={<Button onClick={() => setOpen(false)}>Done</Button>}
      >
        <p className="text-sm text-ink-soft">Bottom sheet on mobile, dialog on desktop. Focus is trapped while open.</p>
      </ResponsiveSheet>
    </>
  );
}

export function Components() {
  const city = DESTINATION_IMAGES[5];
  const tourPhoto = getPhoto("slide-varanasi");

  return (
    <section id="components" className="scroll-mt-32">
      <SectionHeader
        id="components"
        number={7}
        title="UI components"
        intro="These are the site's real components, imported from the codebase, not lookalikes. Use the toggles to see states and the code panel to copy usage."
      />

      <SubHeading id="components-actions">Actions</SubHeading>
      <div className="grid gap-4">
        <ComponentCard
          title="Button"
          source="components/ui/button"
          usage="shadcn button for app UI and forms. Marketing CTAs use pill buttons; never more than one primary per view."
          code={`import { Button } from "@/components/ui/button";\n\n<Button variant="default" size="default">Get the app</Button>`}
          controls={{
            variant: { label: "Variant", options: ["default", "secondary", "outline", "ghost", "link", "destructive"] as const },
            size: { label: "Size", options: ["default", "sm", "lg"] as const },
            state: { label: "State", options: ["default", "hover", "focus-visible", "active", "disabled", "loading"] as const },
          }}
        >
          {({ variant, size, state }) => (
            <Button variant={variant} size={size} disabled={state === "disabled" || state === "loading"} className={BUTTON_STATE[state]}>
              {state === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              {state === "loading" ? "Loading" : "Get the app"}
            </Button>
          )}
        </ComponentCard>
        <ComponentCard
          title="Store badges"
          source="components/site/StoreBadges"
          usage="Official, unaltered badges. Always both, App Store first, tracked with a source name."
          code={`import { StoreBadges } from "@/components/site/StoreBadges";\n\n<StoreBadges source="home_hero" size="md" />`}
          controls={{ size: { label: "Size", options: ["md", "lg"] as const } }}
        >
          {({ size }) => <StoreBadges source="guidelines_preview" size={size} />}
        </ComponentCard>
      </div>

      <SubHeading id="components-chips">Chips, stats and promos</SubHeading>
      <div className="grid gap-4">
        <ComponentCard
          title="Trust bar (feature pills)"
          source="components/site/TrustBar"
          usage="Short, factual claims with a filled icon. Five at most."
          code={`import { TrustBar } from "@/components/site/TrustBar";\n\n<TrustBar />`}
        >
          {() => <TrustBar />}
        </ComponentCard>
        <ComponentCard
          title="Stat block"
          source="components/site/StatsStrip"
          usage="Numbers from lib/data/site-stats.ts only, so every page shows the same figures."
          code={`import { StatsStrip } from "@/components/site/StatsStrip";\n\n<StatsStrip tone="light" />`}
          controls={{ tone: { label: "Tone", options: ["light", "dark"] as const } }}
        >
          {({ tone }) => (
            <div className={tone === "dark" ? "w-full rounded-2xl bg-brand-950 p-6" : "w-full"}>
              <StatsStrip tone={tone} />
            </div>
          )}
        </ComponentCard>
        <ComponentCard
          title="Promo banner"
          source="components/site/PromoBanner"
          usage="One per page. Eyebrow names the offer type (NEW USER, BUNDLE & SAVE)."
          code={`import { PromoBanner } from "@/components/site/PromoBanner";\n\n<PromoBanner tone="sunset" eyebrow="New user" title="Claim your free 5 Coins" cta={{ href: "/coins/", label: "Claim offer" }} />`}
          controls={{ tone: { label: "Tone", options: ["sunset", "brand"] as const } }}
        >
          {({ tone }) => (
            <PromoBanner
              className="w-full"
              tone={tone}
              eyebrow={tone === "sunset" ? "New user" : "Bundle & save"}
              title={tone === "sunset" ? "Claim your free 5 Coins" : "Three cities, one bundle"}
              text="Unlock your first story on us."
              cta={{ href: "/coins/", label: tone === "sunset" ? "Claim offer" : "View bundle" }}
            />
          )}
        </ComponentCard>
        <ComponentCard
          title="Coins"
          source="components/account/CoinChip · components/GamanaCoinIcon"
          usage="Coins always use the Gamana coin icon and the word “Coins”. The chip shows the live balance when signed in."
          code={`import { CoinChip } from "@/components/account/CoinChip";\n\n<CoinChip />`}
          stage="sand"
        >
          {() => (
            <>
              <CoinChip />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-ink shadow-card">
                <GamanaCoinIcon className="h-4 w-4" aria-hidden /> 40 Coins
              </span>
            </>
          )}
        </ComponentCard>
      </div>

      <SubHeading id="components-cards">Cards</SubHeading>
      <div className="grid gap-4 md:grid-cols-2">
        <ComponentCard
          title="Tour card"
          source="components/site/TourCard"
          usage="4:3 image, location, one-line description and a single CTA."
          code={`import { TourCard } from "@/components/site/TourCard";\n\n<TourCard href="/cities/varanasi/" title="Varanasi Ghats" location="Varanasi, India" image="…" imageAlt="…" />`}
          stage="sand"
        >
          {() => (
            <TourCard
              className="w-full max-w-xs"
              href="/cities/"
              title="Varanasi Ghats"
              description="Evening aarti, boatmen and the oldest living city."
              location="Varanasi, India"
              image={tourPhoto.src}
              imageAlt={tourPhoto.alt}
              badge="Audio walk"
            />
          )}
        </ComponentCard>
        <ComponentCard
          title="City tile"
          source="components/site/CityTile"
          usage="Portrait 4:5 tile for city rails and grids. Zooms gently on hover."
          code={`import { CityTile } from "@/components/site/CityTile";\n\n<CityTile href="/cities/jaipur/" name="Jaipur" country="India" image={image} meta="12 stories" />`}
          stage="sand"
        >
          {() => <CityTile href="/cities/" name="Jaipur" country="India" image={city.image} meta="12 stories" />}
        </ComponentCard>
      </div>

      <SubHeading id="components-forms">Forms and feedback</SubHeading>
      <div className="grid gap-4 md:grid-cols-2">
        <ComponentCard
          title="Text input"
          source="components/ui/input"
          usage="Visible label above, error text below and announced with aria-live."
          code={`<label htmlFor="email">Email</label>\n<Input id="email" type="email" aria-invalid={!!error} aria-describedby="email-error" />\n<p id="email-error" aria-live="polite">{error}</p>`}
          controls={{ state: { label: "State", options: ["default", "error", "disabled"] as const } }}
        >
          {({ state }) => (
            <div className="w-full max-w-xs">
              <label htmlFor="g-demo-email" className="text-sm font-medium text-ink">Email</label>
              <Input
                id="g-demo-email"
                type="email"
                placeholder="you@example.com"
                disabled={state === "disabled"}
                aria-invalid={state === "error"}
                aria-describedby="g-demo-email-error"
                className={state === "error" ? "mt-1 border-red-700" : "mt-1"}
              />
              <p id="g-demo-email-error" aria-live="polite" className="mt-1 min-h-[20px] text-sm text-red-700">
                {state === "error" ? "Enter an email like name@example.com." : ""}
              </p>
            </div>
          )}
        </ComponentCard>
        <ComponentCard
          title="One-time code"
          source="components/ui/input-otp"
          usage="Six digits for sign-in. Paste fills every slot."
          code={`<InputOTP maxLength={6}>\n  <InputOTPGroup>{[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>\n</InputOTP>`}
        >
          {() => (
            <InputOTP maxLength={6} aria-label="One-time code">
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        </ComponentCard>
        <ComponentCard
          title="Select"
          source="components/ui/select"
          usage="For short fixed lists such as language. Use search for long lists like cities."
          code={`<Select>\n  <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>\n  <SelectContent><SelectItem value="en">English</SelectItem></SelectContent>\n</Select>`}
        >
          {() => (
            <Select>
              <SelectTrigger className="w-56" aria-label="Story language">
                <SelectValue placeholder="Story language" />
              </SelectTrigger>
              <SelectContent>
                {["English", "Hindi", "French", "Spanish"].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </ComponentCard>
        <ComponentCard
          title="Toast"
          source="hooks/use-toast · components/ui/toaster"
          usage="Brief confirmations only. Never put the only copy of important information in a toast."
          code={`import { toast } from "@/hooks/use-toast";\n\ntoast({ title: "Saved to your collection" });`}
        >
          {() => <Button onClick={() => toast({ title: "Saved to your collection" })}>Show toast</Button>}
        </ComponentCard>
        <ComponentCard
          title="Responsive sheet"
          source="components/common/ResponsiveSheet"
          usage="Bottom sheet on mobile, centred dialog on desktop. Use for short, focused tasks."
          code={`<ResponsiveSheet open={open} onOpenChange={setOpen} title="Download for offline">…</ResponsiveSheet>`}
        >
          {() => <SheetDemo />}
        </ComponentCard>
        <ComponentCard
          title="Skeleton"
          source="components/ui/skeleton"
          usage="Match the shape of the content that is loading. Pair with an aria-busy container."
          code={`<Skeleton className="h-40 w-full rounded-3xl" />`}
        >
          {() => (
            <div className="w-full max-w-xs space-y-3" aria-busy="true" aria-label="Loading example">
              <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
        </ComponentCard>
      </div>

      <SubHeading id="components-faq">FAQ</SubHeading>
      <ComponentCard
        title="FAQ accordion"
        source="components/site/FaqAccordion"
        usage="Questions in the visitor's words; answers in two or three sentences. Add withSchema on SEO pages."
        code={`import { FaqAccordion } from "@/components/site/FaqAccordion";\n\n<FaqAccordion items={faqs} withSchema />`}
      >
        {() => (
          <FaqAccordion
            className="w-full"
            items={[
              { question: "Do I need mobile data while walking?", answer: "No. Download a walk before you go and it plays offline." },
              { question: "Can I pause and come back later?", answer: "Yes. Walks are self-paced and remember where you stopped." },
            ]}
          />
        )}
      </ComponentCard>

      <SubHeading id="components-motion">Motion</SubHeading>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-g-border bg-g-card p-6">
          <p className="font-semibold text-g-fg">Easings</p>
          <ul className="mt-3 space-y-3">
            {easings.map((e) => (
              <li key={e.name} className="text-sm">
                <span className="text-g-fg">{e.name}</span> <span className="text-g-fg-subtle">· {e.usage}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  <CopyChip value={e.tailwind} label="Class" />
                  <CopyChip value={e.value} label="CSS" />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-g-border bg-g-card p-6">
          <p className="font-semibold text-g-fg">Durations</p>
          <ul className="mt-3 divide-y divide-g-border text-sm">
            {durations.map((d) => (
              <li key={d.name} className="flex justify-between gap-4 py-2">
                <span className="text-g-fg">{d.name}</span>
                <span className="text-g-fg-muted">{d.usage}</span>
                <span className="font-mono text-g-fg">{d.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-g-fg-muted">
            With reduced motion on, the site cuts animations to near zero and reveals content immediately.
          </p>
        </div>
      </div>
    </section>
  );
}
