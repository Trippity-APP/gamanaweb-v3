import type { ZodType, ZodTypeDef } from "zod";
import { getApiBaseUrl, type ApiVersion } from "@/lib/api-base-url";
import {
  clearSession,
  getSession,
  sessionEvents,
  setSession,
  SESSION_EXPIRED_EVENT,
} from "@/lib/api/session";
import { webRefreshResponseSchema } from "@/lib/api/schemas/auth";

/**
 * - `none`: never attach credentials. Use for every public catalog call (`/experiences*`,
 *   `/marketplace/*`, public `/place*`) so web reads can't trigger app-side activation (B4).
 * - `optional`: attach the session when there is one.
 * - `required`: restore the session first; fail with 401 if there isn't one.
 */
export type AuthMode = "none" | "optional" | "required";

export interface ApiFetchOptions<T> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined | Array<string | number>>;
  auth?: AuthMode;
  schema?: ZodType<T, ZodTypeDef, unknown>;
  signal?: AbortSignal;
  version?: ApiVersion;
  headers?: Record<string, string>;
  /** Unwrap the `{ success, message, data, code, error }` envelope. Default true. */
  unwrap?: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | number | null;
  readonly details: unknown;

  constructor(message: string, status: number, code: string | number | null = null, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class RateLimitedError extends ApiError {
  constructor(message: string, details: unknown = null) {
    super(message, 429, "rate_limited", details);
    this.name = "RateLimitedError";
  }
}

const WEB_CLIENT_HEADER = { "X-Gamana-Client": "web" } as const;

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Single-flight `POST /api/v1/auth/web/refresh`. Concurrent 401s share one request so the
 * rotated refresh cookie is only consumed once.
 */
export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl("v1")}/auth/web/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json", ...WEB_CLIENT_HEADER },
    });
    if (!res.ok) {
      clearSession();
      return false;
    }
    const parsed = webRefreshResponseSchema.safeParse(unwrapEnvelope(await readJson(res)));
    if (!parsed.success) {
      clearSession();
      return false;
    }
    setSession({
      accessToken: parsed.data.access_token,
      sessionId: parsed.data.session_id,
      expiresIn: parsed.data.expires_in ?? null,
    });
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions<T> = {}): Promise<T> {
  const { auth = "optional" } = options;

  if (auth === "required" && !getSession()) {
    const restored = await refreshSession();
    if (!restored) throw expired();
  }

  let res = await send(path, options);

  if (res.status === 401 && auth !== "none") {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await send(path, options);
    }
    if (res.status === 401) {
      if (auth === "required" || getSession()) {
        clearSession();
        throw expired();
      }
    }
  }

  const payload = await readJson(res);

  if (!res.ok) {
    throw toApiError(res.status, payload);
  }

  const result = options.unwrap === false ? payload : unwrapEnvelope(payload);

  if (!options.schema) return result as T;

  const parsed = options.schema.safeParse(result);
  if (!parsed.success) {
    throw new ApiError("Unexpected response from Gamana.", res.status, "invalid_response", parsed.error.issues);
  }
  return parsed.data;
}

function send<T>(path: string, options: ApiFetchOptions<T>): Promise<Response> {
  const { method = "GET", body, query, auth = "optional", signal, version = "v1", headers = {} } = options;

  const finalHeaders: Record<string, string> = { Accept: "application/json", ...headers };
  const session = auth === "none" ? null : getSession();
  if (session) {
    finalHeaders.Authorization = `Bearer ${session.accessToken}`;
    finalHeaders["X-Session-ID"] = session.sessionId;
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  return fetch(buildUrl(path, version, query), {
    method,
    headers: finalHeaders,
    body: requestBody,
    signal,
    credentials: "same-origin",
    cache: "no-store",
  });
}

function buildUrl(path: string, version: ApiVersion, query: ApiFetchOptions<unknown>["query"]): string {
  const base = getApiBaseUrl(version);
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item));
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapEnvelope(payload: unknown): unknown {
  if (!isRecord(payload) || !("data" in payload)) return payload;
  const looksLikeEnvelope = "message" in payload || "success" in payload || "code" in payload || "error" in payload;
  return looksLikeEnvelope ? payload.data : payload;
}

function messageFrom(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) return payload.trim();
  if (!isRecord(payload)) return null;
  for (const key of ["message", "detail", "error"] as const) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (isRecord(value) && typeof value.message === "string") return value.message;
  }
  return null;
}

function toApiError(status: number, payload: unknown): ApiError {
  const message = messageFrom(payload) ?? `Request failed (${status}).`;
  if (status === 429) return new RateLimitedError(message, payload);
  const code = isRecord(payload) && (typeof payload.code === "string" || typeof payload.code === "number")
    ? payload.code
    : null;
  return new ApiError(message, status, code, payload);
}

function expired(): ApiError {
  sessionEvents?.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  return new ApiError("Your session has expired. Please log in again.", 401, "session_expired");
}

export const webClientHeaders = WEB_CLIENT_HEADER;
