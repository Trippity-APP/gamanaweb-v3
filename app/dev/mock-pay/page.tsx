import type { Metadata } from "next";
import { MockPayClient } from "@/components/dev/MockPayClient";

export const metadata: Metadata = {
  title: "Mock payment",
  robots: { index: false, follow: false },
};

export default function MockPayPage() {
  return <MockPayClient />;
}
