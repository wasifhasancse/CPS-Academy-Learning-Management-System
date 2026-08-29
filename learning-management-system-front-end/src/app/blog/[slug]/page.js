"use client";

import { CourseCard } from "@/components/courses/CourseCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BlogDetailsSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineBookOpen,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineShare,
  HiOutlineSparkles,
  HiOutlineUser,
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
          .get(
            `/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=author&populate=category`,
          )
          .catch(() => null);

        let foundBlog = res?.data?.[0];

        // 2. If not found by slug, try by documentId/id
        if (!foundBlog) {
          const directRes = await api
            .get(`/blog-posts/${slug}?populate=author&populate=category`)
            .catch(() => null);
          foundBlog = directRes?.data;
        }

        // Only allow published blog viewing
        if (
          foundBlog &&
          foundBlog.status !== "published" &&
          !foundBlog.publishedAt
        ) {
          foundBlog = null;
        }

        // 3. Fetch courses to match recommended courses dynamically
        const coursesRes = await api
          .get(
            "/courses?populate[modules][populate]=lessons&populate[quizzes]=*&populate[category]=*&populate[instructor]=*&populate[enrollments]=*",
          )
          .catch(() => ({ data: [] }));
        const allCourses = Array.isArray(coursesRes?.data)
          ? coursesRes.data
          : [];

        if (foundBlog) {
          setBlog(foundBlog);

          // Fetch related articles
          const allRes = await api
            .get("/blog-posts?populate=author&populate=category")
            .catch(() => ({ data: [] }));
          const allArticles = Array.isArray(allRes?.data) ? allRes.data : [];
          const related = allArticles
            .filter(
              (b) =>
                (b.documentId || b.id) !==
                (foundBlog.documentId || foundBlog.id),
            )
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
            const remaining = allCourses.filter(
              (c) => !matchingCourses.includes(c),
            );
            setRecommendedCourses(
              [...matchingCourses, ...remaining].slice(0, 3),
            );
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
    return <BlogDetailsSkeleton />;
  }

  if (!blog) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-primary">
          <HiOutlineBookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Article Not Found
        </h2>
        <p className="text-sm text-muted">
          The blog article you are trying to view does not exist or has not been
          published.
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
  const authorName =
    blog.author?.username || blog.author?.name || "CPS Editorial Team";

  return (
    <div className="w-full pb-20 space-y-12">
      {/* 1. TOP HERO HEADER BANNER */}
      <section className="bg-surface border-b border-border py-10 lg:py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top-Left Back / Browse Blog Button */}
          <div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors bg-card border border-border px-3.5 py-1.5 rounded-xl shadow-xs"
            >
              <HiOutlineArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Engineering Blog</span>
            </Link>
          </div>

          <div className="max-w-4xl space-y-4">
            {/* Category & Read Time Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge
                variant="highlight"
                size="sm"
                className="font-bold text-[11px]"
              >
                {blog.category?.name || "Engineering"}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted font-medium">
                <HiOutlineCalendar className="w-3.5 h-3.5 text-secondary" />
                <span>{publishDate}</span>
              </span>
              <span className="text-muted">•</span>
              <span className="flex items-center gap-1 text-xs text-muted font-medium">
                <HiOutlineClock className="w-3.5 h-3.5 text-secondary" />
                <span>{readMinutes} min read</span>
              </span>
            </div>

            {/* Main Blog Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              {blog.title}
            </h1>

            {/* Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs sm:text-sm text-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-xs shrink-0">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <span className="text-muted">Author:</span>
                <strong className="font-bold text-foreground">
                  {authorName}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT & STICKY SIDEBAR */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Article Body, Excerpt, Cover & Bio */}
          <div className="lg:col-span-8 space-y-8">
            {blog.excerpt && (
              <p className="text-base sm:text-lg text-muted leading-relaxed font-normal border-l-4 border-primary pl-4 py-2 italic bg-surface/50 rounded-r-2xl">
                {blog.excerpt}
              </p>
            )}

            {/* Hero Cover Image */}
            {blog.coverImageUrl && (
              <div className="w-full h-72 sm:h-96 lg:h-[460px] rounded-3xl overflow-hidden bg-surface border-2 border-border shadow-sm">
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
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Written by {authorName}
                  </h3>
                  <Badge variant="surface" size="sm" className="text-[10px]">
                    CPS Faculty
                  </Badge>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Technical educator at CPS Academy specializing in algorithmic
                  problem solving, modern software engineering architectures,
                  and career mentorship for tech talent.
                </p>
              </div>
            </div>

            {/* Related Articles Section */}
            {relatedBlogs.length > 0 && (
              <section className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Read Next on CPS Blog
                    </h3>
                    <p className="text-xs text-muted">
                      More technical insights and roadmaps
                    </p>
                  </div>
                  <Link
                    href="/blog"
                    className="text-xs font-bold text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <span>View All Articles</span>
                    <HiOutlineArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedBlogs.map((rel) => {
                    const relSlug =
                      rel.slug || String(rel.documentId || rel.id);
                    return (
                      <Card
                        key={rel.documentId || rel.id}
                        className="p-4 border-border bg-card flex flex-col justify-between group hover:border-primary transition-all rounded-2xl shadow-xs"
                      >
                        <div className="space-y-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold"
                          >
                            {rel.category?.name || "Topic"}
                          </Badge>
                          <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                            <Link href={`/blog/${relSlug}`}>{rel.title}</Link>
                          </h4>
                        </div>
                        <Link
                          href={`/blog/${relSlug}`}
                          className="mt-3 text-[11px] font-bold text-secondary inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
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

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            {/* Share & Article Info Card */}
            <Card className="bg-card border-2 border-border rounded-3xl p-6 shadow-xs space-y-5">
              <CardHeader className="p-0 space-y-1">
                <CardTitle className="text-base font-bold text-foreground">
                  Article Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted flex items-center gap-1.5">
                    <HiOutlineClock className="w-4 h-4 text-secondary" />
                    <span>Read Time</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {readMinutes} mins
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted flex items-center gap-1.5">
                    <HiOutlineCalendar className="w-4 h-4 text-secondary" />
                    <span>Published</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {publishDate}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted flex items-center gap-1.5">
                    <HiOutlineUser className="w-4 h-4 text-secondary" />
                    <span>Author</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {authorName}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-surface hover:bg-card border border-border text-foreground transition-colors cursor-pointer shadow-xs"
                  >
                    <HiOutlineShare className="w-4 h-4 text-secondary" />
                    <span>
                      {copied
                        ? "Link Copied to Clipboard! ✓"
                        : "Share This Article"}
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* CPS Courses Callout CTA */}
            <div className="p-6 rounded-3xl bg-surface border-2 border-primary/20 space-y-4">
              <div className="flex items-center gap-2 text-primary dark:text-highlight font-bold text-xs">
                <HiOutlineSparkles className="w-4 h-4" />
                <span>Master This Field</span>
              </div>
              <h4 className="text-base font-extrabold text-foreground leading-snug">
                Accelerate Your Career with CPS Academy
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Learn structured competitive programming, backend systems, and
                system design from senior engineers with lifetime course access.
              </p>
              <Button
                href="/courses"
                variant="primary"
                size="sm"
                className="w-full font-bold"
              >
                Browse Course Catalog →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RECOMMENDED COURSES HORIZONTAL SECTION AT BOTTOM */}
      {recommendedCourses.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6 border-t border-border">
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
                Take your knowledge further with step-by-step video curriculums,
                code templates, and auto-graded checkpoint quizzes.
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
              <CourseCard
                key={recCourse.documentId || recCourse.id}
                course={recCourse}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
