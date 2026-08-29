"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CourseCard } from "@/components/courses/CourseCard";
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
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

export default function SingleBlogPostPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadArticleAndCourses() {
      if (!slug) return;
      setIsLoading(true);
      try {
        // 1. Try finding blog by slug
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

        // 3. Fallback: match in sample blogs list
        if (!foundBlog) {
          const sampleMatch = [
            {
              id: 1,
              documentId: "blog-1",
              title: "How to Reach Candidate Master on Codeforces in 6 Months",
              slug: "how-to-reach-candidate-master-on-codeforces",
              excerpt:
                "A structured roadmap covering dynamic programming, graph theory, and contest strategies from CPS Academy coaches.",
              content: `Reaching Candidate Master (1900+ rating) on Codeforces requires moving beyond basic syntax to mastering advanced problem-solving techniques.\n\n### 1. Master Core Data Structures\n- Segment Trees with Lazy Propagation\n- Disjoint Set Union (DSU) with Rollbacks\n- Trie and Suffix Automaton\n\n### 2. Deepen Dynamic Programming Intuition\n- Digit DP and Tree DP\n- Bitmask DP with SOS optimizations\n- Matrix Exponentiation for recurrence relations\n\n### 3. Practice Strategy\nSolve 5 problems above your current rating every week and rigorously upsolve contest problems you couldn't solve during the live round.`,
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
              content: `Designing microservices requires strict boundary enforcement, idempotent APIs, and robust messaging brokers.\n\n### Key Tenets\n1. Domain-Driven Design (DDD): Separate bounded contexts cleanly.\n2. Outbox Pattern: Ensure reliable message delivery to message queues without distributed locks.\n3. Circuit Breakers: Gracefully handle downstream service degradation.`,
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
              content: `Segment Trees are one of the most versatile tree data structures in competitive programming, allowing range queries and range updates in logarithmic time.\n\n### Why Segment Trees?\nWhile Fenwick Trees (Binary Indexed Trees) are simpler for prefix sums, Segment Trees support arbitrary associative range operations: Range Minimum Queries (RMQ), GCD, Matrix Multiplication, and Subsegment Maximum Sums.`,
              coverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
              category: { name: "Competitive Programming", slug: "competitive-programming" },
              author: { username: "CPS Editorial Team" },
              publishedAt: new Date().toISOString(),
            },
          ];

          foundBlog = sampleMatch.find((b) => {
            const bSlug = (b.slug || "").toLowerCase();
            const bDocId = (b.documentId || "").toLowerCase();
            const target = slug.toLowerCase();
            return bSlug === target || bDocId === target;
          });
        }

        // 3. Fetch courses to match recommended courses dynamically
        const coursesRes = await api
          .get("/courses?populate[modules][populate]=lessons&populate[quizzes]=*&populate[category]=*&populate[instructor]=*&populate[enrollments]=*")
          .catch(() => ({ data: [] }));
        const allCourses = Array.isArray(coursesRes?.data) ? coursesRes.data : [];

        if (foundBlog) {
          setBlog(foundBlog);

          // Fetch related articles
          const allRes = await api
            .get("/blog-posts?populate=author&populate=category")
            .catch(() => ({ data: [] }));
          const allArticles = Array.isArray(allRes?.data) ? allRes.data : [];
          const related = allArticles
            .filter((b) => (b.documentId || b.id) !== (foundBlog.documentId || foundBlog.id))
            .slice(0, 3);
          setRelatedBlogs(related);

          // Find courses matching the blog's category or keywords
          const blogCatName = (foundBlog.category?.name || "").toLowerCase();
          const blogCatSlug = (foundBlog.category?.slug || "").toLowerCase();

          const matchingCourses = allCourses.filter((c) => {
            const cCatName = (c.category?.name || "").toLowerCase();
            const cCatSlug = (c.category?.slug || "").toLowerCase();
            return (
              (blogCatName && cCatName.includes(blogCatName)) ||
              (blogCatSlug && cCatSlug.includes(blogCatSlug))
            );
          });

          if (matchingCourses.length >= 3) {
            setRecommendedCourses(matchingCourses.slice(0, 3));
          } else {
            // Supplement with remaining catalog courses
            const remaining = allCourses.filter((c) => !matchingCourses.includes(c));
            setRecommendedCourses([...matchingCourses, ...remaining].slice(0, 3));
          }
        } else {
          setBlog(null);
          setRecommendedCourses(allCourses.slice(0, 3));
        }
      } catch (err) {
        console.warn("Could not load blog post from API:", err);
        setBlog(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadArticleAndCourses();
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
  const authorName = blog.author?.username || blog.author?.name || "CPS Editorial Team";

  return (
    <article className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-12">
      {/* 1. ARTICLE MAIN CONTAINER */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors bg-card border border-border px-3.5 py-1.5 rounded-xl shadow-xs"
          >
            <HiOutlineArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Engineering Blog</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-card border border-border text-foreground hover:bg-surface transition-colors cursor-pointer shadow-xs"
          >
            <HiOutlineShare className="w-3.5 h-3.5 text-secondary" />
            <span>{copied ? "Link Copied! ✓" : "Share Article"}</span>
          </button>
        </div>

        {/* Article Header */}
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <Badge variant="highlight" size="sm" className="font-bold text-[11px]">
              {blog.category?.name || "Engineering"}
            </Badge>
            <span className="flex items-center gap-1">
              <HiOutlineCalendar className="w-3.5 h-3.5 text-secondary" />
              <span>{publishDate}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HiOutlineClock className="w-3.5 h-3.5 text-secondary" />
              <span>{readMinutes} min read</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-base sm:text-lg text-muted leading-relaxed font-normal border-l-4 border-primary pl-4 py-1 italic bg-surface/50 rounded-r-xl">
              {blog.excerpt}
            </p>
          )}

          {/* Author Card */}
          <div className="flex items-center gap-3.5 pt-4 border-t border-border">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-base shrink-0 border border-primary/20">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">
                {authorName}
              </div>
              <div className="text-xs text-muted">
                {blog.author?.email ? blog.author.email : "CPS Academy Technical Instructor & Competitive Programmer"}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Cover Image */}
        {blog.coverImageUrl && (
          <div className="w-full h-72 sm:h-96 lg:h-[420px] rounded-3xl overflow-hidden bg-surface border-2 border-border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.coverImageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <Card className="bg-card border-2 border-border overflow-hidden shadow-xs rounded-3xl">
          <CardContent className="p-6 sm:p-10 space-y-6">
            <div className="text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans space-y-4">
              {blog.content}
            </div>
          </CardContent>
        </Card>

        {/* Author Bio Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shrink-0">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground">Written by {authorName}</h3>
              <Badge variant="surface" size="sm" className="text-[10px]">CPS Faculty</Badge>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Technical educator at CPS Academy specializing in algorithmic problem solving, modern software engineering architectures, and career mentorship for tech talent.
            </p>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedBlogs.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Read Next on CPS Blog</h3>
                <p className="text-xs text-muted">More technical insights and roadmaps</p>
              </div>
              <Link href="/blog" className="text-xs font-bold text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1">
                <span>View All Articles</span>
                <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedBlogs.map((rel) => {
                const relSlug = rel.slug || String(rel.documentId || rel.id);
                return (
                  <Card key={rel.documentId || rel.id} className="p-4 border-border bg-card flex flex-col justify-between group hover:border-primary transition-all rounded-2xl shadow-xs">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {rel.category?.name || "Topic"}
                      </Badge>
                      <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        <Link href={`/blog/${relSlug}`}>{rel.title}</Link>
                      </h4>
                    </div>
                    <Link href={`/blog/${relSlug}`} className="mt-3 text-[11px] font-bold text-secondary inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Read Article</span>
                      <HiOutlineArrowRight className="w-3 h-3" />
                    </Link>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* 2. RECOMMENDED COURSES HORIZONTAL SECTION AT BOTTOM ACCORDING TO BLOG TOPIC */}
      {recommendedCourses.length > 0 && (
        <section className="pt-10 border-t border-border space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary dark:text-highlight mb-2">
                <HiOutlineSparkles className="w-3.5 h-3.5" />
                <span>Structured Learning Tracks</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Recommended Courses Related to this Topic
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Take your knowledge further with step-by-step video curriculums, code templates, and auto-graded checkpoint quizzes.
              </p>
            </div>
            <Link
              href="/courses"
              className="text-xs font-bold text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <span>Explore All Courses</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((recCourse) => (
              <CourseCard key={recCourse.documentId || recCourse.id} course={recCourse} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
