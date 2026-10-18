"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import { ResponsiveSheet } from "@/components/common/ResponsiveSheet";
import { StoreBadges } from "@/components/site/StoreBadges";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { openInApp } from "@/lib/app-links";

export type AppHandoffContent = {
  title: string;
  steps: string[];
  note?: string;
  /** Universal link the app claims (falls back to the website when the app isn't installed). */
  deepLink: string;
};

type AppHandoffSheetProps = AppHandoffContent & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
  /** Extra actions under the steps (e.g. "Send again", "Go to My Collection"). */
  children?: ReactNode;
};

export function AppHandoffSheet({ open, onOpenChange, title, steps, note, deepLink, source, children }: AppHandoffSheetProps) {
  const desktop = useMediaQuery("(min-width: 768px)");
  const [qr, setQr] = useState<string | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const fallbackTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open || !desktop) return;
    let cancelled = false;
    QRCode.toDataURL(deepLink, { margin: 1, width: 200, color: { dark: "#0F1B24", light: "#FFFFFF" } })
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [open, desktop, deepLink]);

  useEffect(() => {
    if (!open) setShowBadges(false);
    return () => {
      if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current);
    };
  }, [open]);

  const openApp = () => {
    openInApp(deepLink);
    fallbackTimer.current = window.setTimeout(() => {
      if (document.visibilityState === "visible") setShowBadges(true);
    }, 1200);
  };

  const stepList = (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={step} className="flex items-start gap-3 text-sm text-ink">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );

  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title={title} className="sm:max-w-2xl">
      {desktop ? (
        <div className="grid gap-8 pt-2 sm:grid-cols-[1fr_220px]">
          <div>
            {stepList}
            {note && <p className="mt-5 text-sm text-ink-soft">{note}</p>}
            {children && <div className="mt-6">{children}</div>}
          </div>
          <div className="flex flex-col items-center gap-3">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="Scan to open in the Gamana app" width={200} height={200} className="rounded-2xl border border-sand-200" />
            ) : (
              <div className="h-[200px] w-[200px] rounded-2xl bg-sand-100" aria-hidden />
            )}
            <p className="text-center text-xs text-ink-soft">Scan with your phone camera</p>
            <StoreBadges source={source} keyword="travel app" className="justify-center [&_img]:h-9 [&_img]:w-auto" />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {stepList}
          {note && <p className="text-sm text-ink-soft">{note}</p>}
          <Button
            type="button"
            onClick={openApp}
            className="h-12 w-full rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 text-base font-semibold text-white"
          >
            Open Gamana app
          </Button>
          {showBadges ? (
            <StoreBadges source={source} keyword="travel app" className="justify-center" />
          ) : (
            <button type="button" onClick={() => setShowBadges(true)} className="focus-ring mx-auto block rounded text-sm font-semibold text-brand-700">
              Get the app
            </button>
          )}
          {children}
        </div>
      )}
    </ResponsiveSheet>
  );
}
