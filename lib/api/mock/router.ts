import type { MockCtx, MockResult, MockRoute } from "@/lib/api/mock/core";
import { readDb } from "@/lib/api/mock/db";
import { accountRoutes } from "@/lib/api/mock/routes-account";
import { commerceRoutes } from "@/lib/api/mock/routes-commerce";

type Compiled = MockRoute & { regex: RegExp; keys: string[] };

const LATENCY_MS = 250;

const routes: Compiled[] = [...accountRoutes, ...commerceRoutes].map((route) => {
  const keys: string[] = [];
  const pattern = route.path
    .replace(/\/$/, "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:(\w+)/g, (_, key: string) => {
      keys.push(key);
      return "([^/]+)";
    });
  return { ...route, keys, regex: new RegExp(`^${pattern}/?$`) };
});

function json(result: MockResult): Response {
  return new Response(JSON.stringify(result.body), {
    status: result.status ?? 200,
    headers: { "Content-Type": "application/json" },
  });
}

function parseBody(init: RequestInit): { body: Record<string, unknown>; form: FormData | null } {
  if (init.body instanceof FormData) return { body: {}, form: init.body };
  if (typeof init.body === "string" && init.body) {
    try {
      return { body: JSON.parse(init.body) as Record<string, unknown>, form: null };
    } catch {
      return { body: {}, form: null };
    }
  }
  return { body: {}, form: null };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Dev-only stand-in for `fetch`. Authenticated endpoints are fully mocked; public endpoints
 * marked `fallback` hit the real API first and are mocked only when it fails; everything else
 * passes straight through.
 */
export async function mockTransport(url: string, init: RequestInit): Promise<Response> {
  const parsed = new URL(url, window.location.origin);
  const match = parsed.pathname.match(/\/api\/(v1|v2)(\/.*)$/);
  if (!match) return fetch(url, init);
  const [, version, path] = match;
  const method = (init.method ?? "GET").toUpperCase();

  for (const route of routes) {
    if (route.method !== method || (route.version ?? "v1") !== version) continue;
    const found = path.match(route.regex);
    if (!found) continue;

    if (route.fallback) {
      try {
        const real = await fetch(url, init);
        if (real.ok) return real;
      } catch {
        // fall through to the mock
      }
    }

    await wait(LATENCY_MS);
    const db = readDb();
    const headers = new Headers(init.headers);
    if (route.auth) {
      const token = headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
      if (!db.session || token !== db.session.accessToken) {
        return json({ status: 401, body: { success: false, code: "unauthorized", message: "Session expired." } });
      }
    }
    const params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(found[i + 1])]));
    const ctx: MockCtx = { method, path, params, query: parsed.searchParams, headers, db, ...parseBody(init) };
    try {
      return json(await route.handle(ctx));
    } catch (error) {
      console.error("[mock api]", method, path, error);
      return json({ status: 500, body: { success: false, code: "mock_error", message: "Mock handler failed." } });
    }
  }
  return fetch(url, init);
}
