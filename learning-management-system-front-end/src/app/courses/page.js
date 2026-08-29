"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CourseCard } from "@/components/courses/CourseCard";
import { api } from "@/lib/api";

function CoursesCatalogContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [isLoading, setIsLoading] = useState(true);

  // Sync search param if URL changes
  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [courseRes, catRes] = await Promise.all([
          api
            .get(
              "/courses?populate[modules][populate]=lessons&populate[quizzes]=*&populate[category]=*&populate[instructor]=*&populate[enrollments]=*"
            )
            .catch((err) => {
              console.warn("Failed to fetch courses:", err);
              return null;
            }),
          api.get("/categories").catch((err) => {
            console.warn("Failed to fetch categories:", err);
            return null;
          }),
        ]);

        if (Array.isArray(courseRes?.data)) {
          setCourses(courseRes.data);
        } else if (courseRes?.data) {
          setCourses([courseRes.data]);
        } else {
          setCourses([]);
        }

        if (Array.isArray(catRes?.data)) {
          setCategories(catRes.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Error loading courses:", err);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const filteredCourses = courses
    .filter((c) => {
      const query = search.toLowerCase().trim();
      const titleMatch =
        !query ||
        c.title?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.category?.name?.toLowerCase().includes(query);

      const catMatch =
        selectedCategory === "all" ||
        c.category?.slug === selectedCategory ||
        c.category?.name === selectedCategory ||
        c.category?.documentId === selectedCategory ||
        String(c.category?.id) === selectedCategory;

      const diffMatch =
        selectedDifficulty === "all" ||
        c.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

      return titleMatch && catMatch && diffMatch;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "lessons") {
        const aL = a.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
        const bL = b.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
        return bL - aL;
      }
      // default: popular (enrollments count)
      const aE = a.enrollments?.length || 0;
      const bE = b.enrollments?.length || 0;
      return bE - aE;
    });

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-11/12 mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="highlight">Curated Learning Tracks</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Explore CPS Academy Courses
        </h1>
        <p className="text-sm sm:text-base text-muted">
          Master Competitive Programming, Algorithms, System Design, and Full-Stack Engineering with structured video modules and timed evaluations.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-surface border border-border space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Input
              placeholder="Search by course title, keyword, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-8"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs p-0.5"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-lg bg-card border border-border text-xs text-foreground font-medium focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg bg-card border border-border text-xs text-foreground font-medium focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="lessons">Most Lessons</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Clear All Filters Button */}
            {(search || selectedCategory !== "all" || selectedDifficulty !== "all" || sortBy !== "popular") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                  setSortBy("popular");
                }}
                className="text-xs font-semibold text-red-500 hover:text-red-600 border-red-500/20 hover:bg-red-500/10 transition-colors"
              >
                ✕ Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          <Button
            variant={selectedCategory === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="text-xs flex-shrink-0"
          >
            All Tracks ({courses.length})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.documentId || cat.id}
              variant={selectedCategory === (cat.slug || cat.name) ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.slug || cat.name)}
              className="text-xs flex-shrink-0"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
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
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <div className="w-16 h-6 bg-surface rounded" />
                  <div className="w-24 h-8 bg-surface rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          title="No Matching Courses Found"
          description={
            search || selectedCategory !== "all" || selectedDifficulty !== "all"
              ? "We couldn't find any courses matching your active search keywords or filter selections."
              : "No course tracks are currently published in the academy catalog. Check back soon!"
          }
          action={
            (search || selectedCategory !== "all" || selectedDifficulty !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
              >
                Reset All Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.documentId || course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-muted text-sm">
          Loading course catalog...
        </div>
      }
    >
      <CoursesCatalogContent />
    </Suspense>
  );
}
