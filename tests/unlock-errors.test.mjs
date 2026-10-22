import { test } from "node:test";
import assert from "node:assert/strict";
import { isInsufficientCoins, isPriceMismatch, priceFromMismatch } from "../lib/unlock/errors.ts";

const MISMATCH =
  "Coin amount mismatch. Place 'Red Fort' costs 12.00000000 coins to unlock. Provided: 10 coins, Expected: 12.00000000 coins.";

test("priceFromMismatch reads the expected price from beta's detail text", () => {
  assert.equal(priceFromMismatch(MISMATCH), 12);
  assert.equal(priceFromMismatch("Place 'X' costs 7.5 coins to unlock."), 7.5);
  assert.equal(priceFromMismatch("Expected: 0 coins"), null);
  assert.equal(priceFromMismatch("Something else went wrong"), null);
});

test("isPriceMismatch needs both the wording and a price", () => {
  assert.equal(isPriceMismatch(MISMATCH), true);
  assert.equal(isPriceMismatch("Coin amount mismatch."), false);
  assert.equal(isPriceMismatch("Insufficient balance"), false);
});

test("isInsufficientCoins matches beta's balance failures", () => {
  assert.equal(isInsufficientCoins("Insufficient balance"), true);
  assert.equal(isInsufficientCoins("Payment failed: wallet debit rejected"), true);
  assert.equal(isInsufficientCoins(MISMATCH), false);
});
