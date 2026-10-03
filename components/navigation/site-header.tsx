"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Smartphone,
  Search,
  BookOpen,
  Headphones,
  Mic,
  Route,
  Languages,
} from "@/components/icons";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Drawer as DrawerPrimitive } from "vaul";
import { categoryNavItems, companyNavItems, featureItems } from "@/lib/data/nav-config";
import { FEATURED_CITIES } from "@/lib/data/home";
import { cn } from "@/lib/utils";
import { useAccount } from "@/lib/account-context";
import { AccountMenu } from "@/components/navigation/AccountMenu";
import { StoreBadges } from "@/components/site/StoreBadges";
import { HeroCitySearch } from "@/components/HeroCitySearch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { IconTile, toneFor, type TileIcon } from "@/components/icons/IconTile";

const normalize = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

const FEATURE_ICONS: Record<string, TileIcon> = {
  "/features/exquisite-storytelling": BookOpen,
  "/features/truly-immersive": Headphones,
  "/features/virtual-travel-guides": Mic,
  "/features/gamana-coins": GamanaCoinIcon,
  "/features/user-generated-tours": Route,
  "/features/local-languages": Languages,
};

const DESTINATIONS = FEATURED_CITIES.map((c) => ({
  ...c,
  href: `/cities/${c.id}/`,
  thumb: c.image.photo?.srcSet[0].src ?? c.image.src,
}));

interface SiteHeaderProps {
  /** "transparent" pages draw their hero under the header; "solid" pages get a spacer. */
  variant?: "transparent" | "solid";
  /** Header search; defaults to the site-wide search. */
  search?: ReactNode;
  /** When set, the header search only appears once this element scrolls out of view. */
  searchAnchorId?: string;
}

export default function SiteHeader({ variant = "solid", search, searchAnchorId }: SiteHeaderProps) {
  const pathname = normalize(usePathname() || "/");
  const { account } = useAccount();
  const loggedIn = !!account;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoriesHidden, setCategoriesHidden] = useState(false);
  const [showSearch, setShowSearch] = useState(!searchAnchorId);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - lastY.current) > 6) {
        setCategoriesHidden(y > 160 && y > lastY.current);
        lastY.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!searchAnchorId) return;
    const anchor = document.getElementById(searchAnchorId);
    if (!anchor || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSearch(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: "-64px 0px 0px 0px" }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [searchAnchorId]);

  const isActive = (href: string) => pathname === normalize(href) || pathname.startsWith(`${normalize(href)}/`);
  const destinationsActive = pathname.startsWith("/cities");
  const featuresActive = pathname.startsWith("/features");
  const headerSearch = search ?? <HeroCitySearch size="sm" containerClassName="relative w-full" />;

  const tabClass = (active: boolean) =>
    cn(
      "focus-ring relative inline-flex h-11 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors duration-200",
      "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:rounded-full after:bg-sunset-500 after:transition-transform after:duration-300 after:ease-out-expo",
      active
        ? "font-semibold text-ink after:scale-x-100"
        : "text-ink-soft hover:text-ink after:scale-x-0 hover:after:scale-x-100"
    );

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div
          className={cn(
            "pointer-events-auto relative z-20 border-b bg-white transition-shadow duration-300",
            scrolled && (categoriesHidden ? "border-ink/10 shadow-[0_8px_30px_-12px_rgba(15,27,36,0.18)]" : "border-ink/5")
          )}
          style={{ borderBottomColor: scrolled ? undefined : "transparent" }}
        >
          <div className="container-site flex h-14 items-center gap-3 lg:h-16 lg:gap-6">
            <button
              type="button"
              className="focus-ring -ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="focus-ring flex shrink-0 items-center rounded" aria-label="Gamana home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gamana-logo.svg" alt="Gamana Logo" title="Gamana Logo" className="h-8 w-auto lg:h-9" />
            </Link>

            <div
              className={cn(
                "hidden min-w-0 flex-1 transition-all duration-500 ease-out-expo md:block",
                showSearch ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
              )}
              aria-hidden={!showSearch}
              {...inertWhen(!showSearch)}
            >
              <div className="max-w-md">{headerSearch}</div>
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                className="focus-ring grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden"
                onClick={() => setMobileSearchOpen((v) => !v)}
                aria-label={mobileSearchOpen ? "Close search" : "Search"}
                aria-expanded={mobileSearchOpen}
              >
                {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>
              <GetTheAppButton />
              {loggedIn && <AccountMenu />}
            </div>
          </div>

          {mobileSearchOpen && (
            <div className="container-site pb-3 md:hidden">
              <HeroCitySearch size="sm" containerClassName="relative w-full" />
            </div>
          )}
        </div>

        <div
          className={cn(
            "relative z-10 hidden border-b border-ink/5 bg-white transition-[transform,box-shadow] duration-300 ease-out-expo lg:block",
            categoriesHidden ? "pointer-events-none -translate-y-full" : "pointer-events-auto",
            scrolled && !categoriesHidden && "shadow-[0_8px_30px_-12px_rgba(15,27,36,0.15)]"
          )}
          {...inertWhen(categoriesHidden)}
        >
          <NavigationMenu.Root className="container-site relative" delayDuration={80} aria-label="Main navigation">
            <NavigationMenu.List className="-ml-3 flex list-none items-center">
              <NavigationMenu.Item>
                <NavigationMenu.Trigger className={cn(tabClass(destinationsActive), "group")}>
                  Destinations
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" aria-hidden />
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="w-[44rem] p-4">
                  <p className="px-1 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Popular destinations</p>
                  <ul className="grid grid-cols-4 gap-3">
                    {DESTINATIONS.map((city) => (
                      <li key={city.id}>
                        <NavigationMenu.Link asChild active={pathname === normalize(city.href)}>
                          <Link href={city.href} className="focus-ring group/city block rounded-2xl p-1.5 transition-colors hover:bg-sand-50">
                            <span className="block aspect-[4/3] overflow-hidden rounded-xl bg-sand-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={encodeURI(city.thumb)}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 ease-out-expo group-hover/city:scale-105"
                              />
                            </span>
                            <span className="mt-2 block px-1 text-sm font-semibold text-ink group-hover/city:text-brand-700">{city.name}</span>
                            <span className="block px-1 text-xs text-ink-muted">{city.tagline}</span>
                          </Link>
                        </NavigationMenu.Link>
                      </li>
                    ))}
                  </ul>
                  <NavigationMenu.Link asChild>
                    <Link
                      href="/cities/"
                      className="focus-ring group/all mt-3 flex items-center justify-between rounded-2xl bg-sand-50 px-4 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
                    >
                      Browse all cities
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/all:translate-x-1" aria-hidden />
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Content>
              </NavigationMenu.Item>

              {categoryNavItems.tours.map((item) => (
                <NavigationMenu.Item key={item.href}>
                  <NavigationMenu.Link asChild active={isActive(item.href)}>
                    <Link href={`${item.href}/`} className={tabClass(isActive(item.href))} aria-current={isActive(item.href) ? "page" : undefined}>
                      {item.name}
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ))}

              <NavigationMenu.Item>
                <NavigationMenu.Trigger className={cn(tabClass(featuresActive), "group")}>
                  Features
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" aria-hidden />
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="w-[36rem] p-3">
                  <ul className="grid grid-cols-2 gap-1">
                    {featureItems.map((item, i) => {
                      const icon = FEATURE_ICONS[item.href] ?? BookOpen;
                      return (
                        <li key={item.href}>
                          <NavigationMenu.Link asChild active={pathname === item.href}>
                            <Link
                              href={`${item.href}/`}
                              className="focus-ring group/item flex gap-3 rounded-2xl p-3 transition-colors hover:bg-brand-50 data-[active]:bg-brand-50"
                            >
                              <IconTile icon={icon} tone={toneFor(i)} size="sm" className="h-10 w-10" />
                              <span>
                                <span className="block text-sm font-semibold text-ink group-hover/item:text-brand-700">{item.name}</span>
                                <span className="mt-0.5 block text-xs leading-snug text-ink-muted">{item.description}</span>
                              </span>
                            </Link>
                          </NavigationMenu.Link>
                        </li>
                      );
                    })}
                  </ul>
                  <NavigationMenu.Link asChild>
                    <Link
                      href="/features/"
                      className="focus-ring group/all mt-2 flex items-center justify-between rounded-2xl bg-sand-50 px-4 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
                    >
                      All features
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/all:translate-x-1" aria-hidden />
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Content>
              </NavigationMenu.Item>

              {categoryNavItems.more.map((item) => (
                <NavigationMenu.Item key={item.href}>
                  <NavigationMenu.Link asChild active={isActive(item.href)}>
                    <Link href={`${item.href}/`} className={tabClass(isActive(item.href))} aria-current={isActive(item.href) ? "page" : undefined}>
                      {item.name}
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ))}
            </NavigationMenu.List>

            <div className="absolute left-0 top-full pt-2">
              <NavigationMenu.Viewport className="relative h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)] origin-top-left overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-lift transition-[width,height] duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95" />
            </div>
          </NavigationMenu.Root>
        </div>
      </header>

      {variant === "solid" && <div aria-hidden className="h-14 lg:h-[109px]" />}

      <MobileDrawer open={isMenuOpen} onOpenChange={setIsMenuOpen} isActive={isActive} />
    </>
  );
}

const GET_APP_BUTTON =
  "focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 px-3 text-sm font-semibold text-white shadow-card transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift active:scale-95 sm:px-4";

function GetTheAppLabel() {
  return (
    <>
      <Smartphone className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">Get the app</span>
      <span className="sr-only sm:hidden">Get the app</span>
    </>
  );
}

function GetTheAppButton() {
  // Radix ids differ between the static HTML and the client tree, so the popover mounts after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <button type="button" className={GET_APP_BUTTON} aria-haspopup="dialog" aria-expanded={false}>
        <GetTheAppLabel />
      </button>
    );
  }
  return (
    <Popover>
      <PopoverTrigger className={GET_APP_BUTTON}>
        <GetTheAppLabel />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-80 rounded-3xl border-ink/5 bg-white p-5 shadow-lift">
        <p className="font-display text-lg font-bold text-ink">Listen on the go</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Audio tours that play as you walk, offline and in 7 languages.
        </p>
        <StoreBadges source="header" keyword="travel guide app" className="mt-4" />
        <Link
          href="/download-app/"
          className="focus-ring group mt-4 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Why download Gamana
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
      </PopoverContent>
    </Popover>
  );
}

const inertWhen = (on: boolean) => ({ inert: on || undefined }) as Record<string, boolean | undefined>;

const drawerItem = (active: boolean) =>
  cn(
    "focus-ring flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl px-4 text-base font-semibold transition-colors",
    active ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-ink/5"
  );

function DrawerSection({ title, active, children }: { title: string; active: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(active);
  return (
    <div>
      <button type="button" className={drawerItem(active)} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {title}
        <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>
      <div
        className={cn("grid transition-[grid-template-rows] duration-300 ease-out-expo", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
        {...inertWhen(!open)}
      >
        <div className="overflow-hidden">
          <div className="px-2 pb-3 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function DrawerFooterLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="focus-ring group mt-2 flex min-h-12 items-center justify-between rounded-2xl bg-sand-50 px-4 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}

function MobileDrawer({
  open,
  onOpenChange,
  isActive,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isActive: (href: string) => boolean;
}) {
  const pathname = normalize(usePathname() || "/");
  const { account, coinBalance, logout } = useAccount();
  const close = () => onOpenChange(false);
  const moreLinks = companyNavItems.filter((i) => ["/about", "/faq", "/contact"].includes(i.href));

  const topLink = (item: { name: string; href: string }) => (
    <Link
      key={item.href}
      href={`${item.href}/`}
      onClick={close}
      aria-current={isActive(item.href) ? "page" : undefined}
      className={drawerItem(isActive(item.href))}
    >
      {item.name}
    </Link>
  );

  return (
    <DrawerPrimitive.Root direction="left" open={open} onOpenChange={onOpenChange}>
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 z-[90] bg-ink/50 backdrop-blur-sm lg:hidden" />
        <DrawerPrimitive.Content
          className="fixed inset-y-0 left-0 z-[100] flex w-full flex-col bg-white outline-none sm:w-[26rem] sm:rounded-r-4xl lg:hidden"
          aria-describedby={undefined}
        >
          <DrawerPrimitive.Title className="sr-only">Site menu</DrawerPrimitive.Title>
          <div className="flex items-center justify-between px-6 pb-4 pt-5">
            <Link href="/" onClick={close} className="focus-ring shrink-0 rounded" aria-label="Gamana home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gamana-logo.svg" alt="Gamana Logo" title="Gamana Logo" className="h-8" />
            </Link>
            <DrawerPrimitive.Close className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-ink/5 text-ink" aria-label="Close menu">
              <X className="h-6 w-6" />
            </DrawerPrimitive.Close>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4" aria-label="Mobile navigation">
            <DrawerSection title="Destinations" active={pathname.startsWith("/cities")}>
              <ul className="grid grid-cols-2 gap-3">
                {DESTINATIONS.map((city) => (
                  <li key={city.id}>
                    <Link
                      href={city.href}
                      onClick={close}
                      aria-current={pathname === normalize(city.href) ? "page" : undefined}
                      className="focus-ring group/city block rounded-2xl p-1 transition-colors hover:bg-sand-50"
                    >
                      <span className="block aspect-[4/3] overflow-hidden rounded-xl bg-sand-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={encodeURI(city.thumb)} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </span>
                      <span className="mt-1.5 block px-1 text-sm font-semibold text-ink">{city.name}</span>
                      <span className="block truncate px-1 text-xs text-ink-muted">{city.tagline}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <DrawerFooterLink href="/cities/" label="Browse all cities" onNavigate={close} />
            </DrawerSection>

            {categoryNavItems.tours.map(topLink)}

            <DrawerSection title="Features" active={pathname.startsWith("/features")}>
              <ul className="space-y-1">
                {featureItems.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      href={`${item.href}/`}
                      onClick={close}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={cn(
                        "focus-ring flex min-h-12 items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-brand-50",
                        pathname === item.href && "bg-brand-50"
                      )}
                    >
                      <IconTile icon={FEATURE_ICONS[item.href] ?? BookOpen} tone={toneFor(i)} size="sm" className="h-10 w-10" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">{item.name}</span>
                        <span className="block text-xs leading-snug text-ink-muted">{item.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <DrawerFooterLink href="/features/" label="All features" onNavigate={close} />
            </DrawerSection>

            {categoryNavItems.more.map(topLink)}

            <DrawerSection title="More" active={moreLinks.some((i) => isActive(i.href))}>
              <ul className="space-y-0.5">
                {moreLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`${item.href}/`}
                      onClick={close}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "focus-ring flex min-h-12 items-center rounded-xl px-4 text-sm transition-colors hover:bg-ink/5 hover:text-ink",
                        isActive(item.href) ? "font-semibold text-brand-800" : "text-ink-soft"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </DrawerSection>

            {account && (
              <div className="mt-3 space-y-1 border-t border-ink/5 pt-3">
                <Link href="/pricing/" onClick={close} className={cn(drawerItem(false), "justify-start")}>
                  <GamanaCoinIcon className="h-6 w-6" aria-hidden />
                  <span className="flex-1">Gamana Coins</span>
                  <span className="rounded-full bg-sand-100 px-3 py-1 text-sm font-bold text-ink">{coinBalance.toLocaleString()}</span>
                </Link>
                <Link href="/account" onClick={close} className={drawerItem(isActive("/account"))}>
                  Profile &amp; settings
                </Link>
                <Link href="/account#bookings" onClick={close} className={drawerItem(false)}>
                  My bookings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    close();
                  }}
                  className={cn(drawerItem(false), "text-red-700")}
                >
                  Log out
                </button>
              </div>
            )}
          </nav>

          <div className="border-t border-ink/5 px-6 py-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Get the app</p>
            <StoreBadges source="mobile_menu" keyword="travel guide app" />
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
