import { test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import {
  guardGuidelines,
  isProtectedPath,
  issueSession,
  passwordMatches,
  resetGuidelinesFailures,
  safeNext,
  sessionValid,
} from "../scripts/guidelines-auth.mjs";

const SECRET = "test-only-secret";

function fakeResponse() {
  const res = { status: null, headers: {}, body: "" };
  res.setHeader = (k, v) => (res.headers[k.toLowerCase()] = v);
  res.writeHead = (status, headers = {}) => {
    res.status = status;
    for (const [k, v] of Object.entries(headers)) res.headers[k.toLowerCase()] = v;
  };
  res.end = (body = "") => (res.body = body);
  return res;
}

function req({ method = "GET", cookie, ip = "1.2.3.4", body } = {}) {
  const request = body === undefined ? new Readable({ read() {} }) : Readable.from([Buffer.from(body)]);
  request.method = method;
  request.headers = { "x-forwarded-for": ip, ...(cookie ? { cookie } : {}) };
  request.socket = {};
  return request;
}

const form = (password, next = "/guidelines-v1/") => new URLSearchParams({ password, next }).toString();

test("protects the guidelines page and brand assets only", () => {
  for (const p of ["/guidelines-v1", "/guidelines-v1/", "/guidelines-v1/index.txt", "/brand/manifest.json", "/brand-templates/qr/a.pdf", "/logo/gamana-icon.svg", "//guidelines-v1/", "/%67uidelines-v1/", "/GUIDELINES-V1/"]) {
    assert.equal(isProtectedPath(p), true, p);
  }
  for (const p of ["/", "/blog/", "/brands/", "/logos.png", "/gamana-logo.png", "/api/v1/x", "/guidelines-v2/", "/guidelines-unlock/"]) {
    assert.equal(isProtectedPath(p), false, p);
  }
});

test("checks the password and only redirects back to protected paths", () => {
  assert.equal(passwordMatches(SECRET, SECRET), true);
  assert.equal(passwordMatches("wrong", SECRET), false);
  assert.equal(passwordMatches("", ""), false);
  assert.equal(passwordMatches(undefined, SECRET), false);
  assert.equal(safeNext("/brand-templates/qr/a.pdf"), "/brand-templates/qr/a.pdf");
  for (const bad of ["https://evil.example/", "//evil.example/", "/\\evil", "/account/", null]) {
    assert.equal(safeNext(bad), "/guidelines-v1/", String(bad));
  }
});

test("sessions expire and die when the password changes", () => {
  const now = 1_700_000_000_000;
  const token = issueSession(SECRET, now);
  assert.equal(sessionValid(token, SECRET, now + 1000), true);
  assert.equal(sessionValid(token, "rotated", now + 1000), false);
  assert.equal(sessionValid(token, SECRET, now + 8 * 24 * 60 * 60 * 1000), false);
  assert.equal(sessionValid("9999999999.forged", SECRET, now), false);
});

test("fails closed when no password is configured", async () => {
  const res = fakeResponse();
  assert.equal(await guardGuidelines(req(), res, "/guidelines-v1/", "", undefined), false);
  assert.equal(res.status, 503);
});

test("sends visitors to the unlock page, then lets them in with a private cache header", async () => {
  resetGuidelinesFailures();
  const challenged = fakeResponse();
  assert.equal(await guardGuidelines(req(), challenged, "/brand-templates/qr/a.pdf", "?v=1", SECRET), false);
  assert.equal(challenged.status, 303);
  assert.equal(challenged.headers.location, `/guidelines-unlock/?next=${encodeURIComponent("/brand-templates/qr/a.pdf?v=1")}`);

  const unlocked = fakeResponse();
  assert.equal(await guardGuidelines(req({ method: "POST", body: form(SECRET) }), unlocked, "/guidelines-unlock/", "", SECRET), false);
  assert.equal(unlocked.status, 303);
  assert.equal(unlocked.headers.location, "/guidelines-v1/");
  const cookie = unlocked.headers["set-cookie"];
  assert.match(cookie, /^gmn_guidelines=[^;]+; Path=\/; Max-Age=\d+; HttpOnly; SameSite=Lax$/);

  const ok = fakeResponse();
  assert.equal(await guardGuidelines(req({ cookie: cookie.split(";")[0] }), ok, "/guidelines-v1/", "", SECRET), true);
  ok.writeHead(200, { "Cache-Control": "public, max-age=3600" });
  assert.equal(ok.headers["cache-control"], "private, no-store");

  const open = fakeResponse();
  assert.equal(await guardGuidelines(req(), open, "/", "", SECRET), true);
  assert.equal(open.status, null);
});

test("wrong passwords go back to the form and are rate-limited per client", async () => {
  resetGuidelinesFailures();
  const now = 1_000_000;
  const attempt = async (password, at) => {
    const res = fakeResponse();
    await guardGuidelines(req({ method: "POST", body: form(password), ip: "9.9.9.9" }), res, "/guidelines-unlock/", "", SECRET, at);
    return res;
  };
  const wrong = await attempt("nope", now);
  assert.match(wrong.headers.location, /error=wrong/);
  assert.equal(wrong.headers["set-cookie"], undefined);
  for (let i = 0; i < 9; i++) await attempt("nope", now);
  assert.match((await attempt(SECRET, now + 1000)).headers.location, /error=locked/);
  const later = await attempt(SECRET, now + 16 * 60 * 1000);
  assert.ok(later.headers["set-cookie"]);
});
