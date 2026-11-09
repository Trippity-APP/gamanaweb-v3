import { test } from "node:test";
import assert from "node:assert/strict";
import { guardGuidelines, isProtectedPath, passwordMatches, resetGuidelinesFailures } from "../scripts/guidelines-auth.mjs";

const SECRET = "test-only-secret";
const basic = (user, pass) => `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;

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
const req = (authorization, ip = "1.2.3.4") => ({ headers: { authorization, "x-forwarded-for": ip }, socket: {} });

test("protects the guidelines page and brand assets only", () => {
  for (const p of ["/guidelines-v1", "/guidelines-v1/", "/guidelines-v1/index.txt", "/brand/manifest.json", "/brand-templates/qr/a.pdf", "/logo/gamana-icon.svg", "//guidelines-v1/", "/%67uidelines-v1/", "/GUIDELINES-V1/"]) {
    assert.equal(isProtectedPath(p), true, p);
  }
  for (const p of ["/", "/blog/", "/brands/", "/logos.png", "/gamana-logo.png", "/api/v1/x", "/guidelines-v2/"]) {
    assert.equal(isProtectedPath(p), false, p);
  }
});

test("accepts any username with the right password", () => {
  assert.equal(passwordMatches(basic("anyone", SECRET), SECRET), true);
  assert.equal(passwordMatches(basic("", SECRET), SECRET), true);
  assert.equal(passwordMatches(basic("x", "wrong"), SECRET), false);
  assert.equal(passwordMatches(undefined, SECRET), false);
  assert.equal(passwordMatches("Bearer abc", SECRET), false);
  assert.equal(passwordMatches(basic("x", ""), ""), false);
});

test("fails closed when no password is configured", () => {
  const res = fakeResponse();
  assert.equal(guardGuidelines(req(basic("x", "")), res, "/guidelines-v1/", undefined), false);
  assert.equal(res.status, 503);
});

test("challenges, then allows with a private cache header", () => {
  resetGuidelinesFailures();
  const challenged = fakeResponse();
  assert.equal(guardGuidelines(req(undefined), challenged, "/guidelines-v1/", SECRET), false);
  assert.equal(challenged.status, 401);
  assert.match(challenged.headers["www-authenticate"], /^Basic realm=/);

  const ok = fakeResponse();
  assert.equal(guardGuidelines(req(basic("u", SECRET)), ok, "/guidelines-v1/", SECRET), true);
  ok.writeHead(200, { "Cache-Control": "public, max-age=3600" });
  assert.equal(ok.headers["cache-control"], "private, no-store");

  const open = fakeResponse();
  assert.equal(guardGuidelines(req(undefined), open, "/", SECRET), true);
  assert.equal(open.status, null);
});

test("rate-limits repeated wrong passwords per client", () => {
  resetGuidelinesFailures();
  const now = 1_000_000;
  for (let i = 0; i < 10; i++) guardGuidelines(req(basic("u", "nope"), "9.9.9.9"), fakeResponse(), "/brand/", SECRET, now);
  const blocked = fakeResponse();
  assert.equal(guardGuidelines(req(basic("u", SECRET), "9.9.9.9"), blocked, "/brand/", SECRET, now + 1000), false);
  assert.equal(blocked.status, 429);
  const later = fakeResponse();
  assert.equal(guardGuidelines(req(basic("u", SECRET), "9.9.9.9"), later, "/brand/", SECRET, now + 16 * 60 * 1000), true);
});
