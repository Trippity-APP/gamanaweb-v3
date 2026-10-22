import { apiMocksEnabled } from "@/lib/flags";

/** `fetch` for every backend call made through `lib/api/client.ts`. */
export async function transport(url: string, init: RequestInit): Promise<Response> {
  if (apiMocksEnabled && typeof window !== "undefined") {
    const { mockTransport } = await import("@/lib/api/mock/router");
    return mockTransport(url, init);
  }
  return fetch(url, init);
}
