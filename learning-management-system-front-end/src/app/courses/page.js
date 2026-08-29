"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseGridSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import {
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineArrowPath,
} from "react-icons/hi2";

function CoursesCatalogContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
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
    if (initialCategory && initialCategory !== "all") {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

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

  const hasActiveFilters = search || selectedCategory !== "all" || selectedDifficulty !== "all" || sortBy !== "popular";

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSortBy("popular");
  };

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary dark:text-highlight">
          <HiOutlineSparkles className="w-4 h-4" />
          <span>Curated Computer Science Curriculums</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Explore CPS Academy Courses
        </h1>
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
          Master Competitive Programming, Algorithms, System Design, and Full-Stack Engineering with structured video modules, reading notes, and timed quiz evaluations.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto p-1.5 rounded-2xl bg-surface/60 border border-border">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground hover:bg-surface"
            }`}
          >
            All Tracks ({courses.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === (cat.slug || cat.name || cat.documentId);
            const count = courses.filter(
              (c) =>
                c.category?.slug === cat.slug ||
                c.category?.name === cat.name ||
                c.category?.documentId === cat.documentId
            ).length;

            return (
              <button
                key={cat.documentId || cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug || cat.name || cat.documentId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-card border border-border text-muted"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Input
              placeholder="Search courses by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-8"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <HiOutlineMagnifyingGlass className="w-4 h-4" />
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs p-0.5 cursor-pointer"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-card border border-border text-xs text-foreground font-semibold focus:outline-none min-w-[140px]"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner Level</option>
              <option value="intermediate">Intermediate Level</option>
              <option value="advanced">Advanced Level</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-card border border-border text-xs text-foreground font-semibold focus:outline-none min-w-[140px]"
            >
              <option value="popular">Most Popular</option>
              <option value="lessons">Most Lessons</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-red-500 hover:text-red-600 border-red-500/20 hover:bg-red-500/10 transition-colors gap-1"
              >
                <HiOutlineArrowPath className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Results Counter & Search Indicator */}
        <div className="flex items-center justify-between text-xs text-muted px-1">
          <span>
            Showing <strong className="text-foreground">{filteredCourses.length}</strong> of{" "}
            <strong className="text-foreground">{courses.length}</strong> available courses
          </span>

          {search && (
            <div className="flex items-center gap-1.5">
              <span>Matching &ldquo;<strong className="text-foreground">{search}</strong>&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-primary dark:text-highlight hover:underline font-bold text-xs cursor-pointer ml-1"
              >
                Clear ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <CourseGridSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={<HiOutlineBookOpen className="w-8 h-8 text-muted" />}
          title="No Matching Courses Found"
          description={
            hasActiveFilters
              ? "We couldn't find any courses matching your active search keywords or filter selections."
              : "No course tracks are currently published in the academy catalog. Check back soon!"
          }
          action={
            hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
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
        <div className="w-full py-10 px-4 max-w-[1400px] mx-auto space-y-8 animate-pulse">
          <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-border space-y-4">
            <div className="w-32 h-6 rounded-full bg-card" />
            <div className="w-96 max-w-full h-10 rounded-xl bg-card" />
            <div className="w-72 max-w-full h-4 rounded bg-card" />
          </div>
          <CourseGridSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
        </div>
      }
    >
      <CoursesCatalogContent />
    </Suspense>
  );
}
