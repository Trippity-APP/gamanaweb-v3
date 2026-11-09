/**
 * HTTP Basic auth for the internal brand guidelines and their assets. The password comes from
 * the GUIDELINES_PASSWORD environment variable (set in Railway); any username is accepted.
 * Fails closed: when the variable is missing, protected paths return 503 instead of opening up.
 */
import crypto from "node:crypto";

const PROTECTED = [/^\/guidelines-v1(\/|$)/, /^\/brand(\/|$)/, /^\/brand-templates(\/|$)/, /^\/logo(\/|$)/];
const REALM = "Gamana brand guidelines";
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;

export function isProtectedPath(pathname) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Malformed escapes still go through the check on the raw path.
  }
  const normalized = decoded.replace(/\/{2,}/g, "/").toLowerCase();
  return PROTECTED.some((re) => re.test(normalized));
}

const digest = (value) => crypto.createHash("sha256").update(value, "utf8").digest();

export function passwordMatches(header, expected) {
  if (!header || !expected || !/^Basic /i.test(header)) return false;
  let decoded;
  try {
    decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep === -1) return false;
  return crypto.timingSafeEqual(digest(decoded.slice(sep + 1)), digest(expected));
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

function deny(response, status, body, extra = {}) {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    ...extra,
  });
  response.end(body);
}

/**
 * Returns true when the request may continue. Otherwise the response has been sent.
 * Allowed responses on protected paths are marked private so shared caches never store them.
 */
export function guardGuidelines(request, response, pathname, expected = process.env.GUIDELINES_PASSWORD, now = Date.now()) {
  if (!isProtectedPath(pathname)) return true;
  if (!expected) {
    deny(response, 503, "Brand guidelines are not configured.");
    return false;
  }
  const ip = clientIp(request);
  if (tooManyFailures(ip, now)) {
    deny(response, 429, "Too many attempts. Try again later.", { "Retry-After": String(WINDOW_MS / 1000) });
    return false;
  }
  const header = request.headers.authorization;
  if (!passwordMatches(header, expected)) {
    if (header) recordFailure(ip, now);
    deny(response, 401, "Password required.", { "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"` });
    return false;
  }
  failures.delete(ip);
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
