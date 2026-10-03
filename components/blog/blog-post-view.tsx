'use client';

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import { useMemo, useRef } from "react";

import Footer from "@/components/navigation/footer";
import SiteHeader from "@/components/navigation/site-header";
import { DownloadBand } from "@/components/site/DownloadBand";
import { JsonLd } from "@/components/site/JsonLd";
import { StoreBadges } from "@/components/site/StoreBadges";
import { ReadingProgress, TableOfContents, withHeadingIds } from "@/components/blog/reading-aids";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { getRouteCTAByRegion } from "@/lib/data/route-ctas";
import type { ArticleBlock } from "@/content/blog/types";
import type { BlogPost } from "@/lib/blog";
import StickyDownloadCTA from "@/components/blog/sticky-download-cta";
import RouteCTAModule from "@/components/blog/route-cta-module";
import RelatedPosts from "@/components/blog/related-posts";
import RelatedCities from "@/components/blog/related-cities";
import InternalLinkingWidget from "@/components/blog/internal-linking-widget";

const PLACEHOLDER_COVER = "/demo02.png";

/**
 * Remove the leading banner image from CMS HTML so we don't show the cover
 * twice (once from cover_image_url, once inlined at the top of content_html).
 */
function stripLeadingBannerImage(html: string): string {
  let s = html.replace(/^(?:\s*<p[^>]*>\s*<\/p>\s*)+/i, "").trimStart();
  // Optional wrapper divs around the opening banner
  const wrappedFigure = s.match(
    /^(?:<div[^>]*>\s*)*<figure[\s\S]*?<\/figure>\s*(?:<\/div>\s*)*/i
  );
  if (wrappedFigure) return s.slice(wrappedFigure[0].length);
  const figure = s.match(/^<figure[\s\S]*?<\/figure>\s*/i);
  if (figure) return s.slice(figure[0].length);
  const pImg = s.match(/^<p[^>]*>\s*<img[\s\S]*?>\s*<\/p>\s*/i);
  if (pImg) return s.slice(pImg[0].length);
  const img = s.match(/^<img[^>]*\/?>\s*/i);
  if (img) return s.slice(img[0].length);
  // First image appears shortly after open (e.g. after a short empty span)
  const earlyImg = s.match(
    /^([\s\S]{0,200}?)(<figure[\s\S]*?<\/figure>|<p[^>]*>\s*<img[\s\S]*?>\s*<\/p>|<img[^>]*\/?>)\s*/i
  );
  if (earlyImg && !/<h[1-6]\b/i.test(earlyImg[1]) && !/<p\b[^>]*>\s*[^<\s]/i.test(earlyImg[1])) {
    return s.slice(earlyImg[0].length);
  }
  return html;
}

/** Blocks ready for render: drop leading hero/HTML banner when we show CMS cover. */
function blocksWithoutDuplicateCover(
  blocks: ArticleBlock[],
  showingCmsCover: boolean
): ArticleBlock[] {
  if (!showingCmsCover || blocks.length === 0) return blocks;
  const [first, ...rest] = blocks;
  if (first.type === "hero") {
    return rest;
  }
  if (first.type === "html") {
    const stripped = stripLeadingBannerImage(first.content);
    if (!stripped.trim()) return rest;
    if (stripped === first.content) return blocks;
    return [{ ...first, content: stripped }, ...rest];
  }
  return blocks;
}

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
  "blog-article-html [&_p]:text-base sm:[&_p]:text-lg [&_p]:text-ink-soft [&_p]:leading-[1.8] [&_p]:mb-6 [&_a]:text-brand-700 [&_a]:font-medium [&_a]:underline hover:[&_a]:text-[#1A5F7A] [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-32 [&_h2]:text-xl sm:[&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-display [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg sm:[&_h3]:text-xl md:[&_h3]:text-2xl [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-ink [&_h4]:mt-6 [&_h4]:mb-3 [&_h4]:text-base sm:[&_h4]:text-lg md:[&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-gray-800 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-3 [&_ul]:mb-8 [&_ul]:text-ink-soft [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-3 [&_ol]:mb-8 [&_ol]:text-ink-soft [&_blockquote]:border-l-4 [&_blockquote]:border-[#159895] [&_blockquote]:pl-4 sm:[&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-ink-soft [&_blockquote]:text-base sm:[&_blockquote]:text-lg md:[&_blockquote]:text-xl [&_blockquote]:mb-8 [&_figure]:mb-10 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-3xl [&_hr]:my-12";

const renderBlock = (
  block: ArticleBlock,
  index: number,
  dividerCount: number = 0,
  headingId?: string
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
        2: "mt-12 mb-4 scroll-mt-32 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900",
        3: "mt-8 mb-3 text-lg sm:text-xl md:text-2xl font-semibold text-gray-900",
        4: "mt-6 mb-3 text-base sm:text-lg md:text-xl font-semibold text-gray-800",
      } as const;
      const Tag = (`h${block.level}` as keyof JSX.IntrinsicElements);

      // Special styling for conclusion headings
      if (block.content.startsWith("Conclusion:")) {
        return (
          <div key={index} className="mt-12 mb-6">
            <Tag id={headingId} className="scroll-mt-32 bg-[#1A5F7A] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg inline-block text-xl sm:text-2xl md:text-3xl font-bold">
              {block.content}
            </Tag>
          </div>
        );
      }

      return (
        <Tag key={index} id={headingId} className={`${classes[block.level]} [&_a]:text-[#159895] [&_a]:font-medium [&_a]:underline [&_a:hover]:text-[#1A5F7A] [&_a]:transition-colors`}
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
            <StoreBadges source="blog_inline_cta" keyword="travel guide app" size="lg" className="justify-center" />
          </div>
        </div>
      );
    default:
      return null;
  }
};

export function BlogPostView({ post }: { post: BlogPost }) {
  const articleRef = useRef<HTMLDivElement>(null);
  const routeCTA =
    post.region && post.region !== "general"
      ? getRouteCTAByRegion(post.region)
      : undefined;

  const hasCmsCover =
    Boolean(post.coverImage) && post.coverImage !== PLACEHOLDER_COVER;
  // Prefer CMS cover; strip the same banner from the start of content_html /
  // hero blocks so articles don't show the image twice.
  const showCoverHero = hasCmsCover;
  const { blocks: renderBlocks, headingIds } = useMemo(
    () => withHeadingIds(showCoverHero ? blocksWithoutDuplicateCover(post.blocks, true) : post.blocks),
    [post.blocks, showCoverHero],
  );
  const canonicalPath = `/blog/${post.slug}/`;

  return (
    <>
      <SiteHeader variant="solid" />
      <ReadingProgress target={articleRef} />
      <main className="bg-sand-50">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog/" },
              { name: post.title, path: canonicalPath },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              datePublished: post.date,
              author: { "@type": "Person", name: post.author },
              publisher: { "@type": "Organization", name: "Gamana", url: "https://www.gamana.app" },
              mainEntityOfPage: absoluteUrl(canonicalPath),
              ...(hasCmsCover ? { image: absoluteUrl(post.coverImage) } : {}),
            },
          ]}
        />
        <article className="container-site pb-16 pt-6 sm:pt-8">
          <nav aria-label="Breadcrumb" className="mx-auto mb-8 max-w-3xl lg:mx-0">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="focus-ring rounded hover:text-brand-700">Home</Link>
                <ChevronRight className="h-3.5 w-3.5 text-ink/30" aria-hidden />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/blog/" className="focus-ring rounded hover:text-brand-700">Blog</Link>
                <ChevronRight className="h-3.5 w-3.5 text-ink/30" aria-hidden />
              </li>
              <li aria-current="page" className="max-w-[16rem] truncate font-medium text-ink sm:max-w-md">{post.title}</li>
            </ol>
          </nav>

          <header className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-brand-700">
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {" · "}
              {post.readTime}
            </p>
            <h1 className="text-display-title mt-4 text-balance text-ink">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
              <div className="flex items-center gap-2.5 text-left">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white" aria-hidden>
                  {post.author.trim().charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{post.author}</p>
                  {post.authorTitle && <p className="text-xs text-ink-muted">{post.authorTitle}</p>}
                </div>
              </div>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {showCoverHero ? (
            <div className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-4xl shadow-lift">
              <BlogCoverImage
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_240px] xl:max-w-6xl xl:grid-cols-[minmax(0,1fr)_280px]">
            <div ref={articleRef} className="min-w-0 max-w-3xl">
              {(() => {
                let dividerCount = 0;
                return renderBlocks.map((block, index) => {
                  if (block.type === "divider") {
                    const count = dividerCount;
                    dividerCount++;
                    return renderBlock(block, index, count);
                  }
                  return renderBlock(block, index, 0, headingIds[index]);
                });
              })()}
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-32">
                <TableOfContents target={articleRef} />
              </div>
            </aside>
          </div>
        </article>

        <div className="container-site max-w-4xl space-y-4">
          {routeCTA && <RouteCTAModule route={routeCTA} />}
          <RelatedPosts currentSlug={post.slug} currentTags={post.tags} />
          <RelatedCities region={post.region} />
          <InternalLinkingWidget />
        </div>
        <DownloadBand
          title={post.region && post.region !== "general" ? "Plan this trip with Gamana" : "Use Gamana for this trip"}
          lead="Audio stories and self-guided walks that play as you explore, even without signal."
          source="blog_post_end"
          keyword="travel guide app"
        />
      </main>
      <StickyDownloadCTA />
      <Footer />
    </>
  );
}
