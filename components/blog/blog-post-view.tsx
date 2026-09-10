'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { getRouteCTAByRegion } from "@/lib/data/route-ctas";
import type { ArticleBlock } from "@/content/blog/articles";
import type { BlogPost } from "@/lib/blog";
import StickyDownloadCTA from "@/components/blog/sticky-download-cta";
import EndOfArticleCTA from "@/components/blog/end-of-article-cta";
import RouteCTAModule from "@/components/blog/route-cta-module";
import RelatedPosts from "@/components/blog/related-posts";
import RelatedCities from "@/components/blog/related-cities";
import InternalLinkingWidget from "@/components/blog/internal-linking-widget";

const formatInline = (text: string) =>
  text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

const processLinks = (html: string) => {
  // Process links to ensure internal links open in the same tab
  return html.replace(/<a\s+([^>]*)>/gi, (match, attributes) => {
    // Extract href from attributes
    const hrefMatch = attributes.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) return match;

    const href = hrefMatch[1];

    // Check if it's an internal link (starts with / or points to gamana.app domain)
    const isInternal = href.startsWith('/') ||
      /^https?:\/\/(www\.)?gamana\.app/.test(href) ||
      href.startsWith('#');

    if (isInternal) {
      // Remove target="_blank" and related rel attributes from internal links
      let processedAttributes = attributes
        .replace(/\s*target=["'][^"']*["']/gi, '')
        .replace(/\s*rel=["'][^"']*["']/gi, '')
        .trim();

      return `<a ${processedAttributes}>`;
    }

    // Keep external links as they are (with target="_blank" if present)
    return match;
  });
};

const articleHtmlClassName =
  "blog-article-html [&_p]:text-base sm:[&_p]:text-lg [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-6 [&_a]:text-[#159895] [&_a]:font-medium [&_a]:underline hover:[&_a]:text-[#1A5F7A] [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-xl sm:[&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg sm:[&_h3]:text-xl md:[&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h4]:mt-6 [&_h4]:mb-3 [&_h4]:text-base sm:[&_h4]:text-lg md:[&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-gray-800 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-3 [&_ul]:mb-8 [&_ul]:text-gray-700 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-3 [&_ol]:mb-8 [&_ol]:text-gray-700 [&_blockquote]:border-l-4 [&_blockquote]:border-[#159895] [&_blockquote]:pl-4 sm:[&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:text-base sm:[&_blockquote]:text-lg md:[&_blockquote]:text-xl [&_blockquote]:mb-8 [&_figure]:mb-10 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-3xl [&_hr]:my-12";

const renderBlock = (
  block: ArticleBlock,
  index: number,
  dividerCount: number = 0
) => {
  switch (block.type) {
    case "html":
      return (
        <div
          key={index}
          className={articleHtmlClassName}
          dangerouslySetInnerHTML={{
            __html: processLinks(formatInline(block.content)),
          }}
        />
      );
    case "hero":
      const isSmallImage = block.image.includes("Lalbagh Botanical Garden- Best Self-Guided Audio Tour App for Visitors") || block.image.includes("A-panoramic-view-of-Cubbon-Park") || block.image.includes("A-panoramic-golden-hour-view-of-Marina-Beach");
      const isSquareImage = block.image.includes("A-close-up-collage-capturing-Marina-Beach-vibrant-culture");
      const isAppImage = block.image.includes("gamana-app-gps-tour") || block.image.includes("smartguide-app-museum") || block.image.includes("voicemap-app-walking-tour") || block.image.includes("gpsmycity-app-city-walks");
      const isPalaceImage = block.image.includes("Mysore Palace Audio Guide");

      // Encode the image path to handle special characters like question marks
      const encodedImagePath = encodeURI(block.image);
      return (
        <div
          key={index}
          className={`relative ${isSmallImage ? 'w-full max-w-3xl mx-auto' : isSquareImage ? 'w-full max-w-2xl mx-auto' : isAppImage ? 'w-full max-w-sm mx-auto' : isPalaceImage ? 'w-full max-w-4xl mx-auto' : 'w-full'} ${isSquareImage || isAppImage ? 'aspect-square' : isPalaceImage ? 'aspect-[4/3]' : 'aspect-[16/9]'} mb-10 overflow-hidden rounded-3xl shadow-2xl ${isAppImage ? 'bg-gray-50' : isPalaceImage ? 'bg-gray-100' : ''}`}
        >
          <Image
            src={encodedImagePath}
            alt={block.alt}
            fill
            className={isAppImage ? "object-contain p-4" : isPalaceImage ? "object-contain" : "object-cover"}
            priority={index === 0}
          />
        </div>
      );
    case "quote":
      return (
        <blockquote
          key={index}
          className="border-l-4 border-[#159895] pl-4 sm:pl-6 italic text-gray-600 text-base sm:text-lg md:text-xl mb-8"
          dangerouslySetInnerHTML={{ __html: processLinks(formatInline(block.content)) }}
        />
      );
    case "paragraph":
      return (
        <p
          key={index}
          className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 [&_a]:text-[#159895] [&_a]:font-medium [&_a]:underline [&_a:hover]:text-[#1A5F7A] [&_a]:transition-colors"
          dangerouslySetInnerHTML={{ __html: processLinks(formatInline(block.content)) }}
        />
      );
    case "heading": {
      const classes = {
        2: "mt-12 mb-4 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900",
        3: "mt-8 mb-3 text-lg sm:text-xl md:text-2xl font-semibold text-gray-900",
        4: "mt-6 mb-3 text-base sm:text-lg md:text-xl font-semibold text-gray-800",
      } as const;
      const Tag = (`h${block.level}` as keyof JSX.IntrinsicElements);

      // Special styling for conclusion headings
      if (block.content.startsWith("Conclusion:")) {
        return (
          <div key={index} className="mt-12 mb-6">
            <Tag className="bg-[#1A5F7A] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg inline-block text-xl sm:text-2xl md:text-3xl font-bold">
              {block.content}
            </Tag>
          </div>
        );
      }

      return (
        <Tag key={index} className={`${classes[block.level]} [&_a]:text-[#159895] [&_a]:font-medium [&_a]:underline [&_a:hover]:text-[#1A5F7A] [&_a]:transition-colors`}
          dangerouslySetInnerHTML={{ __html: processLinks(formatInline(block.content)) }}
        />
      );
    }
    case "list":
      return block.style === "ordered" ? (
        <ol
          key={index}
          className="list-decimal list-inside space-y-3 mb-8 text-gray-700 [&_a]:text-[#159895] [&_a]:font-medium [&_a]:underline [&_a:hover]:text-[#1A5F7A] [&_a]:transition-colors"
        >
          {block.items.map((item, itemIndex) => (
            <li
              key={itemIndex}
              dangerouslySetInnerHTML={{ __html: processLinks(formatInline(item)) }}
            />
          ))}
        </ol>
      ) : (
        <ul
          key={index}
          className="list-disc list-inside space-y-3 mb-8 text-gray-700 [&_a]:text-[#159895] [&_a]:font-medium [&_a]:underline [&_a:hover]:text-[#1A5F7A] [&_a]:transition-colors"
        >
          {block.items.map((item, itemIndex) => (
            <li
              key={itemIndex}
              dangerouslySetInnerHTML={{ __html: processLinks(formatInline(item)) }}
            />
          ))}
        </ul>
      );
    case "divider": {
      // Create subtle, varied separators that match the site's aesthetic
      const variation = dividerCount % 4;

      switch (variation) {
        case 0:
          // Variation 1: Spacing with subtle gradient dot
          return (
            <div key={index} className="flex items-center justify-center my-12">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#159895] to-[#1A5F7A] opacity-40"></div>
            </div>
          );
        case 1:
          // Variation 2: Spacing with decorative line
          return (
            <div key={index} className="my-12 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#159895]/20 to-transparent"></div>
              <div className="mx-4 w-1.5 h-1.5 rounded-full bg-[#159895]/30"></div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A5F7A]/20 to-transparent"></div>
            </div>
          );
        case 2:
          // Variation 3: Pure spacing (most subtle)
          return <div key={index} className="my-14"></div>;
        case 3:
          // Variation 4: Subtle gradient line
          return (
            <div key={index} className="my-12">
              <div className="h-px bg-gradient-to-r from-transparent via-[#57C5B6]/30 to-transparent w-3/4 mx-auto"></div>
            </div>
          );
        default:
          return <div key={index} className="my-12"></div>;
      }
    }
    case "meta-list":
      return (
        <div
          key={index}
          className="bg-[#159895]/5 border border-[#159895]/20 rounded-2xl p-6 mb-8"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[#1A5F7A] mb-3">
            Highlights
          </p>
          <ul className="space-y-2 text-gray-700">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2"
                dangerouslySetInnerHTML={{ __html: `• ${processLinks(formatInline(item))}` }}
              />
            ))}
          </ul>
        </div>
      );
    case "cta":
      return (
        <div key={index} className="relative py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 my-12 bg-white rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#159895]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A5F7A]/5 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-gray-900 leading-tight">
              {block.heading.includes("?") ? (
                <>
                  {block.heading.split("?")[0]}
                  <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">?</span>
                </>
              ) : (
                <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">{block.heading}</span>
              )}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium mb-8 [&_a]:text-[#159895] [&_a]:font-medium [&_a]:underline [&_a:hover]:text-[#1A5F7A] [&_a]:transition-colors"
              dangerouslySetInnerHTML={{ __html: processLinks(formatInline(block.subtitle)) }}
            />
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Download Gamana on Google Play"
                  className="h-14 w-auto"
                />
              </a>
              <a
                href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download Gamana on the App Store"
                  className="h-14 w-auto"
                />
              </a>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export function BlogPostView({ post }: { post: BlogPost }) {
  const routeCTA =
    post.region && post.region !== "general"
      ? getRouteCTAByRegion(post.region)
      : undefined;

  return (
    <>
      <main className="bg-white">
        <article className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#159895]/30 blur-3xl" />
            <div className="absolute bottom-10 left-0 w-96 h-96 rounded-full bg-[#1A5F7A]/30 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
            <Button
              variant="ghost"
              asChild
              className="mb-10 text-[#1A5F7A] hover:text-[#159895]"
            >
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to stories
              </Link>
            </Button>
            <div className="max-w-4xl mx-auto">
              <p className="text-xs sm:text-sm text-[#1A5F7A] font-semibold mb-4">
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                • {post.readTime}
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-6">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {post.author}
                  </p>
                  <p className="text-xs sm:text-sm">{post.authorTitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[#159895]/10 text-[#159895] text-xs font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              {(() => {
                let dividerCount = 0;
                return post.blocks.map((block, index) => {
                  if (block.type === "divider") {
                    const count = dividerCount;
                    dividerCount++;
                    return renderBlock(block, index, count);
                  }
                  return renderBlock(block, index);
                });
              })()}
            </div>
          </div>
        </article>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <EndOfArticleCTA region={post.region} title={post.title} />
          {routeCTA && <RouteCTAModule route={routeCTA} />}
          <RelatedPosts currentSlug={post.slug} currentTags={post.tags} />
          <RelatedCities region={post.region} />
          <InternalLinkingWidget />
        </div>
      </main>
      <StickyDownloadCTA />
      <Footer />
    </>
  );
}
