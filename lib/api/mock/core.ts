import type { MockDb } from "@/lib/api/mock/db";

export type MockCtx = {
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: Record<string, unknown>;
  form: FormData | null;
  headers: Headers;
  db: MockDb;
};

export type MockResult = { status?: number; body: unknown };

export type MockRoute = {
  method: string;
  version?: "v1" | "v2";
  path: string;
  /** Needs the mock session's bearer token. */
  auth?: boolean;
  /** Public endpoint: try the real API first, mock only if it fails. */
  fallback?: boolean;
  handle: (ctx: MockCtx) => MockResult | Promise<MockResult>;
};

export function ok(data: unknown, message = "OK"): MockResult {
  return { status: 200, body: { success: true, message, data } };
}

export function fail(status: number, code: string, message: string, extra: Record<string, unknown> = {}): MockResult {
  return {
    status,
    body: { success: false, message, code, error: { status_code: status, detail: { code, message, ...extra } }, ...extra },
  };
}

/** Real public experience detail, used to make mocked availability/checkout look right. */
export async function realExperience(slug: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`/api/v1/experiences/${encodeURIComponent(slug)}?include_scarcity=true`);
    if (!res.ok) return null;
    const json = (await res.json()) as { experience?: Record<string, unknown> };
    return json.experience ?? null;
  } catch {
    return null;
  }
}

type GuestType = { unit_id: string | number; label?: string | null; type?: string | null };

export function guestTypes(experience: Record<string, unknown> | null): GuestType[] {
  const list = (experience?.guest_types as GuestType[] | undefined) ?? [];
  return list.length ? list : [{ unit_id: "adult", label: "Adult" }];
}

export function unitLabel(experience: Record<string, unknown> | null, unitId: string): string {
  const match = guestTypes(experience).find((g) => String(g.unit_id) === unitId);
  return (match?.label ?? "Traveller").replace(/\s*\(.*\)\s*$/, "");
}

/** Mock unit price: adults pay `from_price`, everyone else 75%. */
export function unitPrice(experience: Record<string, unknown> | null, unitId: string): number {
  const base = Number(experience?.from_price ?? 50) || 50;
  const label = unitLabel(experience, unitId).toLowerCase();
  return label.includes("adult") || guestTypes(experience).length === 1 ? base : Math.round(base * 0.75 * 100) / 100;
}

export function travellersText(experience: Record<string, unknown> | null, guests: { unit_id: string; quantity: number }[]): string {
  return guests
    .filter((g) => g.quantity > 0)
    .map((g) => `${g.quantity} ${unitLabel(experience, g.unit_id)}${g.quantity > 1 ? "s" : ""}`)
    .join(", ");
}
