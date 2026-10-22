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
