'use client';

import { useEffect, useState } from 'react';
import { PLAY_STORE_URL, APP_STORE_URL } from '@/lib/data/nav-config';

export type StorePlatform = 'ios' | 'android' | 'unknown';

function detectPlatform(): StorePlatform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';

  // iPadOS 13+ reports as "Macintosh" but exposes multi-touch, unlike a real Mac.
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';

  if (/Android/.test(ua)) return 'android';

  return 'unknown';
}

/**
 * Returns the correct app store URL for the visitor's device, and the
 * detected platform in case a caller wants to render different copy
 * (e.g. "Get it on Google Play" vs "Download on the App Store").
 *
 * Server-rendered markup and the very first client render both fall back to
 * the Play Store link (can't read navigator during SSR), then this corrects
 * itself on mount once the real user agent is available. Desktop/unknown
 * visitors keep the Play Store fallback — if you want to show both options
 * to desktop visitors instead, branch on `platform === 'unknown'` at the
 * call site.
 */
export function useStoreUrl(): { url: string; platform: StorePlatform } {
  const [platform, setPlatform] = useState<StorePlatform>('unknown');

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const url = platform === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
  return { url, platform };
}
