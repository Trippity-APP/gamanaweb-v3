import { loadScript } from "@/lib/auth/script-loader";

type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken: (opts?: { prompt?: string }) => void };

type GisOAuth2 = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: { type?: string }) => void;
  }) => TokenClient;
};

const GIS_SRC = "https://accounts.google.com/gsi/client";

export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function preloadGoogle(): void {
  if (googleClientId) void loadScript(GIS_SRC).catch(() => undefined);
}

/** Google Identity Services token client → OAuth access token (scopes `openid email profile`). */
export async function getGoogleAccessToken(): Promise<string> {
  if (!googleClientId) throw new Error("google_not_configured");
  await loadScript(GIS_SRC);
  // `window.google` is already typed by the Maps SDK, which doesn't know about GIS.
  const oauth2 = (window as unknown as { google?: { accounts?: { oauth2?: GisOAuth2 } } }).google?.accounts?.oauth2;
  if (!oauth2) throw new Error("google_unavailable");
  return new Promise((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: googleClientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error(response.error ?? "google_failed"));
      },
      error_callback: (error) => reject(new Error(error.type === "popup_closed" ? "cancelled" : "google_failed")),
    });
    client.requestAccessToken({ prompt: "select_account" });
  });
}
