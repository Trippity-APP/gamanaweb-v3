"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Filter, Library, Search, MapPin } from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import HeroHeader from "@/components/navigation/hero-header";
import RouteCTAModule from "@/components/blog/route-cta-module";
import { getRouteCTAsForIndex } from "@/lib/data/route-ctas";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import type { ImageVariant } from "@/lib/images";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { BlogExplorerSkeleton } from "@/components/ui/list-skeletons";

import type { BlogSummary } from "@/lib/blog";
import { fetchBlogSummariesFromApi } from "@/lib/blog";
import type { ArticleRegion } from "@/content/blog/types";

interface RegionSection {
  key: ArticleRegion;
  title: string;
  subtitle: string;
  posts: BlogSummary[];
}

const chipClass = (active: boolean) =>
  `focus-ring inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
    active ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink hover:border-ink/30"
  }`;

const regionSectionDefs: { key: ArticleRegion; title: string; subtitle: string }[] = [
  { key: "india", title: "Explore India", subtitle: "City walks, heritage trails, and coastal escapes across the subcontinent" },
  { key: "europe", title: "Europe and Beyond", subtitle: "Self-guided tours through London, Barcelona, and more" },
  { key: "southeast-asia", title: "Southeast Asia", subtitle: "Street markets, temples, and waterfront cities" },
  { key: "japan", title: "Japan", subtitle: "Neon-lit streets and ancient temples at your own pace" },
  { key: "middle-east", title: "Middle East", subtitle: "Modern skylines meet ancient bazaars" },
  { key: "americas", title: "The Americas", subtitle: "From New York's boroughs to South America's wonders" },
  { key: "general", title: "Product Guides", subtitle: "Tips, comparisons, and the tech behind smarter travel" },
];

type Props = {
  posts?: BlogSummary[];
  highlightSlug?: string;
  heroPhoto: ImageVariant;
};

const BlogExplorer = ({ posts: initialPosts = [], highlightSlug, heroPhoto }: Props) => {
  const [posts, setPosts] = useState<BlogSummary[]>(initialPosts);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState<ArticleRegion | null>(null);
  const [highlightCleared, setHighlightCleared] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const summaries = await fetchBlogSummariesFromApi();
        if (!cancelled) setPosts(summaries);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((post) => post.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        post.title.toLowerCase().includes(search) ||
        post.excerpt.toLowerCase().includes(search);

      const matchesTags =
        !selectedTags.length ||
        selectedTags.every((tag) => post.tags.includes(tag));
      const matchesRegion = !regionFilter || post.region === regionFilter;

      return matchesSearch && matchesTags && matchesRegion;
    });
  }, [posts, searchTerm, selectedTags, regionFilter]);

  const isFiltering = searchTerm.trim() !== "" || selectedTags.length > 0 || regionFilter !== null;

  const featuredPost = useMemo(() => {
    return filteredPosts.find((post) => post.featured) ?? filteredPosts[0];
  }, [filteredPosts]);

  const latestDeck = useMemo(() => {
    if (isFiltering) {
      return filteredPosts.filter((post) => post.slug !== featuredPost?.slug);
    }

    return filteredPosts
      .filter((post) => post.slug !== featuredPost?.slug)
      .slice(0, 6);
  }, [filteredPosts, featuredPost?.slug, isFiltering]);

  const regionSectionPosts = useMemo(() => {
    const featuredAndLatestSlugs = new Set([
      featuredPost?.slug,
      ...latestDeck.map((post) => post.slug),
    ].filter(Boolean));

    return filteredPosts.filter(
      (post) => !featuredAndLatestSlugs.has(post.slug)
    );
  }, [filteredPosts, featuredPost?.slug, latestDeck]);

  const hasMultiplePosts = filteredPosts.length > 1;

  const regionSections = useMemo<RegionSection[]>(() => {
    if (isFiltering) return [];
    return regionSectionDefs
      .map((def) => ({
        ...def,
        posts: regionSectionPosts.filter((p) => p.region === def.key),
      }))
      .filter((s) => s.posts.length > 0);
  }, [regionSectionPosts, isFiltering]);

  const routeCTAs = useMemo(() => getRouteCTAsForIndex(), []);

  useEffect(() => {
    if (!highlightSlug) return;
    const el = document.querySelector(`[data-post-id="${highlightSlug}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightSlug]);

  useEffect(() => {
    if (!highlightSlug || highlightCleared) return;
    setHighlightCleared(true);
    router.replace(pathname, { scroll: false });
  }, [highlightCleared, highlightSlug, pathname, router]);

  const handleSelectAll = () => {
    setSelectedTags([]);
  };

  const handleTagCheckboxChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags((prev) => [...prev, tag]);
    } else {
      setSelectedTags((prev) => prev.filter((item) => item !== tag));
    }
  };

  const regionChips = regionSectionDefs.filter((def) => posts.some((p) => p.region === def.key));

  return (
    <>
    <HeroHeader transparent={false} />
    <main className="min-h-screen bg-sand-50">
      <section className="container-site pt-4 sm:pt-6">
        <div className="relative isolate flex min-h-[360px] items-end overflow-hidden rounded-4xl shadow-lift sm:min-h-[400px] lg:min-h-[440px]">
          <ResponsiveImage
            image={heroPhoto}
            alt="Gamana travel blog featuring travel stories and destination guides"
            title="Gamana Travel Blog with Travel Stories and Destination Guides"
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="-z-20"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/5" aria-hidden />

          <div className="w-full px-5 pb-8 pt-16 sm:px-10 sm:pb-10 lg:px-14 lg:pb-12">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              <Library className="h-3.5 w-3.5" aria-hidden />
              Gamana Blog
            </p>
            <h1 className="text-display mt-4 max-w-3xl text-balance text-white drop-shadow-sm">
              Travel Blog for Tips, Destinations and Stories
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              Explore practical travel tips, destination guides, local experiences, and inspiring stories from the Gamana travel blog to plan better trips and find new places.
            </p>
            <div className="mt-6 flex max-w-3xl gap-2 rounded-2xl bg-white p-1.5 shadow-lift sm:p-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden />
                <Input
                  type="search"
                  aria-label="Search the blog"
                  placeholder="Search guides, cities, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 border-0 pl-12 text-base text-ink shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-12"
                />
              </div>
              <Button
                onClick={() => setFilterDialogOpen(true)}
                className="h-11 rounded-xl bg-gradient-to-r from-sunset-400 to-sunset-500 px-4 font-semibold text-white hover:from-sunset-500 hover:to-sunset-500 sm:h-12 sm:px-5"
              >
                <Filter className="h-4 w-4 sm:mr-2" aria-hidden />
                <span className="sr-only sm:not-sr-only">Topics</span>
                {selectedTags.length > 0 && (
                  <Badge className="ml-2 bg-white/25 text-white">{selectedTags.length}</Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {regionChips.length > 1 && (
        <div className="container-site pt-6">
          <div
            role="group"
            aria-label="Filter by region"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <button type="button" aria-pressed={!regionFilter} onClick={() => setRegionFilter(null)} className={chipClass(!regionFilter)}>
              All stories
            </button>
            {regionChips.map((def) => (
              <button
                key={def.key}
                type="button"
                aria-pressed={regionFilter === def.key}
                onClick={() => setRegionFilter((r) => (r === def.key ? null : def.key))}
                className={chipClass(regionFilter === def.key)}
              >
                {def.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter by Topics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="all-topics"
                checked={selectedTags.length === 0}
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="all-topics"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                All topics
              </label>
            </div>
            {availableTags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={(checked) =>
                    handleTagCheckboxChange(tag, checked as boolean)
                  }
                />
                <label
                  htmlFor={`tag-${tag}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  #{tag}
                </label>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <section
        id="stories"
        className="container-site pb-24 pt-8"
      >
        <div className="space-y-12">
          {loading ? (
            <BlogExplorerSkeleton />
          ) : posts.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              No stories available.
            </div>
          ) : null}

          {!loading && featuredPost && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              data-post-id={featuredPost.slug}
              className="focus-ring group grid overflow-hidden rounded-4xl bg-white shadow-card transition-shadow duration-500 hover:shadow-lift md:grid-cols-[1.25fr_1fr]"
            >
              <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[400px]">
                <BlogCoverImage
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105 motion-reduce:transition-none"
                />
                <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink shadow-sm">
                  Editor&apos;s pick
                </span>
              </div>
              <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:p-10">
                <div>
                  <p className="text-sm text-ink-muted">
                    {new Date(featuredPost.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {" · "}
                    {featuredPost.readTime}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 line-clamp-4 text-ink-soft">{featuredPost.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {featuredPost.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-ink/5 pt-5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{featuredPost.author}</p>
                    <p className="text-xs text-ink-muted">{featuredPost.authorTitle}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-brand-700">
                    Continue reading
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {!loading && posts.length > 0 && (isFiltering ? (
            hasMultiplePosts ? (
              <div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {latestDeck.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center rounded-3xl border border-dashed border-[#159895]/30 bg-white/80 p-10 shadow-sm">
                <p className="text-2xl font-semibold text-gray-900 mb-2">
                  No matching stories
                </p>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Try adjusting your search or clearing some filters to see more
                  results.
                </p>
              </div>
            )
          ) : (
            <>
              {!isFiltering && latestDeck.length > 0 && (
                <div className="space-y-6">
                  <div className="pt-2">
                    <h2 className="text-h3 text-ink">
                      Latest stories
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      The most recently published guides and field notes
                    </p>
                  </div>
                  <div
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {latestDeck.map((post) => (
                      <PostCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {regionSections.map((section, sIdx) => {
                const matchingCTA = routeCTAs.find(
                  (c) => c.region === section.key
                );
                const crossCTA =
                  section.key === "india"
                    ? routeCTAs.find((c) => c.id === "europe")
                    : section.key === "europe"
                    ? routeCTAs.find((c) => c.id === "southeast-asia")
                    : section.key === "southeast-asia"
                    ? routeCTAs.find((c) => c.id === "japan")
                    : section.key === "japan"
                    ? routeCTAs.find((c) => c.id === "turkey")
                    : undefined;

                return (
                  <div key={section.key} className="space-y-6">
                    <div className="pt-6">
                      <h2 className="text-h3 flex items-center gap-2 text-ink">
                        <MapPin className="h-5 w-5 text-brand-600" weight="fill" aria-hidden />
                        {section.title}
                      </h2>
                      <p className="mt-1 text-sm text-ink-muted">
                        {section.subtitle}
                      </p>
                    </div>

                    <div
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {section.posts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                      ))}
                    </div>

                    <div className="flex items-center justify-center py-4">
                      <Link
                        href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#159895]/10 text-[#1A5F7A] text-sm font-semibold hover:bg-[#159895]/20 transition-colors"
                      >
                        Use Gamana for{" "}
                        {section.key === "general"
                          ? "your next trip"
                          : `your ${section.title.toLowerCase()} trip`}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    {crossCTA && <RouteCTAModule route={crossCTA} />}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </section>
    </main>
    </>
  );
};

function PostCard({ post }: { post: BlogSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      data-post-id={post.slug}
      className="focus-ring group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-100">
        <BlogCoverImage
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs text-ink-muted">
          {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          {" · "}
          {post.readTime}
        </p>
        <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-ink">{post.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs text-ink-soft">
              #{tag}
            </span>
          ))}
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          Read
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export default BlogExplorer;

