"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/courses/CourseCard";
import { api } from "@/lib/api";

const FALLBACK_COURSES = [
  {
    id: 1,
    title: "Complete Competitive Programming Bootcamp",
    slug: "competitive-programming-bootcamp",
    description: "Master C++, STL, Number Theory, Dynamic Programming, and Graph Algorithms for ICPC & Codeforces.",
    price: 4500,
    difficulty: "Intermediate",
    thumbnailUrl: "https://images.unsplash.com/photo-1516116211227-bbc2416b2505?w=600",
    category: { name: "Competitive Programming", slug: "competitive-programming" },
    instructor: { username: "Wasif Hasan" },
    modules: [{ lessons: [1, 2, 3, 4, 5, 6, 7, 8] }],
    quizzes: [1, 2, 3],
    enrollments: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 2,
    title: "Data Structures & Algorithms with C++",
    slug: "dsa-cpp-mastery",
    description: "In-depth intuition and implementation for Trees, Graphs, Sorting, Searching, and Complexity Analysis.",
    price: 3800,
    difficulty: "Beginner",
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
    category: { name: "Data Structures & Algorithms", slug: "dsa" },
    instructor: { username: "Sharif Ahmed" },
    modules: [{ lessons: [1, 2, 3, 4, 5, 6] }],
    quizzes: [1, 2],
    enrollments: [1, 2, 3, 4, 5],
  },
  {
    id: 3,
    title: "Full-Stack Web Engineering with Next.js 16 & Strapi v5",
    slug: "fullstack-nextjs-strapi",
    description: "Production-ready full-stack web applications with React 19, Server Components, Neon PostgreSQL, and Stripe.",
    price: 5200,
    difficulty: "Advanced",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
    category: { name: "Web Development", slug: "web-development" },
    instructor: { username: "CPS Engineering" },
    modules: [{ lessons: [1, 2, 3, 4, 5, 6, 7] }],
    quizzes: [1, 2],
    enrollments: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 4,
    title: "System Design & Distributed Architecture",
    slug: "system-design-distributed-systems",
    description: "Architect scalable, fault-tolerant backend systems, microservices, and event-driven architectures.",
    price: 6000,
    difficulty: "Advanced",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
    category: { name: "System Design & Architecture", slug: "system-design" },
    instructor: { username: "Wasif Hasan" },
    modules: [{ lessons: [1, 2, 3, 4, 5] }],
    quizzes: [1],
    enrollments: [1, 2, 3, 4],
  },
];

function CoursesCatalogContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [courses, setCourses] = useState(FALLBACK_COURSES);
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
      try {
        const [courseRes, catRes] = await Promise.all([
          api
            .get(
              "/courses?populate[modules][populate]=lessons&populate[quizzes]=*&populate[category]=*&populate[instructor]=*&populate[enrollments]=*"
            )
            .catch(() => null),
          api.get("/categories").catch(() => null),
        ]);

        if (Array.isArray(courseRes?.data) && courseRes.data.length > 0) {
          setCourses(courseRes.data);
        }
        if (Array.isArray(catRes?.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.warn("Could not fetch courses from backend API:", err);
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
        c.category?.name === selectedCategory;

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
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
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
              className="w-full text-xs pl-9"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
              variant={selectedCategory === cat.slug ? "primary" : "outline"}
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
      {filteredCourses.length === 0 ? (
        <div className="p-16 text-center text-muted text-sm border border-dashed border-border rounded-xl">
          No courses found matching your search query or filter criteria.
        </div>
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
