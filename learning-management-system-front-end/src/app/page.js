"use client";

import { CourseCard } from "@/components/courses/CourseCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CourseGridSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlineAcademicCap, HiOutlineArrowRight } from "react-icons/hi2";

import { ComparisonSection } from "@/components/home/ComparisonSection";
import { FaqSection } from "@/components/home/FaqSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeBlogsSection } from "@/components/home/HomeBlogsSection";
import { ImpactMetricsSection } from "@/components/home/ImpactMetricsSection";
import { LearningWorkflowSection } from "@/components/home/LearningWorkflowSection";
import { QuizPreviewSection } from "@/components/home/QuizPreviewSection";
import { RoadmapsSection } from "@/components/home/RoadmapsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedCourseCat, setSelectedCourseCat] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true);
      try {
        const [courseRes, catRes, blogRes] = await Promise.all([
          api
            .get(
              "/courses?populate[modules][populate]=lessons&populate[quizzes]=*&populate[category]=*&populate[instructor]=*&populate[enrollments]=*",
            )
            .catch(() => null),
          api.get("/categories").catch(() => null),
          api
            .get("/blog-posts?populate=author&populate=category")
            .catch(() => null),
        ]);

        if (Array.isArray(courseRes?.data)) {
          setFeaturedCourses(courseRes.data);
        } else if (courseRes?.data) {
          setFeaturedCourses([courseRes.data]);
        } else {
          setFeaturedCourses([]);
        }

        if (Array.isArray(catRes?.data)) {
          setCategories(catRes.data);
        } else {
          setCategories([]);
        }

        if (Array.isArray(blogRes?.data)) {
          setBlogs(blogRes.data);
        } else if (blogRes?.data) {
          setBlogs([blogRes.data]);
        } else {
          setBlogs([]);
        }
      } catch (err) {
        console.warn("Could not fetch home data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const filteredCourses = featuredCourses.filter((c) => {
    if (selectedCourseCat === "all") return true;
    return (
      c.category?.slug === selectedCourseCat ||
      c.category?.name === selectedCourseCat ||
      c.category?.documentId === selectedCourseCat ||
      String(c.category?.id) === selectedCourseCat
    );
  });

  return (
    <div className="w-full flex flex-col transition-colors duration-200">
      {/* 1. HERO SECTION WITH IMAGE SLIDER */}
      <HeroSection />

      {/* 2. FEATURED CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-16 md:py-20 bg-background border-b border-border">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <Badge variant="highlight" size="sm" className="mb-2">
                  Curated Taxonomies
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Browse by Academic Track
                </h2>
              </div>
              <Link
                href="/courses"
                className="text-xs font-bold text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <span>View all tracks</span>
                <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div
                  key={category.documentId || category.id}
                  className="rounded-2xl border border-border bg-surface hover:bg-surface-hover p-6 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-0.5 shadow-1 hover:shadow-1 hover:border-[#309255] group cursor-pointer"
                >
                  <div className="space-y-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#E7F8EE] dark:bg-[#E7F8EE]/15 text-[#309255] dark:text-[#E7F8EE] font-black flex items-center justify-center text-lg border border-[#309255]/20 shadow-xs group-hover:scale-[1.02] group-hover:bg-[#309255] group-hover:text-white transition-all duration-300">
                      {category.name?.charAt(0) || "C"}
                    </div>
                    <h3 className="text-base font-extrabold text-foreground group-hover:text-[#309255] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">
                      {category.description ||
                        "Structured learning paths, live problem sets, and checkpoints."}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#309255] dark:text-[#E7F8EE] px-2 py-0.5 rounded-md bg-[#E7F8EE] dark:bg-[#E7F8EE]/15">
                      Curriculum Track
                    </span>
                    <Link
                      href={`/courses?category=${category.slug || category.documentId || category.id}`}
                      className="text-xs font-bold text-[#309255] hover:text-[#267544] dark:hover:text-[#E7F8EE] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Explore</span>
                      <HiOutlineArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED & TRENDING COURSES */}
      <section className="py-16 md:py-24 bg-surface border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="highlight" size="sm">
                Popular Classes
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                Featured & Trending Courses
              </h2>
              <p className="text-sm text-muted">
                Hand-crafted computer science courses with video lectures,
                reading notes, and diagnostic quizzes.
              </p>
            </div>

            <Button
              href="/courses"
              variant="outline"
              size="sm"
              className="shrink-0 text-xs font-bold gap-1.5 hover:border-[#309255]"
            >
              <span>View All Courses</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCourseCat("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedCourseCat === "all"
                    ? "bg-[#309255] text-white shadow-sm"
                    : "bg-card border border-border text-muted hover:text-[#309255] hover:bg-surface-hover dark:hover:text-[#E7F8EE]"
                }`}
              >
                All Courses ({featuredCourses.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.documentId || cat.id}
                  type="button"
                  onClick={() => setSelectedCourseCat(cat.slug || cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    selectedCourseCat === (cat.slug || cat.name)
                      ? "bg-[#309255] text-white shadow-sm"
                      : "bg-card border border-border text-muted hover:text-[#309255] hover:bg-surface-hover dark:hover:text-[#E7F8EE]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <CourseGridSkeleton
              count={3}
              columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            />
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm border border-dashed border-border rounded-2xl bg-card">
              No courses matching the selected category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.documentId || course.id}
                  course={course}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. NEW SECTION 1: INTERACTIVE LEARNING PATHS / ROADMAPS */}
      <RoadmapsSection />

      {/* 5. LEARNING WORKFLOW */}
      <LearningWorkflowSection />

      {/* 6. NEW SECTION 2: INTERACTIVE QUIZ ASSESSMENT PREVIEW WIDGET */}
      <QuizPreviewSection />

      {/* 7. NEW SECTION 3: WHY CPS ACADEMY COMPARISON MATRIX */}
      <ComparisonSection />

      {/* 8. NEW SECTION 4: PLATFORM IMPACT & COMMUNITY METRICS */}
      <ImpactMetricsSection />

      {/* 9. NEW SECTION 5: STUDENT SUCCESS STORIES & TESTIMONIALS */}
      <TestimonialsSection />

      {/* 10. NEW SECTION 6: LATEST ENGINEERING BLOG ARTICLES */}
      <HomeBlogsSection blogs={blogs} />

      {/* 11. NEW SECTION 7: INTERACTIVE FAQ ACCORDION */}
      <FaqSection />

      {/* 12. INSTRUCTOR INVITATION CTA */}
      <section className="py-16 md:py-24 bg-surface border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#212832] text-white border border-[#2E3846] rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-1 relative overflow-hidden">
            {/* Background Decorative Pill */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#309255]/15 pointer-events-none" />

            <div className="max-w-xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#309255]/20 border border-[#309255]/40 text-xs font-bold text-[#E7F8EE] shadow-2xs">
                <HiOutlineAcademicCap className="w-4 h-4" />
                <span>Educators & Competitive Programmers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                Share Your Knowledge with Thousands of Learners
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Upload courses, organize video & text lessons, author diagnostic
                quiz question banks, and track enrolled students with universal
                live progress synchronization.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto shrink-0 relative z-10">
              <Button
                href="/auth/register"
                variant="primary"
                size="lg"
                className="font-bold text-xs sm:text-sm px-6 py-3.5 shadow-1"
              >
                Join as Instructor
              </Button>
              <Button
                href="/about"
                variant="outline"
                size="lg"
                className="text-white border-white/30 hover:bg-white/10 dark:text-white dark:border-white/30 dark:hover:bg-white/10 font-bold text-xs sm:text-sm px-6 py-3.5"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
