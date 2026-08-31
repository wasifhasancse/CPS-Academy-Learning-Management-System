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
    <div className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between hover:border-[#309255] transition-all duration-300 transform hover:-translate-y-0.5 shadow-1 hover:shadow-1">
      {/* 1. Top Image & Badges Section */}
      <div className="relative w-full h-44 sm:h-48 bg-surface border-b border-border overflow-hidden flex items-center justify-center">
        {thumbnailUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-[#E7F8EE] dark:bg-[#181E27] flex flex-col items-center justify-center p-5 text-center space-y-1.5">
            <HiOutlineBookOpen className="w-9 h-9 text-[#309255] opacity-80" />
            <span className="text-[11px] font-bold text-[#309255] uppercase tracking-wider block">
              {categoryName}
            </span>
          </div>
        )}

        {/* Top Left Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 rounded-full bg-[#309255] text-white font-bold text-[11px] tracking-wide shadow-1 border border-white/20">
            {categoryName}
          </span>
        </div>

        {/* Top Right Difficulty Tag */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-[#212832]/85 backdrop-blur-md text-white font-medium text-[11px] border border-white/20 shadow-1">
            {difficulty}
          </span>
        </div>
      </div>

      {/* 2. Middle Content Section */}
      <div className="p-4.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2.5">
          {/* Lessons Count & Quizzes Metadata Chips */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E7F8EE] dark:bg-[#E7F8EE]/10 text-[#309255] dark:text-[#E7F8EE] border border-[#309255]/20 text-[11px] font-semibold">
              <HiOutlineBookOpen className="w-3.5 h-3.5" />
              <span>{lessonsCount} Lessons</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border text-muted text-[11px] font-semibold">
              <HiOutlineAcademicCap className="w-3.5 h-3.5 text-[#309255]" />
              <span>{quizzesCount} {quizzesCount === 1 ? "Quiz" : "Quizzes"}</span>
            </span>
          </div>

          {/* Course Title */}
          <Link href={`/courses/${slug}`} className="block">
            <h3 className="text-[15px] sm:text-base font-bold text-foreground leading-snug group-hover:text-[#309255] transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Instructor Attribution */}
          <div className="flex items-center gap-2 text-xs text-muted pt-0.5">
            <div className="w-6 h-6 rounded-full bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#309255]/25">
              {instructorName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">
              By <strong className="font-semibold text-foreground">{instructorName}</strong>
            </span>
          </div>
        </div>

        {/* 3. Bottom Row: Price & Action CTA */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[9.5px] text-muted font-bold uppercase tracking-wider">Tuition</span>
            <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {price === 0 ? (
                <span className="text-[#309255] dark:text-[#E7F8EE]">Free Track</span>
              ) : (
                `৳${price.toLocaleString()}`
              )}
            </span>
          </div>

          <Button
            href={`/courses/${slug}`}
            variant="primary"
            size="sm"
            className="text-xs font-bold px-3.5 py-1.5 rounded-lg gap-1 shadow-1"
          >
            <span>View Details</span>
            <HiOutlineArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
