import { apiFetch } from "@/lib/api/client";
import { packOrderSchema, packVerifySchema, type PackOrder, type PackVerify } from "@/lib/api/schemas/coins";
import { apiMocksEnabled } from "@/lib/flags";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpayResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type CheckoutOutcome =
  | { kind: "paid"; result: RazorpayResult }
  | { kind: "dismissed" }
  | { kind: "failed"; message: string };

type RazorpayInstance = { open: () => void; on: (event: string, cb: (res: unknown) => void) => void };
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

let scriptPromise: Promise<RazorpayCtor> | null = null;

function loadCheckout(): Promise<RazorpayCtor> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!scriptPromise) {
    scriptPromise = new Promise<RazorpayCtor>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CHECKOUT_SRC;
      script.async = true;
      script.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Razorpay unavailable")));
      script.onerror = () => reject(new Error("Couldn't load Razorpay"));
      document.head.appendChild(script);
    }).catch((err) => {
      scriptPromise = null;
      throw err;
    });
  }
  return scriptPromise;
}

export function createPackOrder(productId: string): Promise<PackOrder> {
  return apiFetch("/payments/razorpay/packs/order", {
    method: "POST",
    auth: "required",
    body: { product_id: productId },
    schema: packOrderSchema,
  });
}

export function verifyPackPayment(result: RazorpayResult): Promise<PackVerify> {
  return apiFetch("/payments/razorpay/packs/verify", {
    method: "POST",
    auth: "required",
    body: result,
    schema: packVerifySchema,
  });
}

export type CheckoutPrefill = { name?: string; email?: string; contact?: string };

/** Opens Razorpay Checkout for an order created by the backend. Resolves once the modal closes. */
export async function openPackCheckout(order: PackOrder, prefill: CheckoutPrefill): Promise<CheckoutOutcome> {
  if (apiMocksEnabled) {
    return {
      kind: "paid",
      result: { razorpay_order_id: order.order_id, razorpay_payment_id: `pay_mock_${Date.now()}`, razorpay_signature: "mock" },
    };
  }

  const Razorpay = await loadCheckout();
  return new Promise<CheckoutOutcome>((resolve) => {
    let failure: string | null = null;
    const instance = new Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: "Gamana",
      description: order.display_name ?? `${order.coins} Coins`,
      prefill,
      theme: { color: "#0F7C78" },
      handler: (result: RazorpayResult) => resolve({ kind: "paid", result }),
      modal: {
        ondismiss: () => resolve(failure ? { kind: "failed", message: failure } : { kind: "dismissed" }),
      },
    });
    instance.on("payment.failed", (res) => {
      const description = (res as { error?: { description?: unknown } })?.error?.description;
      failure = typeof description === "string" && description ? description : "The payment didn't go through.";
    });
    instance.open();
  });
}
