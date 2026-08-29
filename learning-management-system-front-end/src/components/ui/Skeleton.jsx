"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

/**
 * Base atomic Skeleton box with smooth pulsing animation
 */
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-surface/90 dark:bg-[#393E46]/80 border border-border/30 ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton matching the exact layout and dimensions of CourseCard.jsx
 */
export function CourseCardSkeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-3xl border border-border bg-card overflow-hidden flex flex-col justify-between shadow-xs animate-pulse ${className}`}
    >
      {/* 1. Thumbnail Header */}
      <div className="relative w-full h-48 bg-surface border-b border-border p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <Skeleton className="w-20 h-5 rounded-full" />
          <Skeleton className="w-24 h-5 rounded-full" />
        </div>
        <div className="flex justify-center items-center">
          <Skeleton className="w-12 h-12 rounded-2xl opacity-60" />
        </div>
      </div>

      {/* 2. Middle Content Section */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Lessons & Quizzes Meta */}
          <div className="flex items-center justify-between">
            <Skeleton className="w-20 h-4 rounded-md" />
            <Skeleton className="w-16 h-4 rounded-md" />
          </div>

          {/* Title Lines */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="w-full h-5 rounded-md" />
            <Skeleton className="w-3/4 h-5 rounded-md" />
          </div>

          {/* Instructor Attribution */}
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="w-6 h-6 rounded-full shrink-0" />
            <Skeleton className="w-28 h-3.5 rounded-md" />
          </div>
        </div>

        {/* 3. Bottom Pricing & CTA */}
        <div className="pt-3.5 border-t border-border flex items-center justify-between gap-3">
          <div className="space-y-1">
            <Skeleton className="w-10 h-2.5 rounded" />
            <Skeleton className="w-16 h-6 rounded-md" />
          </div>
          <Skeleton className="w-28 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid wrapper for multiple CourseCardSkeletons
 */
export function CourseGridSkeleton({ count = 6, columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid ${columns} gap-6`}>
      {Array.from({ length: count }).map((_, idx) => (
        <CourseCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Skeleton matching Blog Cards in /blog
 */
export function BlogCardSkeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-3xl border border-border bg-card overflow-hidden flex flex-col justify-between shadow-xs animate-pulse ${className}`}
    >
      {/* Cover Image */}
      <div className="w-full h-48 bg-surface border-b border-border p-4 flex items-start">
        <Skeleton className="w-24 h-5 rounded-full" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <Skeleton className="w-20 h-3.5 rounded" />
            <Skeleton className="w-16 h-3.5 rounded" />
          </div>
          <Skeleton className="w-full h-5 rounded-md" />
          <Skeleton className="w-4/5 h-5 rounded-md" />
          <Skeleton className="w-full h-3.5 rounded mt-2" />
          <Skeleton className="w-2/3 h-3.5 rounded" />
        </div>

        {/* Footer Author & Link */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="w-20 h-3.5 rounded" />
          </div>
          <Skeleton className="w-20 h-4 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid wrapper for BlogCardSkeletons
 */
export function BlogGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <BlogCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Skeleton for Dashboard KPI Stats Cards
 */
export function DashboardStatsSkeleton({ count = 4, columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" }) {
  return (
    <div className={`grid ${columns} gap-4 animate-pulse`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl border border-border bg-card flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="w-24 h-3 rounded" />
              <Skeleton className="w-14 h-4 rounded" />
            </div>
            <Skeleton className="w-9 h-9 rounded-xl" />
          </div>
          <div className="space-y-1">
            <Skeleton className="w-20 h-7 rounded-md" />
            <Skeleton className="w-28 h-3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Data Tables (Orders, Users, Progress, Quizzes)
 */
export function TableSkeleton({ rows = 5, columns = 5, className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full rounded-2xl border border-border bg-card overflow-hidden animate-pulse ${className}`}
    >
      {/* Table Header */}
      <div className="bg-surface/70 border-b border-border px-6 py-4 grid gap-4 items-center" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-3/4 rounded" />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="px-6 py-4 grid gap-4 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div key={cIdx} className="flex items-center gap-2">
                {cIdx === 0 && <Skeleton className="w-6 h-6 rounded-full shrink-0" />}
                <Skeleton className={`h-4 rounded ${cIdx === columns - 1 ? "w-16 ml-auto" : "w-4/5"}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Course Detail Page (/courses/[slug])
 */
export function CourseDetailsSkeleton() {
  return (
    <div className="w-full pb-20 space-y-12 animate-pulse">
      {/* Top Hero Banner */}
      <section className="bg-surface border-b border-border py-10 lg:py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="w-36 h-8 rounded-xl" />
          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-28 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
            <Skeleton className="w-full sm:w-4/5 h-12 rounded-2xl" />
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-32 h-4 rounded" />
              </div>
              <Skeleton className="w-28 h-4 rounded" />
              <Skeleton className="w-36 h-4 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="w-full h-80 sm:h-96 rounded-3xl bg-surface border border-border" />
            <div className="p-8 rounded-3xl bg-card border border-border space-y-4">
              <Skeleton className="w-48 h-6 rounded-md" />
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-3/4 h-4 rounded" />
            </div>
            {/* Curriculum Accordion Skeletons */}
            <div className="space-y-4">
              <Skeleton className="w-56 h-6 rounded-md" />
              {[1, 2, 3].map((m) => (
                <div key={m} className="p-5 rounded-2xl border border-border bg-card space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-64 h-5 rounded" />
                    <Skeleton className="w-16 h-4 rounded" />
                  </div>
                  <div className="pl-4 space-y-2 pt-2 border-t border-border">
                    <Skeleton className="w-48 h-3.5 rounded" />
                    <Skeleton className="w-56 h-3.5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sticky Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-3xl bg-card border-2 border-border space-y-6 shadow-xs">
              <div className="space-y-2">
                <Skeleton className="w-20 h-3 rounded" />
                <Skeleton className="w-32 h-9 rounded-lg" />
              </div>
              <Skeleton className="w-full h-12 rounded-xl" />
              <div className="space-y-3 pt-4 border-t border-border">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-md shrink-0" />
                    <Skeleton className="w-4/5 h-4 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Skeleton for Blog Detail Page (/blog/[slug])
 */
export function BlogDetailsSkeleton() {
  return (
    <div className="w-full pb-20 space-y-12 animate-pulse">
      {/* Top Hero Banner */}
      <section className="bg-surface border-b border-border py-10 lg:py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="w-40 h-8 rounded-xl" />
          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-28 h-4 rounded" />
              <Skeleton className="w-20 h-4 rounded" />
            </div>
            <Skeleton className="w-full sm:w-4/5 h-12 rounded-2xl" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-32 h-4 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            <Skeleton className="w-full h-16 rounded-2xl" />
            <div className="w-full h-72 sm:h-96 lg:h-[420px] rounded-3xl bg-surface border border-border" />
            <div className="p-8 sm:p-10 rounded-3xl bg-card border border-border space-y-4">
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-5/6 h-4 rounded" />
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-2/3 h-4 rounded" />
            </div>
            <div className="p-6 rounded-3xl bg-surface border border-border flex items-center gap-5">
              <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="w-36 h-4 rounded" />
                <Skeleton className="w-full h-3 rounded" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
              <Skeleton className="w-32 h-5 rounded" />
              <div className="space-y-3 pt-2">
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-full h-4 rounded" />
              </div>
              <Skeleton className="w-full h-10 rounded-xl" />
            </div>
            <div className="p-6 rounded-3xl bg-surface border border-border space-y-3">
              <Skeleton className="w-28 h-4 rounded" />
              <Skeleton className="w-full h-5 rounded" />
              <Skeleton className="w-full h-3.5 rounded" />
              <Skeleton className="w-full h-9 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Skeleton for Interactive Course Player (/learn/[slug])
 */
export function CoursePlayerSkeleton() {
  return (
    <div className="w-full min-h-screen bg-background pb-16 space-y-6 animate-pulse">
      {/* Top Header Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-28 h-8 rounded-xl" />
            <Skeleton className="w-48 h-5 rounded-md hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-24 h-4 rounded" />
            <Skeleton className="w-32 h-3 rounded-full hidden md:block" />
          </div>
        </div>
      </div>

      {/* Main Player Canvas & Sidebar */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Video Theater & Lesson Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 16:9 Video Canvas */}
            <div className="w-full aspect-video rounded-3xl bg-black/80 border border-border/40 flex flex-col justify-between p-6 overflow-hidden">
              <div className="flex justify-between">
                <Skeleton className="w-32 h-6 rounded-lg bg-white/10" />
                <Skeleton className="w-12 h-6 rounded-lg bg-white/10" />
              </div>
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/25" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="w-full h-2 rounded bg-white/15" />
                <div className="flex justify-between">
                  <Skeleton className="w-16 h-4 rounded bg-white/10" />
                  <Skeleton className="w-20 h-4 rounded bg-white/10" />
                </div>
              </div>
            </div>

            {/* Lesson Title & Action Header */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="w-24 h-5 rounded-full" />
                  <Skeleton className="w-3/4 h-7 rounded-lg" />
                </div>
                <Skeleton className="w-36 h-10 rounded-xl" />
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-20 h-4 rounded" />
              </div>
            </div>

            {/* Content Tabs & Description Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Skeleton className="w-24 h-8 rounded-lg" />
                <Skeleton className="w-24 h-8 rounded-lg" />
                <Skeleton className="w-24 h-8 rounded-lg" />
              </div>
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-2/3 h-4 rounded" />
            </div>
          </div>

          {/* Right Curriculum Syllabus Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-3xl bg-card border border-border space-y-4 sticky top-20">
              <div className="flex items-center justify-between">
                <Skeleton className="w-32 h-5 rounded" />
                <Skeleton className="w-14 h-4 rounded-full" />
              </div>
              <Skeleton className="w-full h-9 rounded-xl" />

              {/* Module Accordions */}
              <div className="space-y-2.5 pt-2">
                {[1, 2, 3, 4, 5].map((m) => (
                  <div key={m} className="p-3.5 rounded-2xl bg-surface/60 border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="w-40 h-4 rounded" />
                      <Skeleton className="w-10 h-3 rounded" />
                    </div>
                    {m <= 2 && (
                      <div className="pl-3 space-y-1.5 pt-1">
                        <Skeleton className="w-36 h-3 rounded" />
                        <Skeleton className="w-44 h-3 rounded" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
