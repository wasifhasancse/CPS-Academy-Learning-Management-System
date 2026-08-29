"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  HiOutlineClock,
  HiOutlineBookOpen,
  HiOutlineArrowRight,
} from "react-icons/hi2";

export function HomeBlogsSection({ blogs = [] }) {
  const displayBlogs = blogs.slice(0, 3);

  if (displayBlogs.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-surface border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="highlight" size="sm">
              Engineering Insights
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Latest from the CPS Tech Blog
            </h2>
            <p className="text-sm text-muted">
              Deep dives, contest analysis, and software design tutorials written by instructors.
            </p>
          </div>

          <Button href="/blog" variant="outline" size="sm" className="shrink-0 text-xs font-bold gap-1.5">
            <span>Read All Articles</span>
            <HiOutlineArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayBlogs.map((blog) => {
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
                key={blog.documentId || blog.id}
                className="flex flex-col justify-between overflow-hidden hover:border-primary transition-all duration-200 group border-border bg-card shadow-xs"
              >
                {blog.coverImageUrl ? (
                  <div className="h-44 w-full overflow-hidden bg-surface relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.coverImageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-primary/10 flex items-center justify-center p-6 text-center border-b border-border">
                    <HiOutlineBookOpen className="w-8 h-8 text-primary dark:text-highlight opacity-60" />
                  </div>
                )}

                <CardHeader className="pb-3 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted mb-2">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {blog.category?.name || "Engineering"}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px]">
                      <HiOutlineClock className="w-3 h-3" />
                      <span>{readMinutes} min read</span>
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    <Link href={`/blog/${slug}`}>{blog.title}</Link>
                  </CardTitle>

                  <CardDescription className="line-clamp-2 text-xs mt-1.5 text-muted leading-relaxed">
                    {blog.excerpt || "Read the full technical breakdown on CPS Academy."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 flex items-center justify-between border-t border-border mt-auto pt-3 text-xs">
                  <span className="text-[11px] text-muted">
                    By {blog.author?.username || "CPS Team"} • {publishDate}
                  </span>

                  <Link href={`/blog/${slug}`} className="text-xs font-bold text-primary dark:text-highlight hover:underline inline-flex items-center gap-1">
                    <span>Read</span>
                    <HiOutlineArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
