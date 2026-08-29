"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineUser,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from "react-icons/hi2";

export function CourseCard({ course }) {
  if (!course) return null;

  const title = course.title || "Untitled Course";
  const slug = course.slug || String(course.documentId || course.id || "course");
  const categoryName =
    course.category?.name ||
    (typeof course.category === "string" ? course.category : "Computer Science");

  // Real instructor attribution from database relation or creator
  const instructorName =
    course.instructor?.username ||
    course.instructor?.name ||
    course.instructor?.email?.split("@")[0] ||
    (typeof course.instructor === "string" ? course.instructor : "") ||
    "CPS Instructor";

  const difficulty = course.difficulty || "All Levels";
  const price = course.price !== undefined ? Number(course.price) : 0;
  const thumbnailUrl = course.thumbnailUrl || course.thumbnail?.url || course.thumbnail || "";

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
    <div className="group rounded-3xl border border-border bg-card overflow-hidden flex flex-col justify-between hover:border-primary transition-all duration-200 shadow-xs">
      {/* 1. Top Image & Badge Section */}
      <div className="relative w-full h-48 bg-surface border-b border-border overflow-hidden flex items-center justify-center">
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
          <div className="w-full h-full bg-primary/10 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <HiOutlineBookOpen className="w-10 h-10 text-primary dark:text-highlight opacity-60" />
            <span className="text-[11px] font-black text-secondary dark:text-highlight uppercase tracking-widest block">
              {categoryName}
            </span>
          </div>
        )}

        {/* Top Right Corner Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="highlight" size="sm" className="shadow-xs font-bold text-[10px] tracking-wide">
            {categoryName}
          </Badge>
        </div>

        {/* Top Left Difficulty Tag */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[10px] border border-white/20">
            {difficulty}
          </span>
        </div>
      </div>

      {/* 2. Middle Content Section */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Level, Lessons Count & Quizzes Header */}
          <div className="flex items-center justify-between text-xs text-muted font-medium">
            <span className="flex items-center gap-1">
              <HiOutlineBookOpen className="w-3.5 h-3.5 text-secondary" />
              <span>{lessonsCount} Lessons</span>
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineAcademicCap className="w-3.5 h-3.5 text-secondary" />
              <span>{quizzesCount} {quizzesCount === 1 ? "Quiz" : "Quizzes"}</span>
            </span>
          </div>

          {/* Course Title */}
          <Link href={`/courses/${slug}`}>
            <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Instructor Attribution */}
          <div className="pt-1">
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="w-5 h-5 rounded-full bg-primary/15 text-primary dark:text-highlight flex items-center justify-center font-bold text-[10px] shrink-0">
                {instructorName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">
                By <strong className="font-semibold text-foreground">{instructorName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row: Price & Action CTA */}
        <div className="pt-3.5 border-t border-border flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Tuition</span>
            <span className="text-base sm:text-lg font-black text-foreground">
              {price === 0 ? "Free Track" : `৳${price.toLocaleString()}`}
            </span>
          </div>

          <Button
            href={`/courses/${slug}`}
            variant="primary"
            size="sm"
            className="text-xs font-bold px-4 py-2 gap-1"
          >
            <span>View Details</span>
            <HiOutlineArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
