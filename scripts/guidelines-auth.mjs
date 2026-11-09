/**
 * Password gate for the internal brand guidelines and their assets. The password comes from
 * the GUIDELINES_PASSWORD environment variable (set in Railway). Visitors without a valid
 * session cookie are sent to the /guidelines-unlock/ page, which posts the password back here.
 * Fails closed: when the variable is missing, protected paths return 503 instead of opening up.
 */
import crypto from "node:crypto";

const PROTECTED = [/^\/guidelines-v1(\/|$)/, /^\/brand(\/|$)/, /^\/brand-templates(\/|$)/, /^\/logo(\/|$)/];
export const UNLOCK_PATH = "/guidelines-unlock/";
const DEFAULT_NEXT = "/guidelines-v1/";
const COOKIE = "gmn_guidelines";
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const MAX_BODY_BYTES = 4096;
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;

function normalize(pathname) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Malformed escapes still go through the check on the raw path.
  }
  return decoded.replace(/\/{2,}/g, "/").toLowerCase();
}

export function isProtectedPath(pathname) {
  const normalized = normalize(pathname);
  return PROTECTED.some((re) => re.test(normalized));
}

const isUnlockPath = (pathname) => /^\/guidelines-unlock\/?$/.test(normalize(pathname));

const digest = (value) => crypto.createHash("sha256").update(value, "utf8").digest();
const sameSecret = (a, b) => crypto.timingSafeEqual(digest(a), digest(b));

export function passwordMatches(candidate, expected) {
  if (typeof candidate !== "string" || !candidate || !expected) return false;
  return sameSecret(candidate, expected);
}

const sign = (expires, expected) =>
  crypto.createHmac("sha256", expected).update(`guidelines-v1:${expires}`).digest("base64url");

/** `<expiry seconds>.<hmac>`; changing the password invalidates every issued session. */
export function issueSession(expected, now = Date.now()) {
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  return `${expires}.${sign(expires, expected)}`;
}

export function sessionValid(token, expected, now = Date.now()) {
  if (!token || !expected) return false;
  const [expires, mac] = String(token).split(".");
  if (!/^\d+$/.test(expires || "") || !mac) return false;
  if (Number(expires) * 1000 <= now) return false;
  return sameSecret(mac, sign(expires, expected));
}

function readCookie(request, name) {
  const header = request.headers.cookie || "";
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq !== -1 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return "";
}

/** Only protected same-site paths, so `next` can't be used as an open redirect. */
export function safeNext(raw) {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return DEFAULT_NEXT;
  return isProtectedPath(raw.split(/[?#]/)[0]) ? raw : DEFAULT_NEXT;
}

const failures = new Map();

function clientIp(request) {
  const forwarded = request.headers["cf-connecting-ip"] || request.headers["x-forwarded-for"] || "";
  return String(forwarded).split(",")[0].trim() || request.socket?.remoteAddress || "unknown";
}

function tooManyFailures(ip, now) {
  const entry = failures.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) return false;
  return entry.count >= MAX_FAILURES;
}

function recordFailure(ip, now) {
  const entry = failures.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) failures.set(ip, { start: now, count: 1 });
  else entry.count += 1;
  if (failures.size > 10_000) failures.clear();
}

const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

function deny(response, status, body) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", ...NO_STORE });
  response.end(body);
}

function redirect(response, location, extra = {}) {
  response.writeHead(303, { Location: location, ...NO_STORE, ...extra });
  response.end();
}

function unlockUrl(next, error) {
  const params = new URLSearchParams({ next });
  if (error) params.set("error", error);
  return `${UNLOCK_PATH}?${params}`;
}

function readForm(request) {
  return new Promise((resolve) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        request.destroy();
        resolve(new URLSearchParams());
      } else chunks.push(chunk);
    });
    request.on("end", () => resolve(new URLSearchParams(Buffer.concat(chunks).toString("utf8"))));
    request.on("error", () => resolve(new URLSearchParams()));
  });
}

async function handleUnlock(request, response, expected, now) {
  const form = await readForm(request);
  const next = safeNext(form.get("next"));
  if (!expected) return redirect(response, unlockUrl(next, "unavailable"));
  const ip = clientIp(request);
  if (tooManyFailures(ip, now)) return redirect(response, unlockUrl(next, "locked"));
  if (!passwordMatches(form.get("password"), expected)) {
    recordFailure(ip, now);
    return redirect(response, unlockUrl(next, tooManyFailures(ip, now) ? "locked" : "wrong"));
  }
  failures.delete(ip);
  const secure = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https";
  const cookie = [
    `${COOKIE}=${issueSession(expected, now)}`,
    "Path=/",
    `Max-Age=${SESSION_SECONDS}`,
    "HttpOnly",
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
  redirect(response, next, { "Set-Cookie": cookie });
}

/**
 * Resolves true when the request may continue. Otherwise the response has been sent.
 * Allowed responses on protected paths are marked private so shared caches never store them.
 */
export async function guardGuidelines(
  request,
  response,
  pathname,
  search = "",
  expected = process.env.GUIDELINES_PASSWORD,
  now = Date.now()
) {
  if (request.method === "POST" && isUnlockPath(pathname)) {
    await handleUnlock(request, response, expected, now);
    return false;
  }
  if (!isProtectedPath(pathname)) return true;
  if (!expected) {
    deny(response, 503, "Brand guidelines are not configured.");
    return false;
  }
  if (!sessionValid(readCookie(request, COOKIE), expected, now)) {
    if (request.method === "GET" || request.method === "HEAD") redirect(response, unlockUrl(safeNext(pathname + search)));
    else deny(response, 401, "Password required.");
    return false;
  }
  const writeHead = response.writeHead.bind(response);
  response.writeHead = (status, ...rest) => {
    response.setHeader("Cache-Control", "private, no-store");
    const headers = rest.find((r) => r && typeof r === "object");
    if (headers) {
      for (const key of Object.keys(headers)) if (key.toLowerCase() === "cache-control") delete headers[key];
    }
    return writeHead(status, ...rest);
  };
  return true;
}

export function resetGuidelinesFailures() {
  failures.clear();
}
