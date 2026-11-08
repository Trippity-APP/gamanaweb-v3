"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/lib/guidelines/config";

/**
 * Scoped to /guidelines-v1. A custom attribute (not `class`) keeps the site's `dark:` variants
 * and the shadcn `.dark` variables switched off, and color-scheme is set on the wrapper instead
 * of <html>, so nothing carries over to the live site.
 */
export function GuidelinesThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute={THEME_ATTRIBUTE}
      storageKey={THEME_STORAGE_KEY}
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
