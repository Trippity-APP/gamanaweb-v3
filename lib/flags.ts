/**
 * Gates every logged-in feature (login, account, wallet, collection, booking). When off:
 * no Log in button, `/account/*` shows "Coming soon", and experiences "Book now" hands off
 * to the app. Public Experiences browse pages ship regardless.
 */
export const webAccountsEnabled = process.env.NEXT_PUBLIC_WEB_ACCOUNTS === "1";
