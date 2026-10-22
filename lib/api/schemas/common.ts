import { z } from "zod";

/** Optional field that tolerates `null` from the API and normalises it to `undefined`. */
export const nullish = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullish().transform((value) => value ?? undefined);

/** Backend sends some numbers as strings (e.g. coin balances). */
export const numberish = z.union([z.number(), z.string()]).transform((value) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
});

/** Mongo documents expose either `id` or `_id`. */
export const idField = z.union([z.string(), z.number()]).transform(String);

export const paginatedItems = <T extends z.ZodTypeAny>(item: T) =>
  z
    .object({
      items: z.array(item),
      total: nullish(z.number()),
      page: nullish(z.number()),
      page_size: nullish(z.number()),
      total_pages: nullish(z.number()),
      has_next: nullish(z.boolean()),
      has_prev: nullish(z.boolean()),
    })
    .passthrough();
