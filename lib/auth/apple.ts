import { loadScript } from "@/lib/auth/script-loader";

type AppleSignInResponse = {
  authorization?: { id_token?: string };
  user?: { name?: { firstName?: string; lastName?: string } };
};

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void;
        signIn: () => Promise<AppleSignInResponse>;
      };
    };
  }
}

const APPLE_SRC = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

const clientId = process.env.NEXT_PUBLIC_APPLE_SERVICES_ID ?? "";
const redirectURI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? "";

export const appleConfigured = Boolean(clientId && redirectURI);

export function preloadApple(): void {
  if (appleConfigured) void loadScript(APPLE_SRC).catch(() => undefined);
}

let initialised = false;

/** Sign in with Apple JS popup → identity token, plus the name Apple sends on first sign-in only. */
export async function appleSignIn(): Promise<{ token: string; firstName?: string; lastName?: string }> {
  if (!appleConfigured) throw new Error("apple_not_configured");
  await loadScript(APPLE_SRC);
  const auth = window.AppleID?.auth;
  if (!auth) throw new Error("apple_unavailable");
  if (!initialised) {
    auth.init({ clientId, scope: "name email", redirectURI, usePopup: true });
    initialised = true;
  }
  try {
    const response = await auth.signIn();
    const token = response.authorization?.id_token;
    if (!token) throw new Error("apple_failed");
    return { token, firstName: response.user?.name?.firstName, lastName: response.user?.name?.lastName };
  } catch (error) {
    const code = (error as { error?: string })?.error;
    throw new Error(code === "popup_closed_by_user" ? "cancelled" : "apple_failed");
  }
}
