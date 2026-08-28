"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { CourseCard } from "@/components/courses/CourseCard";
import { api } from "@/lib/api";

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true);
      try {
        const [courseRes, catRes] = await Promise.all([
          api
            .get(
              "/courses?populate[modules][populate]=lessons&populate[quizzes]=*&populate[category]=*&populate[instructor]=*&populate[enrollments]=*"
            )
            .catch(() => null),
          api.get("/categories").catch(() => null),
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
      } catch (err) {
        console.warn("Could not fetch home data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="w-full flex flex-col transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="bg-surface py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge variant="highlight" size="sm">
                CPS Academy
              </Badge>
              <span className="text-xs font-medium text-muted">
                Structured Computer Science & Competitive Programming
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Master Problem Solving & Software Engineering
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed">
              Accelerate your programming journey with structured curriculums, interactive video lessons, timed quiz assessments, and verified course certificates.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button href="/courses" variant="primary" size="lg">
                Explore All Courses
              </Button>
              <Button href="/auth/register" variant="outline" size="lg">
                Create Free Account
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">100%</span>
                <span className="text-xs text-muted">Curated Tracks</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Active</span>
                <span className="text-xs text-muted">Quiz Engine</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Direct</span>
                <span className="text-xs text-muted">Mentor Guidance</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Verified</span>
                <span className="text-xs text-muted">Stripe Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-16 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <Badge variant="surface" size="sm" className="mb-2">
                  Curated Taxonomies
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Browse by Category
                </h2>
              </div>
              <Link
                href="/courses"
                className="text-sm font-semibold text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                View all tracks →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Card key={category.documentId || category.id} hoverable className="flex flex-col justify-between">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-surface text-foreground font-bold flex items-center justify-center mb-3">
                      {category.name?.charAt(0) || "C"}
                    </div>
                    <CardTitle as="h3">{category.name}</CardTitle>
                    <CardDescription>{category.description || "Structured learning path and problem sets."}</CardDescription>
                  </CardHeader>
                  <CardFooter className="justify-between">
                    <span className="text-xs font-semibold text-secondary">
                      Active Track
                    </span>
                    <Link
                      href={`/courses?category=${category.slug || category.documentId || category.id}`}
                      className="text-xs font-medium text-foreground hover:text-secondary transition-colors"
                    >
                      Explore →
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED COURSES */}
      <section className="py-16 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <Badge variant="highlight" size="sm" className="mb-2">
                Popular Classes
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Featured Courses
              </h2>
            </div>
            <Link
              href="/courses"
              className="text-sm font-semibold text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              View all courses →
            </Link>
          </div>

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
          ) : featuredCourses.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm border border-dashed border-border rounded-xl">
              No courses currently published on the platform.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.documentId || course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW CPS ACADEMY WORKS */}
      <section className="py-16 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="surface" size="sm" className="mb-2">
              Learning Journey
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              How You Learn at CPS Academy
            </h2>
            <p className="text-sm text-muted mt-2">
              A systematic 4-step framework built for concrete skill development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-border bg-surface flex flex-col">
              <span className="text-2xl font-black text-secondary mb-3">01</span>
              <h3 className="text-base font-bold text-foreground mb-1.5">Discover & Enroll</h3>
              <p className="text-xs text-muted leading-relaxed">
                Browse classes by topic and difficulty, and enroll seamlessly with Stripe checkout.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-surface flex flex-col">
              <span className="text-2xl font-black text-secondary mb-3">02</span>
              <h3 className="text-base font-bold text-foreground mb-1.5">Stream Video Lessons</h3>
              <p className="text-xs text-muted leading-relaxed">
                Watch curated YouTube video lessons with timestamp checkpoints and download class resources.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-surface flex flex-col">
              <span className="text-2xl font-black text-secondary mb-3">03</span>
              <h3 className="text-base font-bold text-foreground mb-1.5">Take Timed Quizzes</h3>
              <p className="text-xs text-muted leading-relaxed">
                Reinforce concepts through automated, server-evaluated quizzes with explanations.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-surface flex flex-col">
              <span className="text-2xl font-black text-secondary mb-3">04</span>
              <h3 className="text-base font-bold text-foreground mb-1.5">Track & Certify</h3>
              <p className="text-xs text-muted leading-relaxed">
                Track completion progress on your dashboard and obtain certified proof of mastery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INSTRUCTOR INVITATION CTA */}
      <section className="py-16 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary text-white border border-secondary/30 rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="max-w-xl space-y-3">
              <Badge variant="highlight" size="sm">
                Educators & Competitive Programmers
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Share Your Knowledge with Thousands of Learners
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Upload classes, organize modules with YouTube video lessons, create question banks, and manage student assessments.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button href="/auth/register" variant="highlight" size="lg">
                Join as Instructor
              </Button>
              <Button href="/about" variant="outlineSecondary" size="lg" className="text-white border-white/40 hover:bg-white/10 dark:text-white dark:border-white/40 dark:hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
