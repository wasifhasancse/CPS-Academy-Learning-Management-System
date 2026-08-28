"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CourseCard({ course }) {
  if (!course) return null;

  const title = course.title || "Untitled Course";
  const slug = course.slug || "course";
  const categoryName =
    course.category?.name ||
    (typeof course.category === "string" ? course.category : "DATA STRUCTURES");
  const instructorName =
    course.instructor?.username ||
    (typeof course.instructor === "string" ? course.instructor : "CPS Faculty");
  const difficulty = course.difficulty || "All Levels";
  const price = course.price !== undefined ? course.price : 0;
  const thumbnailUrl = course.thumbnailUrl || course.thumbnail || "";

  // Compute lesson count
  const lessonsCount =
    course.lessonsCount !== undefined
      ? course.lessonsCount
      : course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) ||
        (Array.isArray(course.lessons) ? course.lessons.length : 0);

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between hover:border-secondary transition-colors duration-200">
      {/* 1. Top Image / Category Banner Section */}
      <div className="relative w-full h-48 bg-surface dark:bg-[#091513] border-b border-border overflow-hidden flex items-center justify-center">
        {thumbnailUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // If broken image URL, fallback to clean category banner
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Category Overlay Tag */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border text-[11px] font-bold text-primary dark:text-highlight tracking-wider uppercase">
              {categoryName}
            </div>
          </>
        ) : (
          <div className="text-center p-6 space-y-2">
            <span className="text-xs font-black text-secondary dark:text-highlight uppercase tracking-widest block">
              {categoryName}
            </span>
          </div>
        )}
      </div>

      {/* 2. Middle Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Level & Lessons Count Header */}
          <div className="flex items-center justify-between text-xs text-muted font-medium">
            <span>{difficulty}</span>
            <span>{lessonsCount} Lessons</span>
          </div>

          {/* Course Title */}
          <Link href={`/courses/${slug}`}>
            <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-secondary transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Instructor Attribution */}
          <p className="text-xs text-muted">
            Instructor: <span className="font-semibold text-foreground">{instructorName}</span>
          </p>
        </div>

        {/* 3. Bottom Row: Price & Action CTA */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted font-medium uppercase tracking-wider">Price</span>
            <span className="text-base font-black text-foreground">
              ৳{Number(price).toLocaleString()}
            </span>
          </div>

          <Button
            href={`/courses/${slug}`}
            variant="secondary"
            size="sm"
            className="text-xs font-semibold px-4 py-2"
          >
            View Course
          </Button>
        </div>
      </div>
    </div>
  );
}
