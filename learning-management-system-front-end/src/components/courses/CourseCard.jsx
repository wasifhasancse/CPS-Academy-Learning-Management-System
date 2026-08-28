"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function CourseCard({ course }) {
  if (!course) return null;

  const title = course.title || "Untitled Course";
  const slug = course.slug || "course";
  const categoryName =
    course.category?.name ||
    (typeof course.category === "string" ? course.category : "Programming");

  // Real instructor attribution from database relation or creator
  const instructorName =
    course.instructor?.username ||
    course.instructor?.name ||
    course.instructor?.email?.split("@")[0] ||
    (typeof course.instructor === "string" ? course.instructor : "") ||
    "CPS Instructor";

  const difficulty = course.difficulty || "All Levels";
  const price = course.price !== undefined ? course.price : 0;
  const thumbnailUrl = course.thumbnailUrl || course.thumbnail || "";

  // Compute lesson & quiz count
  const lessonsCount =
    course.lessonsCount !== undefined
      ? course.lessonsCount
      : course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) ||
      (Array.isArray(course.lessons) ? course.lessons.length : 0);

  const quizzesCount =
    course.quizzesCount !== undefined
      ? course.quizzesCount
      : Array.isArray(course.quizzes)
        ? course.quizzes.length
        : 0;

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between hover:border-secondary transition-colors duration-200 shadow-sm">
      {/* 1. Top Image & Badge Section */}
      <div className="relative w-full h-48 bg-surface dark:bg-[#091513] border-b border-border overflow-hidden flex items-center justify-center">
        {thumbnailUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </>
        ) : (
          <div className="text-center p-6 space-y-2">
            <span className="text-xs font-black text-secondary dark:text-highlight uppercase tracking-widest block">
              {categoryName}
            </span>
          </div>
        )}

        {/* Top Right Corner Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="highlight" size="sm" className="shadow-sm uppercase font-bold tracking-wide">
            {categoryName}
          </Badge>
        </div>
      </div>

      {/* 2. Middle Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Level, Lessons Count & Quizzes Header */}
          <div className="flex items-center justify-between text-xs text-muted font-medium">
            <span>{difficulty}</span>
            <span>
              {lessonsCount} Lessons • {quizzesCount} {quizzesCount === 1 ? "Quiz" : "Quizzes"}
            </span>
          </div>

          {/* Course Title */}
          <Link href={`/courses/${slug}`}>
            <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-secondary transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Instructor Attribution with clean spacing (no borders) */}
          <div className="pt-1.5 pb-0.5">
            <p className="text-xs text-muted flex items-center gap-1.5">
              <span>Instructor:</span>
              <strong className="font-semibold text-foreground">{instructorName}</strong>
            </p>
          </div>
        </div>

        {/* 3. Bottom Row: Price & Action CTA */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">PRICE</span>
            <span className="text-lg font-black text-foreground">
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
