import { getApiBaseUrl } from "@/lib/api-base";

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  username?: string | null;
  method: "otp" | "password";
};

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
  code?: number;
  success?: boolean;
  error?: unknown;
  detail?: string;
};

const AUTH_TOKEN_KEY = "gamanaAccessToken";
const AUTH_REFRESH_KEY = "gamanaRefreshToken";
const AUTH_SESSION_KEY = "gamanaAuthSession";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function persistAuthSession(session: AuthSession): void {
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
    if (session.refreshToken) {
      window.localStorage.setItem(AUTH_REFRESH_KEY, session.refreshToken);
    }
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore private-mode storage errors
  }
}

export function clearAuthSession(): void {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_REFRESH_KEY);
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    // ignore
  }
}

async function parseJson(response: Response): Promise<ApiEnvelope<Record<string, unknown>>> {
  return (await response.json().catch(() => ({}))) as ApiEnvelope<Record<string, unknown>>;
}

function mapSessionFromPayload(
  payload: Record<string, unknown>,
  method: AuthSession["method"]
): AuthSession {
  const accessToken = pickString(payload.access_token, payload.accessToken);
  if (!accessToken) {
    throw new Error("Login succeeded but no access token was returned.");
  }

  const firstName = pickString(payload.first_name, payload.firstName) ?? "";
  const lastName = pickString(payload.last_name, payload.lastName) ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || null;

  return {
    accessToken,
    refreshToken: pickString(payload.refresh_token, payload.refreshToken),
    userId: pickString(payload.id, payload._id, payload.user_id) ?? "",
    email: pickString(payload.email) ?? null,
    phone: pickString(payload.phone) ?? null,
    fullName,
    username: pickString(payload.username) ?? null,
    method,
  };
}

export async function requestOtp(phone: string, countryCode = "+91"): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/auth/request-otp`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      phone: phone.replace(/\D/g, ""),
      country_code: countryCode,
    }),
  });

  const data = await parseJson(response);
  if (!response.ok || data.success === false) {
    throw new Error(
      pickString(data.message, data.detail) || "Could not send OTP. Please try again."
    );
  }
}

export async function verifyOtp(
  phone: string,
  otp: string,
  countryCode = "+91"
): Promise<AuthSession> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/auth/verify-otp`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      phone: phone.replace(/\D/g, ""),
      country_code: countryCode,
      otp: otp.trim(),
    }),
  });

  const data = await parseJson(response);
  const payload = asRecord(data.data) ?? {};

  if (!response.ok || payload.success === false) {
    throw new Error(
      pickString(data.message, data.detail) || "Invalid OTP. Please try again."
    );
  }

  if (!pickString(payload.access_token, payload.accessToken)) {
    throw new Error("Invalid OTP. Please try again.");
  }

  const session = mapSessionFromPayload(payload, "otp");
  persistAuthSession(session);
  return session;
}

export async function loginWithPassword(
  userIdentifier: string,
  password: string
): Promise<AuthSession> {
  const baseUrl = getApiBaseUrl();
  const params = new URLSearchParams({
    user_identifier: userIdentifier.trim().toLowerCase(),
    password,
  });

  const response = await fetch(`${baseUrl}/login?${params.toString()}`, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
  });

  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(
      pickString(data.detail, data.message) || "Login failed. Check your email and password."
    );
  }

  const payload = asRecord(data.data) ?? {};
  const session = mapSessionFromPayload(payload, "password");
  persistAuthSession(session);
  return session;
}

export function authHeaders(accessToken?: string | null): HeadersInit {
  const token = accessToken ?? getStoredAccessToken();
  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
