import { getApiBaseUrl } from "@/lib/api-base";
import { authHeaders, getStoredAccessToken } from "@/lib/auth-api";

export type RazorpayOrder = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  transactionId: string;
  coinAmount?: number;
};

export type VerifyPaymentResult = {
  coinsCredited: number;
  newBalance?: number;
  paymentId: string;
  transactionId: string;
};

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
  detail?: string;
};

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export async function createRazorpayOrder(input: {
  fiatAmount: number;
  fiatCurrency?: string;
  accessToken?: string | null;
}): Promise<RazorpayOrder> {
  const token = input.accessToken ?? getStoredAccessToken();
  if (!token) throw new Error("Please log in to continue.");

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/payments/razorpay/create-order`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      fiat_amount: input.fiatAmount.toFixed(2),
      fiat_currency: (input.fiatCurrency ?? "INR").toUpperCase(),
    }),
  });

  const data = (await response.json().catch(() => ({}))) as ApiEnvelope<Record<string, unknown>>;
  if (!response.ok) {
    throw new Error(
      pickString(data.detail, data.message) ||
        "Could not start checkout. Please try again."
    );
  }

  const payload = data.data ?? {};
  const orderId = pickString(payload.order_id, payload.orderId);
  const keyId = pickString(payload.key_id, payload.keyId);
  const transactionId = pickString(payload.transaction_id, payload.transactionId);
  const amount = toNumber(payload.amount);
  const currency = pickString(payload.currency) ?? "INR";

  if (!orderId || !keyId || !transactionId || amount == null) {
    throw new Error("Payment order response was incomplete.");
  }

  return {
    orderId,
    amount,
    currency,
    keyId,
    transactionId,
    coinAmount: toNumber(payload.coin_amount),
  };
}

export async function verifyRazorpayPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  transactionId: string;
  accessToken?: string | null;
}): Promise<VerifyPaymentResult> {
  const token = input.accessToken ?? getStoredAccessToken();
  if (!token) throw new Error("Please log in to continue.");

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/payments/razorpay/verify-payment`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      razorpay_order_id: input.razorpayOrderId,
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_signature: input.razorpaySignature,
      transaction_id: input.transactionId,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as ApiEnvelope<Record<string, unknown>>;
  if (!response.ok) {
    throw new Error(
      pickString(data.detail, data.message) ||
        "Payment verification failed. Contact support@gamana.app if you were charged."
    );
  }

  const payload = data.data ?? {};
  return {
    coinsCredited: toNumber(payload.coins_credited) ?? toNumber(payload.coin_amount) ?? 0,
    newBalance: toNumber(payload.new_balance),
    paymentId: pickString(payload.payment_id) ?? input.razorpayPaymentId,
    transactionId: pickString(payload.transaction_id) ?? input.transactionId,
  };
}
