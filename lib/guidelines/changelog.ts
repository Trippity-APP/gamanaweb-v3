export type ChangelogEntry = { version: string; date: string; summary: string; sections: string[] };

/** Newest first. Add an entry for every published change to the guidelines. */
export const changelog: ChangelogEntry[] = [
  {
    version: "v1.0",
    date: "2026-11-08",
    summary: "Initial guidelines: light and dark tokens, component library, partner co-brand rules.",
    sections: ["Foundation", "Logo", "Color", "Typography", "Voice", "Imagery", "Components", "Layout", "Accessibility", "Marketing", "Partners", "Downloads"],
  },
];
