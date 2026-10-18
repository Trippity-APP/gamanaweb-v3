"use client";

import Link from "next/link";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Sparkles, Smartphone } from "@/components/icons";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { StoreBadges } from "@/components/site/StoreBadges";
import { PersonalizationEditor } from "@/components/account/PersonalizationEditor";
import { useAuth } from "@/lib/auth/auth-context";
import { webAccountsEnabled } from "@/lib/flags";

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="container-site flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-card">{children}</div>
    </main>
  );
}

function ComingSoon() {
  return (
    <CenteredCard>
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50">
        <Smartphone className="h-6 w-6 text-brand-700" aria-hidden />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink">Gamana accounts on the web are coming soon</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Your coins, collection and bookings live in the Gamana app for now.
      </p>
      <StoreBadges source="account_coming_soon" keyword="travel guide app" className="mt-6 justify-center" />
    </CenteredCard>
  );
}

export default function AccountPage() {
  const { status, user, balance, openLogin, logout } = useAuth();

  let content: React.ReactNode;

  if (!webAccountsEnabled) {
    content = <ComingSoon />;
  } else if (status === "loading") {
    content = (
      <main id="main" className="container-site space-y-6 py-14" aria-busy="true">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </main>
    );
  } else if (status === "anonymous" || !user) {
    content = (
      <CenteredCard>
        <h1 className="font-display text-2xl font-bold text-ink">Log in to see your account</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Same account as the Gamana app — your coins, collection and bookings follow you.
        </p>
        <Button
          onClick={() => openLogin()}
          className="mt-6 h-12 w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-800 text-white"
        >
          Log in
        </Button>
      </CenteredCard>
    );
  } else {
    content = (
      <main id="main" className="container-site space-y-10 py-10 sm:py-14">
        <h1 className="text-h2 font-display font-bold text-ink">Hi {user.firstName || "there"}</h1>

        <section className="rounded-3xl bg-white p-6 shadow-card">
          <p className="eyebrow">Coins</p>
          <p className="mt-2 flex items-center gap-2 font-display text-4xl font-extrabold text-ink">
            <GamanaCoinIcon className="h-8 w-8" aria-hidden />
            {balance === null ? <Skeleton className="h-9 w-16 rounded-lg" /> : balance.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-ink-soft">Coins are shared with your Gamana app.</p>
          <Link
            href="/pricing/"
            className="focus-ring mt-4 inline-flex rounded text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Get coins
          </Link>
        </section>

        <section className="space-y-4">
          <h2 className="text-h3 flex items-center gap-2 font-display font-bold text-ink">
            <Sparkles className="h-5 w-5 text-brand-600" aria-hidden /> Personalization
          </h2>
          <PersonalizationEditor />
        </section>

        <button
          type="button"
          onClick={() => void logout()}
          className="focus-ring inline-flex items-center gap-2 rounded text-sm font-semibold text-ink-soft hover:text-ink"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Log out
        </button>
      </main>
    );
  }

  return (
    <>
      <SiteHeader variant="solid" />
      {content}
      <Footer />
    </>
  );
}
