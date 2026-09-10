"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  featureItems,
  primaryNavItems,
  APP_STORE_URL,
  PLAY_STORE_URL,
} from "@/lib/data/nav-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackStoreClick } from "@/lib/analytics";
import { useStoreUrl } from "@/hooks/use-store-url";
import { useAccount } from "@/lib/account-context";
import { AccountMenu } from "@/components/navigation/AccountMenu";

/**
 * Explore always routes to the unified /marketplace page.
 */
function resolveNavHref(item: { name: string; href: string }) {
  return item.href;
}

interface SiteHeaderProps {
  variant?: "transparent" | "solid";
}

export default function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const pathname = usePathname();
  const isTransparent = variant === "transparent";
  const { url: storeUrl, platform } = useStoreUrl();
  const { account } = useAccount();
  const loggedIn = !!account;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setMobileFeaturesOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  const MARKETPLACE_ROUTES = ["/explore", "/marketplace", "/marketplace-redesign"];
  const isActive = (href: string) =>
    MARKETPLACE_ROUTES.includes(href)
      ? MARKETPLACE_ROUTES.includes(pathname)
      : pathname === href;

  // Nav now stays on the solid white/dark-text look on every page, including hero pages —
  // isTransparent below only controls whether the bar floats over the hero photo
  // (absolute) or sits in normal flow (sticky), not its color scheme anymore.
  const linkClass = (href: string) =>
    cn(
      "text-sm font-medium transition-colors rounded-md px-2 py-1.5",
      "text-gray-700 hover:text-[#1A5F7A] hover:bg-[#57C5B6]/10",
      isActive(href) && "text-[#159895] font-semibold"
    );

  // primaryNavItems order: Home, Explore, Blog, Partner with Gamana, Cities — Features
  // dropdown is inserted in site-header.tsx after Cities.

  return (
    <>
      <header
        className={cn(
          "top-0 left-0 right-0 z-50 transition-all duration-300",
          isTransparent
            ? "absolute bg-white shadow-sm"
            : "sticky bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo intentionally links to Explore, not Home — the "Home" nav item still
              covers the brand landing page for anyone who wants it. Routed through
              resolveNavHref so it lands on the same page the "Explore" nav item does
              (the personalized variant when signed in); otherwise clicking the logo
              dropped signed-in visitors on the generic page while nav pointed elsewhere. */}
          <Link
            href={resolveNavHref({ name: "Explore", href: "/explore" })}
            className="shrink-0 flex items-center"
            onClick={closeMenu}
          >
            <img
              src="/gamana-logo.svg"
              alt="Gamana"
              className="h-9 sm:h-10 w-auto"
            />
          </Link>

          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="Main navigation"
          >
            {primaryNavItems.map((item) => {
              const href = resolveNavHref(item);
              return (
                <Link key={item.href} href={href} className={linkClass(href)}>
                  {item.name}
                </Link>
              );
            })}

            <div
              className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium px-2 py-1.5 rounded-md text-gray-700 hover:text-[#1A5F7A] hover:bg-[#57C5B6]/10"
              >
                Features
                <ChevronDown className="h-4 w-4" />
              </button>
              {featuresOpen && (
                <div className="absolute top-full left-0 pt-2 w-72">
                  <div className="rounded-xl border border-gray-100 bg-white shadow-xl p-3">
                    {featureItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-[#57C5B6]/10 hover:text-[#1A5F7A] rounded-lg"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              asChild
              size="sm"
              className="ml-2 rounded-full bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white border-0 shadow-md hover:opacity-95"
            >
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackStoreClick(platform === "ios" ? "apple" : "play", "header")}
              >
                Download App
              </a>
            </Button>

            {loggedIn && <AccountMenu />}
          </nav>

          <button
            type="button"
            className="lg:hidden p-2.5 rounded-lg shrink-0 bg-gray-100 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={closeMenu}
        featuresOpen={mobileFeaturesOpen}
        setFeaturesOpen={setMobileFeaturesOpen}
      />
    </>
  );
}

function MobileDrawer({
  isOpen,
  onClose,
  featuresOpen,
  setFeaturesOpen,
}: {
  isOpen: boolean;
  onClose: () => void;
  featuresOpen: boolean;
  setFeaturesOpen: (v: boolean) => void;
}) {
  const itemClass =
    "block px-4 py-3 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-[#57C5B6]/10 hover:to-[#159895]/10 font-medium";

  const { account, logout } = useAccount();
  const loggedIn = !!account;

  return (
    <>
      <div
        className={cn(
          "lg:hidden fixed top-0 right-0 h-dvh w-full sm:w-96 bg-white shadow-2xl z-[100] transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-6">
            <img src="/gamana-logo.svg" alt="Gamana" className="h-8" />
            <button type="button" onClick={onClose} aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto space-y-1">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={resolveNavHref(item)}
                onClick={onClose}
                className={itemClass}
              >
                {item.name}
              </Link>
            ))}
            <button
              type="button"
              className={cn("w-full flex justify-between items-center", itemClass)}
              onClick={() => setFeaturesOpen(!featuresOpen)}
            >
              Features
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", featuresOpen && "rotate-180")}
              />
            </button>
            {featuresOpen &&
              featureItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block pl-8 py-2 text-sm text-gray-600"
                >
                  {item.name}
                </Link>
              ))}
            {loggedIn && (
              <div className="pt-2 mt-2 border-t border-gray-100">
                <Link href="/account" onClick={onClose} className={itemClass}>
                  Profile & settings
                </Link>
                <Link href="/account#bookings" onClick={onClose} className={itemClass}>
                  My bookings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className={cn("w-full text-left text-red-600", itemClass)}
                >
                  Log out
                </button>
              </div>
            )}
          </nav>
          <div className="pt-4 border-t space-y-3">
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={onClose}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                className="h-11 mx-auto"
              />
            </a>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={onClose}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="App Store"
                className="h-11 mx-auto"
              />
            </a>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-[90]" onClick={onClose} aria-hidden />
      )}
    </>
  );
}
