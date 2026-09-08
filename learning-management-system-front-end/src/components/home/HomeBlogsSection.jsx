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
    <section className="w-full bg-surface border-b border-border py-14 sm:py-20 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
            const authorName = blog.author?.username || "CPS Team";

            return (
              <div
                key={blog.documentId || blog.id}
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
                    <p className="line-clamp-2 text-xs text-muted leading-relaxed">
                      {blog.excerpt || "Read the full technical breakdown and implementation guide on CPS Academy."}
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
      </div>
    </section>
  );
}
