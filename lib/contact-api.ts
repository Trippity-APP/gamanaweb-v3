export type ContactFormPayload = {
  name: string;
  email: string;
  subject: string;
  inquiryType: string;
  message: string;
};

type ContactFormResponse = {
  success: boolean;
  message: string;
};

const DEFAULT_API_URL = "https://apidev.gamana.app/api/v1";

export function getContactApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ||
    process.env.NEXT_PUBLIC_BLOG_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL
  ).replace(/\/$/, "");
}

export async function submitContactForm(
  payload: ContactFormPayload
): Promise<ContactFormResponse> {
  const baseUrl = getContactApiBaseUrl();
  const response = await fetch(`${baseUrl}/contact`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | ContactFormResponse
    | { detail?: string }
    | null;

  if (!response.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data && data.detail
        ? String(data.detail)
        : "Unable to send your message. Please try again or email support@gamana.app.";
    throw new Error(detail);
  }

  return {
    success: true,
    message:
      data && typeof data === "object" && "message" in data && data.message
        ? String(data.message)
        : "Your message has been sent.",
  };
}
