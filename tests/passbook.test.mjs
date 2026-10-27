import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePassbookPage, passbookKind } from "../lib/account/wallet.ts";

test("parsePassbookPage reads beta's data[] + pagination shape", () => {
  const page = parsePassbookPage(
    {
      success: true,
      data: [
        { transaction_id: "t1", transaction_type: "purchase", coin_amount: "10", timestamp: "2026-10-01T10:00:00Z", status: "COMPLETED", description: "10 Coins" },
        { transaction_id: "t2", transaction_type: "redemption", coin_amount: "3", timestamp: "2026-10-02T10:00:00Z", status: "completed" },
      ],
      pagination: { total: 25, skip: 0, limit: 20, has_more: true },
    },
    1,
  );
  assert.equal(page.hasNext, true);
  assert.deepEqual(
    page.rows.map((r) => [r.id, r.kind, r.amount, r.status, r.createdAt]),
    [
      ["t1", "purchase", 10, "completed", "2026-10-01T10:00:00Z"],
      ["t2", "unlock", -3, "completed", "2026-10-02T10:00:00Z"],
    ],
  );
  assert.equal(page.rows[1].description, "Unlocked content");
});

test("parsePassbookPage falls back to total when has_more is missing", () => {
  assert.equal(parsePassbookPage({ data: [], pagination: { total: 40 } }, 2).hasNext, false);
  assert.equal(parsePassbookPage({ data: [], pagination: { total: 41 } }, 2).hasNext, true);
  assert.equal(parsePassbookPage([], 1).hasNext, false);
});

test("passbookKind classifies beta transaction types", () => {
  assert.equal(passbookKind({ transaction_type: "reward" }), "reward");
  assert.equal(passbookKind({ transaction_type: "cashback" }), "reward");
  assert.equal(passbookKind({ transaction_type: "refund" }), "refund");
  assert.equal(passbookKind({ transaction_type: "system_debit" }), "unlock");
  assert.equal(passbookKind({ transaction_type: "adjustment" }), "other");
});

test("app store purchases read as purchases, never as raw product ids", () => {
  const page = parsePassbookPage(
    {
      data: [
        { transaction_id: "t1", transaction_type: "reward", coin_amount: 10, description: "Reward: iap_purchase_gamana_ten_coin" },
        { transaction_id: "t2", transaction_type: "reward", coin_amount: 5, description: "Reward: daily_login_streak_bonus" },
        { transaction_id: "t3", transaction_type: "reward", coin_amount: 5, description: "Welcome bonus" },
      ],
    },
    1,
  );
  assert.deepEqual(
    page.rows.map((r) => [r.kind, r.description, r.amount]),
    [
      ["purchase", "Coins purchased in the app", 10],
      ["reward", "Reward", 5],
      ["reward", "Welcome bonus", 5],
    ],
  );
});

test("unlock spends name what was unlocked instead of the backend reason code", () => {
  const page = parsePassbookPage(
    {
      data: [
        { transaction_id: "t1", transaction_type: "redemption", coin_amount: 2, description: "Redemption for storylist_unlock" },
        { transaction_id: "t2", transaction_type: "redemption", coin_amount: 1, description: "Redemption for place_unlock" },
        { transaction_id: "t3", transaction_type: "redemption", coin_amount: 1, description: "Redemption for content_hold" },
      ],
    },
    1,
  );
  assert.deepEqual(
    page.rows.map((r) => [r.kind, r.description, r.amount]),
    [
      ["unlock", "Unlocked an audio tour", -2],
      ["unlock", "Unlocked an audio story", -1],
      ["unlock", "Unlocked content", -1],
    ],
  );
});
