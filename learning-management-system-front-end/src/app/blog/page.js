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
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-10">
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

            const authorName = blog.author?.username || "CPS Team";

            return (
              <div
                key={blog.documentId || blog.id || slug}
                className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between hover:border-[#309255] transition-all duration-300 transform hover:-translate-y-0.5 shadow-1 hover:shadow-1"
              >
                {/* 1. Top Image & Badges */}
                <div className="h-44 sm:h-48 w-full overflow-hidden bg-surface relative flex items-center justify-center border-b border-border">
                  {blog.coverImageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={blog.coverImageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#E7F8EE] dark:bg-[#181E27] flex items-center justify-center p-5 text-center">
                      <HiOutlineBookOpen className="w-9 h-9 text-[#309255] opacity-60" />
                    </div>
                  )}

                  {/* Top Left Category Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#309255] text-white font-bold text-[11px] tracking-wide shadow-1 border border-white/20">
                      {blog.category?.name || "Engineering"}
                    </span>
                  </div>

                  {/* Top Right Read Duration */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#212832]/85 backdrop-blur-md text-white font-medium text-[11px] border border-white/20 shadow-1">
                      <HiOutlineClock className="w-3 h-3 text-[#E7F8EE]" />
                      <span>{readMinutes} min read</span>
                    </span>
                  </div>
                </div>

                {/* 2. Middle Body */}
                <div className="p-4.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <Link href={`/blog/${slug}`} className="block">
                      <h3 className="text-[15px] sm:text-base font-bold text-foreground leading-snug group-hover:text-[#309255] transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                    </Link>
                    <p className="line-clamp-3 text-xs text-muted leading-relaxed">
                      {blog.excerpt || "Read the full technical breakdown on CPS Academy."}
                    </p>
                  </div>

                  {/* 3. Footer Attribution & Action */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#309255]/25">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-[11px] leading-none truncate max-w-[110px]">
                          {authorName}
                        </span>
                        <span className="text-[9.5px] text-muted mt-0.5">{publishDate}</span>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${slug}`}
                      className="text-xs font-bold text-[#309255] dark:text-[#E7F8EE] hover:underline inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Read Article</span>
                      <HiOutlineArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
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
