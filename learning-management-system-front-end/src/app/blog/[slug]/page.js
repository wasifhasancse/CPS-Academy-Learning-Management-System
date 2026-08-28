"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { api } from "@/lib/api";

export default function SingleBlogPostPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <h2 className="text-2xl font-bold text-foreground">Article Not Found</h2>
        <p className="text-sm text-muted">
          The blog article you are trying to view does not exist or has not been published.
        </p>
        <Button href="/blog" variant="primary" size="md">
          ← Back to Blog
        </Button>
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

  return (
    <article className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Back to Blog Navigation */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          ← Back to All Articles
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="highlight">{blog.category?.name || "Engineering"}</Badge>
          <span className="text-xs text-muted">•</span>
          <span className="text-xs text-muted">{publishDate}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            {blog.excerpt}
          </p>
        )}

        {/* Author Card */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-sm">
            {blog.author?.username?.[0]?.toUpperCase() || "C"}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {blog.author?.username || "CPS Editorial Team"}
            </div>
            <div className="text-xs text-muted">Author & CPS Instructor</div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {blog.coverImageUrl && (
        <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-muted/20 border border-border">
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body */}
      <Card className="bg-surface border-border">
        <CardContent className="p-6 sm:p-10 space-y-6">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {blog.content}
          </div>
        </CardContent>
      </Card>

      {/* Footer CTA */}
      <footer className="p-8 rounded-2xl bg-card border border-border text-center space-y-4">
        <h3 className="text-lg font-bold text-foreground">
          Ready to level up your programming skills?
        </h3>
        <p className="text-xs text-muted max-w-md mx-auto">
          Explore our structured video lessons, competitive programming tracks, and interactive quiz evaluations.
        </p>
        <div className="flex justify-center gap-3">
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
