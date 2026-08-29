"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import {
  HiOutlineBookOpen,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineSparkles,
  HiOutlineArrowRight,
} from "react-icons/hi2";

const FALLBACK_BLOGS = [
  {
    id: 1,
    documentId: "blog-1",
    title: "How to Reach Candidate Master on Codeforces in 6 Months",
    slug: "how-to-reach-candidate-master-on-codeforces",
    excerpt:
      "A structured roadmap covering dynamic programming, graph theory, and contest strategies from CPS Academy coaches.",
    content: `## The Journey to Candidate Master\n\nReaching **Candidate Master (1900+ rating)** on Codeforces requires moving beyond basic syntax to mastering advanced problem-solving techniques.\n\n### 1. Master Core Data Structures\n- Segment Trees with Lazy Propagation\n- Disjoint Set Union (DSU) with Rollbacks\n- Trie and Suffix Automaton\n\n### 2. Deepen Dynamic Programming Intuition\n- Digit DP and Tree DP\n- Bitmask DP with SOS optimizations\n- Matrix Exponentiation for recurrence relations\n\n### 3. Practice Strategy\nSolve 5 problems above your current rating every week and rigorously upsolve contest problems you couldn't solve during the live round.`,
    coverImageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
    category: { name: "Competitive Programming", slug: "competitive-programming" },
    author: { username: "CPS Editorial Team" },
    publishedAt: new Date().toISOString(),
  },
  {
    id: 2,
    documentId: "blog-2",
    title: "Building Resilient Microservices with Clean Architecture",
    slug: "building-resilient-microservices-clean-architecture",
    excerpt:
      "Key architectural patterns for designing fault-tolerant, scalable distributed systems.",
    content: `## Scalable Architecture Principles\n\nDesigning microservices requires strict boundary enforcement, idempotent APIs, and robust messaging brokers.\n\n### Key Tenets\n1. **Domain-Driven Design (DDD)**: Separate bounded contexts cleanly.\n2. **Outbox Pattern**: Ensure reliable message delivery to message queues without distributed locks.\n3. **Circuit Breakers**: Gracefully handle downstream service degradation.`,
    coverImageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
    category: { name: "Software Engineering", slug: "software-engineering" },
    author: { username: "CPS Editorial Team" },
    publishedAt: new Date().toISOString(),
  },
  {
    id: 3,
    documentId: "blog-3",
    title: "Mastering Segment Trees: From Range Sum to Lazy Propagation",
    slug: "mastering-segment-trees-lazy-propagation",
    excerpt:
      "A comprehensive guide with C++ templates and visualization for range queries and range updates in O(log N).",
    content: `## Segment Tree Foundations\n\nSegment Trees are one of the most versatile tree data structures in competitive programming, allowing range queries and range updates in logarithmic time.\n\n### Why Segment Trees?\nWhile Fenwick Trees (Binary Indexed Trees) are simpler for prefix sums, Segment Trees support arbitrary associative range operations: Range Minimum Queries (RMQ), GCD, Matrix Multiplication, and Subsegment Maximum Sums.`,
    coverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
    category: { name: "Competitive Programming", slug: "competitive-programming" },
    author: { username: "CPS Editorial Team" },
    publishedAt: new Date().toISOString(),
  },
];

function BlogListContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || searchParams?.get("q") || "";

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      setIsLoading(true);
      try {
        const [blogRes, catRes] = await Promise.all([
          api.get("/blog-posts?populate[author]=*&populate[category]=*").catch(() => null),
          api.get("/categories").catch(() => null),
        ]);

        let fetchedBlogs = [];
        if (Array.isArray(blogRes?.data)) {
          fetchedBlogs = blogRes.data;
        } else if (Array.isArray(blogRes)) {
          fetchedBlogs = blogRes;
        } else if (blogRes?.data && typeof blogRes.data === "object") {
          fetchedBlogs = [blogRes.data];
        }

        if (fetchedBlogs.length > 0) {
          setBlogs(fetchedBlogs);
        } else {
          setBlogs(FALLBACK_BLOGS);
        }

        if (Array.isArray(catRes?.data)) {
          setCategories(catRes.data);
        } else if (Array.isArray(catRes)) {
          setCategories(catRes);
        } else {
          setCategories([
            { name: "Competitive Programming", slug: "competitive-programming" },
            { name: "Software Engineering", slug: "software-engineering" },
          ]);
        }
      } catch (err) {
        console.warn("Could not fetch published blogs from API, using fallback:", err);
        setBlogs(FALLBACK_BLOGS);
      } finally {
        setIsLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    const titleMatch =
      !urlSearch ||
      blog.title?.toLowerCase().includes(urlSearch.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(urlSearch.toLowerCase()) ||
      blog.content?.toLowerCase().includes(urlSearch.toLowerCase());
    const catMatch =
      selectedCategory === "all" ||
      blog.category?.slug === selectedCategory ||
      blog.category?.name === selectedCategory ||
      blog.category?.documentId === selectedCategory ||
      String(blog.category?.id) === selectedCategory;
    return titleMatch && catMatch;
  });

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-10">
      {/* Hero Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary dark:text-highlight">
          <HiOutlineSparkles className="w-3.5 h-3.5" />
          <span>CPS Academy Engineering & Tech Blog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Articles, Roadmaps & Engineering Insights
        </h1>
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
          Deep-dives into Competitive Programming, Data Structures, Full-Stack Architecture, and System Design from CPS instructors.
        </p>
      </div>

      {/* Clean Category Filter Navigation */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto p-1.5 rounded-2xl bg-surface/60 border border-border">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground hover:bg-surface"
            }`}
          >
            All Articles ({blogs.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === (cat.slug || cat.name);
            const categoryArticlesCount = blogs.filter(
              (b) => b.category?.slug === cat.slug || b.category?.name === cat.name
            ).length;

            return (
              <button
                key={cat.documentId || cat.id || cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug || cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`}
              >
                <span>{cat.name}</span>
                {categoryArticlesCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-card border border-border text-muted"
                    }`}
                  >
                    {categoryArticlesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active URL Search Indicator */}
        {urlSearch && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted">
            <span>
              Search results for &ldquo;<strong className="text-foreground">{urlSearch}</strong>&rdquo; ({filteredBlogs.length} articles)
            </span>
            <Link
              href="/blog"
              className="text-primary dark:text-highlight hover:underline font-bold text-xs ml-1"
            >
              Clear Search ✕
            </Link>
          </div>
        )}
      </div>

      {/* Blog Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-3xl border border-border bg-card overflow-hidden animate-pulse flex flex-col justify-between">
              <div className="w-full h-48 bg-surface" />
              <div className="p-6 space-y-3">
                <div className="w-20 h-4 bg-surface rounded" />
                <div className="w-full h-6 bg-surface rounded" />
                <div className="w-3/4 h-4 bg-surface rounded" />
                <div className="pt-4 border-t border-border flex justify-between">
                  <div className="w-24 h-4 bg-surface rounded" />
                  <div className="w-16 h-4 bg-surface rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <EmptyState
          icon={<HiOutlineBookOpen className="w-8 h-8 text-muted" />}
          title="No Matching Articles Found"
          description={
            urlSearch || selectedCategory !== "all"
              ? "No published engineering articles match your active search or category filter."
              : "No blog articles have been published yet on CPS Academy. Check back soon!"
          }
          action={
            (urlSearch || selectedCategory !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory("all")}
                href="/blog"
              >
                Reset All Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => {
            const slug = blog.slug || String(blog.documentId || blog.id);
            const publishDate = blog.publishedAt
              ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently Published";

            const wordCount = (blog.content || blog.excerpt || "").split(/\s+/).length;
            const readMinutes = Math.max(3, Math.ceil(wordCount / 180));

            return (
              <Card
                key={blog.documentId || blog.id || slug}
                className="flex flex-col justify-between overflow-hidden hover:border-primary transition-all duration-200 group border-2 border-border bg-card shadow-xs rounded-3xl"
              >
                {blog.coverImageUrl ? (
                  <div className="h-48 w-full overflow-hidden bg-surface relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.coverImageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-36 w-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center p-6 text-center border-b border-border">
                    <HiOutlineBookOpen className="w-10 h-10 text-primary dark:text-highlight opacity-60" />
                  </div>
                )}

                <CardHeader className="pb-3 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted mb-2.5">
                    <Badge variant="outline" className="text-[11px] font-semibold">
                      {blog.category?.name || "Engineering"}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px]">
                      <HiOutlineClock className="w-3.5 h-3.5 text-secondary" />
                      <span>{readMinutes} min read</span>
                    </span>
                  </div>

                  <CardTitle className="text-base sm:text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    <Link href={`/blog/${slug}`}>{blog.title}</Link>
                  </CardTitle>

                  <CardDescription className="line-clamp-3 text-xs mt-2 text-muted leading-relaxed">
                    {blog.excerpt || "Read the full technical breakdown on CPS Academy."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 flex items-center justify-between border-t border-border mt-auto pt-3.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/15 text-primary dark:text-highlight flex items-center justify-center font-bold text-xs shrink-0">
                      {blog.author?.username?.[0]?.toUpperCase() || "C"}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-xs leading-none">
                        {blog.author?.username || "CPS Team"}
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">{publishDate}</div>
                    </div>
                  </div>

                  <Link href={`/blog/${slug}`} className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-foreground transition-colors">
                    <span>Read Article</span>
                    <HiOutlineArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BlogListPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-12 px-4 max-w-[1400px] mx-auto space-y-8 animate-pulse">
          <div className="h-20 bg-surface rounded-2xl max-w-md mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-surface rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <BlogListContent />
    </Suspense>
  );
}
