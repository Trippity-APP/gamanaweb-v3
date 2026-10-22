import { test } from "node:test";
import assert from "node:assert/strict";
import { isPaymentBookable, paymentFields } from "../lib/experiences/checkout.ts";

test("paymentFields always includes Flutter-parity keys when preferred is missing", () => {
  const body = paymentFields(null);
  assert.equal(Object.hasOwn(body, "uti"), true);
  assert.equal(Object.hasOwn(body, "checkout_option_type"), true);
  assert.equal(Object.hasOwn(body, "payment_method"), true);
  assert.equal(body.uti, null);
  assert.equal(body.checkout_option_type, null);
  assert.equal(body.payment_method, null);
  assert.equal(body.send_notification_to_main_contact, true);

  const json = JSON.parse(JSON.stringify(body));
  assert.equal(Object.hasOwn(json, "uti"), true);
  assert.equal(json.uti, null);
  assert.equal(Object.hasOwn(json, "checkout_option_type"), true);
});

test("paymentFields passes through preferred payment values", () => {
  const body = paymentFields({
    uti: "uti-from-bokun",
    checkout_option_type: "CUSTOMER_FULL_PAYMENT",
    payment_method: "CARD",
  });
  assert.equal(body.uti, "uti-from-bokun");
  assert.equal(body.checkout_option_type, "CUSTOMER_FULL_PAYMENT");
  assert.equal(body.payment_method, "CARD");
});

test("paymentFields keeps keys when uti is absent on preferred_payment", () => {
  const body = paymentFields({ payment_method: "CARD" });
  assert.equal(body.uti, null);
  assert.equal(body.checkout_option_type, null);
  assert.equal(body.payment_method, "CARD");
  assert.deepEqual(Object.keys(JSON.parse(JSON.stringify(body))).sort(), [
    "checkout_option_type",
    "payment_method",
    "send_notification_to_main_contact",
    "uti",
  ]);
});

test("isPaymentBookable is true when preferred_payment has uti", () => {
  assert.equal(
    isPaymentBookable({
      preferred_payment: { uti: "uti-1", payment_method: "CARD" },
    }),
    true,
  );
});

test("isPaymentBookable is true when an option has CARD + card_provider.uti", () => {
  assert.equal(
    isPaymentBookable({
      preferred_payment: null,
      options: [
        {
          type: "CUSTOMER_FULL_PAYMENT",
          payment_methods: {
            allowed: ["CARD"],
            card_provider: { uti: "uti-from-option", provider_type: "TOKEN" },
          },
        },
      ],
    }),
    true,
  );
});

test("isPaymentBookable is false for CUSTOMER_NO_PAYMENT / no uti", () => {
  assert.equal(isPaymentBookable(null), false);
  assert.equal(
    isPaymentBookable({
      preferred_payment: null,
      options: [{ type: "CUSTOMER_NO_PAYMENT", amount: 0, payment_methods: { allowed: [] } }],
    }),
    false,
  );
});
