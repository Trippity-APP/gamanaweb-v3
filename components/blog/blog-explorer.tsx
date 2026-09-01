"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Filter, Library, Search, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { BlogExplorerSkeleton } from "@/components/ui/list-skeletons";

import type { BlogSummary } from "@/lib/blog";
import { fetchBlogSummariesFromApi } from "@/lib/blog";
import type { ArticleRegion } from "@/content/blog/articles";

interface RegionSection {
  key: ArticleRegion;
  title: string;
  subtitle: string;
  posts: BlogSummary[];
}

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
};

const BlogExplorer = ({ posts: initialPosts = [], highlightSlug }: Props) => {
  const [posts, setPosts] = useState<BlogSummary[]>(initialPosts);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

      return matchesSearch && matchesTags;
    });
  }, [posts, searchTerm, selectedTags]);

  const isFiltering = searchTerm.trim() !== "" || selectedTags.length > 0;

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#E0F7F4]">
      <section className="relative h-[62vh] sm:h-[68vh] flex items-center justify-center text-white overflow-hidden">
        {/* Same amber-into-brand-teal family as Partner with Gamana (not the plum-rose
            attempt, which didn't land) — warm gold lean, lower opacity so the photo reads
            clearly. Photo swapped to one that actually shows a traveler in the scene
            (golden-hour Mehrangarh Fort), fitting for a page about a travel blog rather
            than a monument-only shot. */}
        <div className="absolute inset-0">
          <HeroSlideshow
            images={[
              "/solo-woman-traveler-mehrangarh-fort-jodhpur-golden-hour.jpg",
              "/hostel-travel-india-varanasi-ghat-traveler.jpg",
              "/solo-traveler-offline-guide-historical-site.jpg",
              "/traveller-jama-masjid-courtyard-self-guided-audio-tour-delhi.png",
            ]}
          />
          {/* No colour wash here — this page keeps the photo unfiltered, with only the
              same neutral scrim every other hero uses for white-text legibility. */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <HeroHeader transparent />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-[520px] h-[520px] bg-white/70 rounded-full blur-[160px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-72 h-72 bg-white/40 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-24 sm:pb-28">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-2 bg-white/15 px-5 py-2 rounded-full text-sm font-semibold tracking-widest uppercase opacity-0 animate-fade-in">
              <Library className="h-4 w-4" />
              Gamana Blog
            </div>
            <div className="space-y-6">
              <div className="inline-block w-fit">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-2 opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
                  Stories that move you
                </h1>
                <div className="h-2 bg-white/60 rounded-full opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}></div>
              </div>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
                Field reports, product notes, and storytelling experiments from
                the team building hands-free exploration. No marketing fluff here, just practical insights straight from our narrators and studios.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Search + filters, floated up over the hero photo as one unified card, matching the
          overlapping-panel pattern used across /marketplace-redesign, /cities, /ecosystem,
          and /contact — previously these floated as two separate white elements. */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-16 relative z-10 pb-10">
        <div className="max-w-4xl mx-auto rounded-2xl border border-gray-100 bg-white shadow-lg p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search stories, narrators, topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-gray-300"
              />
            </div>
            <Button
              size="lg"
              onClick={() => setFilterDialogOpen(true)}
              className="bg-[#159895] hover:bg-[#128a86] text-white font-semibold h-12"
            >
              <Filter className="mr-2 h-5 w-5" />
              Filters
              {selectedTags.length > 0 && (
                <Badge className="ml-2 bg-white/20 text-white">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </section>

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
        className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24"
      >
        <div className="max-w-6xl mx-auto space-y-10">
          {loading ? (
            <BlogExplorerSkeleton />
          ) : posts.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              No stories available.
            </div>
          ) : null}

          {!loading && featuredPost && (
            <Link href={`/blog/${featuredPost.slug}`}>
              <Card
                data-post-id={featuredPost.slug}
                className="overflow-hidden border-2 border-transparent hover:border-[#159895]/40 transition-all cursor-pointer"
              >
                <div className="grid md:grid-cols-2">
                  <div className="relative h-72 md:h-full w-full overflow-hidden">
                    <BlogCoverImage
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-[#1A5F7A]">
                      Editor&apos;s pick
                    </div>
                  </div>
                  <CardContent className="p-8 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(featuredPost.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        • {featuredPost.readTime}
                      </p>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {featuredPost.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-[#159895]/10 text-[#159895]"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {featuredPost.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {featuredPost.authorTitle}
                        </p>
                      </div>
                      <span className="inline-flex items-center font-semibold text-[#1A5F7A]">
                        Continue Reading
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          )}

          {!loading && posts.length > 0 && (isFiltering ? (
            hasMultiplePosts ? (
              <div
                className={`grid grid-cols-1 gap-6 ${
                  latestDeck.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1"
                }`}
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
                    <p className="text-xs uppercase tracking-widest font-semibold text-[#1A5F7A] mb-1">
                      Latest stories
                    </p>
                    <p className="text-gray-500 text-sm">
                      The most recently published guides and field notes
                    </p>
                  </div>
                  <div
                    className={`grid grid-cols-1 gap-6 ${
                      latestDeck.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1"
                    }`}
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
                      <div className="flex items-center gap-2 text-[#1A5F7A] mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-widest font-semibold">
                          {section.title}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">
                        {section.subtitle}
                      </p>
                    </div>

                    <div
                      className={`grid grid-cols-1 gap-6 ${
                        section.posts.length > 1
                          ? "md:grid-cols-2"
                          : "md:grid-cols-1"
                      }`}
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
  );
};

function PostCard({ post }: { post: BlogSummary }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card
        data-post-id={post.slug}
        className="flex flex-col border border-gray-100 hover:border-[#159895]/40 transition-all cursor-pointer h-full"
      >
        <div className="relative w-full aspect-[16/10]">
          <BlogCoverImage
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover rounded-t-2xl"
          />
        </div>
        <CardContent className="flex flex-col flex-1 p-6">
          <p className="text-xs text-gray-500 mb-2">
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {post.readTime}
          </p>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 flex-1">{post.excerpt}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-gray-100">
                #{tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {post.author}
              </p>
              <p className="text-xs text-gray-500">{post.authorTitle}</p>
            </div>
            <span className="inline-flex items-center font-semibold text-[#1A5F7A] text-sm">
              Read
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default BlogExplorer;

