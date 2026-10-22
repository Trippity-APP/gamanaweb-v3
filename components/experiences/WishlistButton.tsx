"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { Heart } from "@/components/icons";
import { track } from "@/lib/analytics";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { webAccountsEnabled } from "@/lib/flags";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  experienceRef: string;
  initial?: boolean | null;
  className?: string;
  variant?: "overlay" | "inline";
  /** Called after the server accepts the change. */
  onChange?: (saved: boolean) => void;
};

export function WishlistButton({ experienceRef, initial, className, variant = "overlay", onChange }: WishlistButtonProps) {
  const { status, openLogin } = useAuth();
  const [saved, setSaved] = useState(!!initial);
  const [busy, setBusy] = useState(false);

  useEffect(() => setSaved(!!initial), [initial]);

  if (!webAccountsEnabled) return null;

  const toggle = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (status !== "authenticated") {
      openLogin({ reason: "to save experiences" });
      return;
    }
    if (busy) return;
    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      await apiFetch(`/users/me/wishlists/experiences/${encodeURIComponent(experienceRef)}`, {
        method: next ? "POST" : "DELETE",
        auth: "required",
      });
      track("wishlist_toggle", { slug: experienceRef, on: next });
      onChange?.(next);
    } catch {
      setSaved(!next);
      toast.error("Couldn't update your wishlist. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const label = saved ? "Remove from wishlist" : "Save to wishlist";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        "focus-ring grid h-11 w-11 place-items-center rounded-full bg-white text-ink transition-transform hover:scale-105",
        variant === "overlay" ? "shadow-sm" : "border border-sand-200",
        className
      )}
    >
      <Heart className={cn("h-5 w-5", saved ? "fill-sunset-500 text-sunset-500" : "text-ink")} aria-hidden />
    </button>
  );
}
