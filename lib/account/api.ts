import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { bookingSummarySchema, type BookingSummary } from "@/lib/api/schemas/bookings";
import { libraryUnlockSchema, type LibraryUnlock } from "@/lib/api/schemas/library";

/** Accepts either a bare array or `{ items: [...] }`. */
export function listOf<T extends z.ZodTypeAny>(item: T) {
  return z
    .union([z.array(item), z.object({ items: z.array(item) }).passthrough()])
    .transform((value) => (Array.isArray(value) ? value : value.items) as z.infer<T>[]);
}

export function bookingId(b: BookingSummary): string {
  return String(b.booking_id ?? b.id ?? b._id ?? "");
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isUpcoming(b: BookingSummary): boolean {
  return b.status !== "cancelled" && (b.local_date ?? "") >= todayIso();
}

export async function fetchBookings(): Promise<BookingSummary[]> {
  const list = await apiFetch("/my/bookings", { auth: "required", schema: listOf(bookingSummarySchema) });
  return [...list].sort((a, b) => (a.local_date ?? "").localeCompare(b.local_date ?? ""));
}

export function fetchPlaceUnlocks(): Promise<LibraryUnlock[]> {
  return apiFetch("/library/unlocks", { auth: "required", version: "v2", schema: listOf(libraryUnlockSchema) });
}

export function fetchTourUnlocks(): Promise<LibraryUnlock[]> {
  return apiFetch("/tours/mine", { auth: "required", version: "v2", schema: listOf(libraryUnlockSchema) });
}
