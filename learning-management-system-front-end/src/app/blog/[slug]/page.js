"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { api } from "@/lib/api";
import {
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineBookOpen,
  HiOutlineShare,
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
} from "react-icons/hi2";

export default function SingleBlogPostPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      setIsLoading(true);
      try {
        // 1. Try finding by slug
        let res = await api
          .get(`/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=author&populate=category`)
          .catch(() => null);

        let foundBlog = res?.data?.[0];

        // 2. If not found by slug, try by documentId/id
        if (!foundBlog) {
          const directRes = await api
            .get(`/blog-posts/${slug}?populate=author&populate=category`)
            .catch(() => null);
          foundBlog = directRes?.data;
        }

        if (foundBlog) {
          setBlog(foundBlog);

          // 3. Fetch related articles
          const allRes = await api
            .get("/blog-posts?populate=author&populate=category")
            .catch(() => ({ data: [] }));
          const allArticles = Array.isArray(allRes?.data) ? allRes.data : [];
          const related = allArticles
            .filter((b) => (b.documentId || b.id) !== (foundBlog.documentId || foundBlog.id))
            .slice(0, 3);
          setRelatedBlogs(related);
        } else {
          setBlog(null);
        }
      } catch (err) {
        console.warn("Could not load blog post from API:", err);
        setBlog(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="w-32 h-4 bg-surface rounded" />
        <div className="w-24 h-6 bg-surface rounded" />
        <div className="w-3/4 h-12 bg-surface rounded" />
        <div className="w-full h-80 bg-surface rounded-2xl" />
        <div className="w-full h-48 bg-surface rounded-xl" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-primary">
          <HiOutlineBookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Article Not Found</h2>
        <p className="text-sm text-muted">
          The blog article you are trying to view does not exist or has not been published.
        </p>
        <div className="pt-2">
          <Button href="/blog" variant="primary" size="md">
            ← Back to Engineering Blog
          </Button>
        </div>
      </div>
    );
  }

  const publishDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Published";

  const wordCount = (blog.content || blog.excerpt || "").split(/\s+/).length;
  const readMinutes = Math.max(3, Math.ceil(wordCount / 180));

  return (
    <article className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground hover:bg-surface/80 transition-colors cursor-pointer"
        >
          <HiOutlineShare className="w-3.5 h-3.5" />
          <span>{copied ? "Link Copied! ✓" : "Share Article"}</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <Badge variant="highlight">{blog.category?.name || "Engineering"}</Badge>
          <span className="flex items-center gap-1">
            <HiOutlineCalendar className="w-3.5 h-3.5" />
            <span>{publishDate}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <HiOutlineClock className="w-3.5 h-3.5" />
            <span>{readMinutes} min read</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="text-base sm:text-lg text-muted leading-relaxed font-normal">
            {blog.excerpt}
          </p>
        )}

        {/* Author Card */}
        <div className="flex items-center gap-3.5 pt-4 border-t border-border">
          <div className="w-11 h-11 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
            {blog.author?.username?.[0]?.toUpperCase() || "C"}
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">
              {blog.author?.username || "CPS Editorial Team"}
            </div>
            <div className="text-xs text-muted">
              {blog.author?.email ? blog.author.email : "CPS Academy Technical Instructor"}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Cover Image */}
      {blog.coverImageUrl && (
        <div className="w-full h-72 sm:h-96 lg:h-[420px] rounded-2xl overflow-hidden bg-surface border border-border shadow-xs">
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body Content */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-6 sm:p-10 space-y-6">
          <div className="text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
            {blog.content}
          </div>
        </CardContent>
      </Card>

      {/* Related Articles Section */}
      {relatedBlogs.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Read Next on CPS Blog</h3>
            <Link href="/blog" className="text-xs font-bold text-primary dark:text-highlight hover:underline">
              View All Articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedBlogs.map((rel) => {
              const relSlug = rel.slug || String(rel.documentId || rel.id);
              return (
                <Card key={rel.documentId || rel.id} className="p-4 border-border bg-card flex flex-col justify-between group hover:border-primary transition-all">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-[10px]">
                      {rel.category?.name || "Topic"}
                    </Badge>
                    <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      <Link href={`/blog/${relSlug}`}>{rel.title}</Link>
                    </h4>
                  </div>
                  <Link href={`/blog/${relSlug}`} className="mt-3 text-[11px] font-bold text-primary dark:text-highlight inline-flex items-center gap-1">
                    <span>Read Article</span>
                    <HiOutlineArrowRight className="w-3 h-3" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Course CTA Banner */}
      <footer className="p-8 rounded-2xl bg-surface border border-border text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center mx-auto shadow-sm">
          <HiOutlineAcademicCap className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-foreground">
            Level Up Your Programming Career
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Master Data Structures, Algorithms, and Software Architecture with hands-on practice, video lessons, and verified checkpoint quizzes.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Button href="/courses" variant="primary" size="sm">
            Explore Courses
          </Button>
          <Button href="/blog" variant="outline" size="sm">
            More Articles
          </Button>
        </div>
      </footer>
    </article>
  );
}
