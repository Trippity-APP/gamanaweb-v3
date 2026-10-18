"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Smartphone } from "@/components/icons";
import { StoreBadges } from "@/components/site/StoreBadges";
import { CoinChip } from "@/components/account/CoinChip";
import { ACCOUNT_SECTIONS, initialsFor } from "@/lib/account/nav";
import { useAuth } from "@/lib/auth/auth-context";
import { webAccountsEnabled } from "@/lib/flags";
import { cn } from "@/lib/utils";

const normalize = (p: string) => (p.endsWith("/") ? p : `${p}/`);

function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <div className="container-site flex min-h-[50vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-card">{children}</div>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  const path = normalize(pathname);
  return href === "/account/" ? path === href : path.startsWith(href);
}

/** Layout for every `/account/*` page: side nav on desktop, pill tabs on mobile, login gate. */
export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/account/";
  const { status, user, openLogin, logout } = useAuth();

  let content: ReactNode;

  if (!webAccountsEnabled) {
    content = (
      <CenteredCard>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50">
          <Smartphone className="h-6 w-6 text-brand-700" aria-hidden />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">Gamana accounts on the web are coming soon</h1>
        <p className="mt-2 text-sm text-ink-soft">Your coins, collection and bookings live in the Gamana app for now.</p>
        <StoreBadges source="account_coming_soon" keyword="travel guide app" className="mt-6 justify-center" />
      </CenteredCard>
    );
  } else if (status === "loading") {
    content = (
      <div className="container-site grid gap-8 py-10 lg:grid-cols-[260px_1fr]" aria-busy="true">
        <Skeleton className="hidden h-96 rounded-3xl lg:block" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </div>
    );
  } else if (status === "anonymous" || !user) {
    content = (
      <CenteredCard>
        <h1 className="font-display text-2xl font-bold text-ink">Log in to see your account</h1>
        <p className="mt-2 text-sm text-ink-soft">Same account as the Gamana app — your coins, collection and bookings follow you.</p>
        <Button
          onClick={() => openLogin()}
          className="focus-ring mt-6 h-12 w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-800 text-base font-semibold text-white"
        >
          Log in
        </Button>
      </CenteredCard>
    );
  } else {
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Your account";
    content = (
      <div className="container-site py-6 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10 lg:py-10">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                {user.profilePic && <AvatarImage src={user.profilePic} alt="" />}
                <AvatarFallback className="bg-gradient-to-r from-brand-600 to-brand-800 font-bold text-white">
                  {initialsFor(user.firstName, user.lastName, user.email || user.phone)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-display font-bold text-ink">{name}</p>
                <CoinChip className="mt-1 h-8 px-2.5 text-xs" />
              </div>
            </div>
            <nav aria-label="Account" className="mt-5 space-y-1">
              {ACCOUNT_SECTIONS.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                      active ? "bg-brand-50 text-brand-800" : "text-ink-soft hover:bg-sand-50 hover:text-ink",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    {label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => void logout()}
                className="focus-ring flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft hover:bg-sand-50 hover:text-ink"
              >
                <LogOut className="h-5 w-5" aria-hidden />
                Log out
              </button>
            </nav>
          </div>
        </aside>

        <nav aria-label="Account" className="-mx-4 mb-6 overflow-x-auto px-4 lg:hidden">
          <ul className="flex w-max gap-2">
            {ACCOUNT_SECTIONS.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold transition-colors",
                      active ? "bg-brand-700 text-white" : "bg-white text-ink-soft shadow-card hover:text-ink",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    );
  }

  return (
    <>
      <SiteHeader variant="solid" />
      <main id="main" className="min-h-[70vh] bg-sand-50">
        {content}
      </main>
      <Footer />
    </>
  );
}
