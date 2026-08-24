import BlogExplorer from "@/components/blog/blog-explorer";
import Footer from "@/components/navigation/footer";
import { getAllPostSummaries } from "@/lib/blog";

export default async function BlogPage() {
  const posts = getAllPostSummaries();

  return (
    <>
      <BlogExplorer posts={posts} highlightSlug={undefined} />
      <Footer />
    </>
  );
}

