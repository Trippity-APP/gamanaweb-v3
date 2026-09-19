import type { Metadata } from "next";
import BlogExplorer from "@/components/blog/blog-explorer";
import Footer from "@/components/navigation/footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gamana.app"),
  title: "Blog",
  description:
    "Explore travel insights, stories, and ideas from Gamana. Discover fresh perspectives on exploring places, user experiences, and the future of smart travel.",
  alternates: {
    canonical: "https://www.gamana.app/blog",
  },
  openGraph: {
    title: "Blog | Gamana",
    description:
      "Explore travel insights, stories, and ideas from Gamana. Discover fresh perspectives on exploring places, user experiences, and the future of smart travel.",
    url: "https://www.gamana.app/blog",
    siteName: "Gamana",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Gamana",
    description:
      "Explore travel insights, stories, and ideas from Gamana. Discover fresh perspectives on exploring places, user experiences, and the future of smart travel.",
  },
};

export default function BlogPage() {
  return (
    <>
      <BlogExplorer />
      <Footer />
    </>
  );
}
