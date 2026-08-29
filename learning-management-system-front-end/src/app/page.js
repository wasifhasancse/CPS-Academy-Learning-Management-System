"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { CourseCard } from "@/components/courses/CourseCard";
import { api } from "@/lib/api";
import {
  HiOutlineSparkles,
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
} from "react-icons/hi2";

import { HeroSection } from "@/components/home/HeroSection";
import { RoadmapsSection } from "@/components/home/RoadmapsSection";
import { QuizPreviewSection } from "@/components/home/QuizPreviewSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { ImpactMetricsSection } from "@/components/home/ImpactMetricsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { HomeBlogsSection } from "@/components/home/HomeBlogsSection";
import { FaqSection } from "@/components/home/FaqSection";

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
              "/courses?populate[modules][populate]=lessons&populate[quizzes]=*&populate[category]=*&populate[instructor]=*&populate[enrollments]=*"
            )
            .catch(() => null),
          api.get("/categories").catch(() => null),
          api.get("/blog-posts?populate=author&populate=category").catch(() => null),
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
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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
                <Card key={category.documentId || category.id} hoverable className="flex flex-col justify-between p-6 bg-surface border-border">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary dark:bg-highlight/20 dark:text-highlight font-black flex items-center justify-center text-sm">
                      {category.name?.charAt(0) || "C"}
                    </div>
                    <CardTitle as="h3" className="text-base font-bold text-foreground">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted leading-relaxed">
                      {category.description || "Structured learning paths, live problem sets, and checkpoints."}
                    </CardDescription>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] font-bold text-secondary">
                      Active Curriculum
                    </span>
                    <Link
                      href={`/courses?category=${category.slug || category.documentId || category.id}`}
                      className="text-xs font-bold text-primary dark:text-highlight hover:underline inline-flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <HiOutlineArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED & TRENDING COURSES */}
      <section className="py-16 md:py-24 bg-surface border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="highlight" size="sm">
                Popular Classes
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                Featured & Trending Courses
              </h2>
              <p className="text-sm text-muted">
                Hand-crafted computer science courses with video lectures, reading notes, and diagnostic quizzes.
              </p>
            </div>

            <Button href="/courses" variant="outline" size="sm" className="shrink-0 text-xs font-bold gap-1.5">
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCourseCat === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-card border border-border text-muted hover:text-foreground"
                }`}
              >
                All Courses ({featuredCourses.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.documentId || cat.id}
                  type="button"
                  onClick={() => setSelectedCourseCat(cat.slug || cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCourseCat === (cat.slug || cat.name)
                      ? "bg-primary text-white shadow-sm"
                      : "bg-card border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse flex flex-col justify-between"
                >
                  <div className="w-full h-48 bg-surface border-b border-border" />
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between">
                      <div className="w-20 h-4 bg-surface rounded" />
                      <div className="w-16 h-4 bg-surface rounded" />
                    </div>
                    <div className="w-full h-6 bg-surface rounded" />
                    <div className="w-32 h-4 bg-surface rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm border border-dashed border-border rounded-2xl bg-card">
              No courses matching the selected category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.documentId || course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. NEW SECTION 1: INTERACTIVE LEARNING PATHS / ROADMAPS */}
      <RoadmapsSection />

      {/* 5. NEW SECTION 2: INTERACTIVE QUIZ ASSESSMENT PREVIEW WIDGET */}
      <QuizPreviewSection />

      {/* 6. NEW SECTION 3: WHY CPS ACADEMY COMPARISON MATRIX */}
      <ComparisonSection />

      {/* 7. NEW SECTION 4: PLATFORM IMPACT & COMMUNITY METRICS */}
      <ImpactMetricsSection />

      {/* 8. NEW SECTION 5: STUDENT SUCCESS STORIES & TESTIMONIALS */}
      <TestimonialsSection />

      {/* 9. NEW SECTION 6: LATEST ENGINEERING BLOG ARTICLES */}
      <HomeBlogsSection blogs={blogs} />

      {/* 10. NEW SECTION 7: INTERACTIVE FAQ ACCORDION */}
      <FaqSection />

      {/* 11. INSTRUCTOR INVITATION CTA */}
      <section className="py-16 md:py-24 bg-surface border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary text-white border border-secondary/30 rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-white">
                <HiOutlineAcademicCap className="w-4 h-4" />
                <span>Educators & Competitive Programmers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Share Your Knowledge with Thousands of Learners
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Upload courses, organize video & text lessons, author diagnostic quiz question banks, and track enrolled students with universal live progress synchronization.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto shrink-0">
              <Button href="/auth/register" variant="highlight" size="lg" className="font-bold text-xs sm:text-sm px-6 py-3.5">
                Join as Instructor
              </Button>
              <Button href="/about" variant="outlineSecondary" size="lg" className="text-white border-white/40 hover:bg-white/10 dark:text-white dark:border-white/40 dark:hover:bg-white/10 font-bold text-xs sm:text-sm px-6 py-3.5">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
