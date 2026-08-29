"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { BlogGridSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import {
  HiOutlineBookOpen,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineSparkles,
  HiOutlineArrowRight,
} from "react-icons/hi2";

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

        // Strictly keep only published articles
        const checkPublished = (b) => {
          if (!b) return false;
          return Boolean(b.publishedAt || b.published_at || (b.status === "published"));
        };
        const publishedBlogs = fetchedBlogs.filter(checkPublished);
        setBlogs(publishedBlogs);

        if (Array.isArray(catRes?.data)) {
          setCategories(catRes.data);
        } else if (Array.isArray(catRes)) {
          setCategories(catRes);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.warn("Could not fetch published blogs from API:", err);
        setBlogs([]);
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
        <BlogGridSkeleton count={6} />
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
          <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-border space-y-4">
            <div className="w-32 h-6 rounded-full bg-card" />
            <div className="w-96 max-w-full h-10 rounded-xl bg-card" />
            <div className="w-72 max-w-full h-4 rounded bg-card" />
          </div>
          <BlogGridSkeleton count={6} />
        </div>
      }
    >
      <BlogListContent />
    </Suspense>
  );
}
