import { test } from "node:test";
import assert from "node:assert/strict";
import { ApiError, messageFrom, toApiError, unsuccessfulPayload } from "../lib/api/client.ts";

test("messageFrom reads envelope, global-handler and plain shapes", () => {
  assert.equal(messageFrom({ success: false, message: "Invalid phone number" }), "Invalid phone number");
  assert.equal(messageFrom({ error: { status_code: 400, detail: "Coin amount mismatch." } }), "Coin amount mismatch.");
  assert.equal(messageFrom({ error: { detail: { message: "Nested" } } }), "Nested");
  assert.equal(messageFrom({ detail: "Not Found" }), "Not Found");
  assert.equal(messageFrom("  plain  "), "plain");
  assert.equal(messageFrom({}), null);
  assert.equal(messageFrom(null), null);
});

test("toApiError keeps the backend error type as the code", () => {
  const err = toApiError(400, { message: "Bad", error: { error_type: "invalid_phone_number" } });
  assert.ok(err instanceof ApiError);
  assert.equal(err.status, 400);
  assert.equal(err.code, "invalid_phone_number");
  assert.equal(toApiError(500, {}).message, "Request failed (500).");
});

test("unsuccessfulPayload flags HTTP 200 failures", () => {
  const otp = unsuccessfulPayload({
    success: false,
    message: "SMS provider unavailable",
    code: 503,
    error: { error_type: "service_unavailable" },
  });
  assert.equal(otp.status, 503);
  assert.equal(otp.code, "service_unavailable");
  assert.equal(otp.message, "SMS provider unavailable");

  const plain = unsuccessfulPayload({ success: false, message: "Nope", code: 400 });
  assert.equal(plain.status, 400);
  assert.equal(plain.code, "unsuccessful");

  const nested = unsuccessfulPayload({ success: true, message: "ok", data: { success: false, message: "Invalid OTP" } });
  assert.equal(nested.code, "unsuccessful");
  assert.equal(nested.message, "Invalid OTP");

  assert.equal(unsuccessfulPayload({ success: true, data: { id: 1 } }), null);
  assert.equal(unsuccessfulPayload([1, 2]), null);
});
