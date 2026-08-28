"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { api } from "@/lib/api";

const FALLBACK_ARTICLE = {
  title: "How to Reach Candidate Master on Codeforces in 6 Months",
  excerpt:
    "A structured roadmap covering dynamic programming, graph theory, and contest strategies from CPS Academy coaches.",
  content: `## The Journey to Candidate Master

Reaching **Candidate Master (1900+ rating)** on Codeforces requires moving beyond basic syntax to mastering advanced problem-solving techniques.

---

### 1. Master Core Data Structures
- **Segment Trees with Lazy Propagation**: Critical for range queries and range updates in $O(\\log N)$.
- **Disjoint Set Union (DSU) with Rollbacks**: Indispensable for dynamic connectivity on graphs.
- **Trie and Suffix Automaton**: String algorithms for rapid pattern matching.

---

### 2. Deepen Dynamic Programming Intuition
- **Digit DP and Tree DP**: Solving combinatorial and tree path optimization problems.
- **Bitmask DP with SOS Optimizations**: Fast subsets sum computations.
- **Matrix Exponentiation**: Evaluating high-degree linear recurrences in $O(K^3 \\log N)$.

---

### 3. Practice Strategy
1. **Target Rating Practice**: Solve 5 problems 100-200 points above your current rating every week.
2. **Post-Contest Upsolving**: Always solve the first problem you failed to crack during the live contest before reading the official editorial.`,
  coverImageUrl:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
  publishedAt: "2026-08-20",
  category: { name: "Competitive Programming" },
  author: { username: "Wasif Hasan", email: "coach@cpsacademy.io" },
};

export default function SingleBlogPostPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [blog, setBlog] = useState(FALLBACK_ARTICLE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      try {
        const res = await api.get(`/blog-posts/${slug}?populate=author&populate=category`);
        if (res?.data) {
          setBlog(res.data);
        }
      } catch (err) {
        console.warn("Could not load blog post from API:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

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
