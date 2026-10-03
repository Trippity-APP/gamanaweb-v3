import type { Metadata } from "next";
import BlogExplorer from "@/components/blog/blog-explorer";
import { getPhoto } from "@/lib/images";
import Footer from "@/components/navigation/footer";
import { OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gamana.app"),
  title: { absolute: "Travel Blog for Tips, Destinations and Stories | Gamana" },
  description:
    "Explore the Gamana travel blog for destination ideas, practical travel tips, local experiences and inspiring stories to help you plan and enjoy your next journey.",
  alternates: {
    canonical: "https://www.gamana.app/blog/",
  },
  openGraph: {
    title: "Travel Blog for Tips, Destinations and Stories | Gamana",
    description:
      "Explore the Gamana travel blog for destination ideas, practical travel tips, local experiences and inspiring stories to help you plan and enjoy your next journey.",
    url: "https://www.gamana.app/blog/",
    siteName: "Gamana",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Blog for Tips, Destinations and Stories | Gamana",
    description:
      "Explore the Gamana travel blog for destination ideas, practical travel tips, local experiences and inspiring stories to help you plan and enjoy your next journey.",
    images: [OG_IMAGE.url],
  },
};

export default function BlogPage() {
  return (
    <>
      <BlogExplorer heroPhoto={getPhoto("hero-blog")} />
      <Footer />
    </>
  );
}
