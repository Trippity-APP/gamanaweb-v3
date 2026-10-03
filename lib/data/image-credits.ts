import sources from "@/lib/data/image-sources.json";

export type ImageCredit = {
  key: string;
  file: string;
  photographer: string;
  photographerUrl: string;
  sourceUrl: string;
  license: string;
};

/**
 * Stock photos used across the site. The Unsplash License needs no attribution,
 * but credits are kept for the record (and for an optional credits page).
 */
export const IMAGE_CREDITS: ImageCredit[] = sources
  .filter((s) => s.source === "unsplash")
  .map((s) => ({
    key: s.key,
    file: s.file,
    photographer: s.photographer ?? "",
    photographerUrl: s.photographerUrl ?? "",
    sourceUrl: s.page ?? "",
    license: s.license,
  }));
