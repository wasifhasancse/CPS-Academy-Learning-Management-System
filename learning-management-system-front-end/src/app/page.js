import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

const CATEGORIES = [
  {
    name: "Competitive Programming",
    slug: "competitive-programming",
    courseCount: 14,
    description: "C++, STL, Number Theory, Dynamic Programming, and Graph Algorithms for ICPC & Codeforces.",
  },
  {
    name: "Data Structures & Algorithms",
    slug: "dsa",
    courseCount: 18,
    description: "Trees, Graphs, Sorting, Searching, Bit Manipulation, and Complexity Analysis.",
  },
  {
    name: "Full-Stack Web Development",
    slug: "full-stack-web",
    courseCount: 22,
    description: "Modern Next.js 16, React 19, Node.js, Strapi v5, and REST/GraphQL APIs.",
  },
  {
    name: "Database Systems & SQL",
    slug: "database-systems",
    courseCount: 9,
    description: "PostgreSQL, Neon, query optimization, indexing, and transactional data integrity.",
  },
];

const FEATURED_COURSES = [
  {
    id: 1,
    title: "Complete Competitive Programming Bootcamp",
    slug: "competitive-programming-bootcamp",
    category: "Competitive Programming",
    instructor: "Wasif Hasan",
    difficulty: "Intermediate",
    lessonsCount: 42,
    quizzesCount: 8,
    price: 49.99,
    isPopular: true,
  },
  {
    id: 2,
    title: "Mastering Data Structures & Algorithms with C++",
    slug: "mastering-dsa-cpp",
    category: "Data Structures",
    instructor: "Sharif Ahmed",
    difficulty: "All Levels",
    lessonsCount: 56,
    quizzesCount: 12,
    price: 39.99,
    isPopular: false,
  },
  {
    id: 3,
    title: "Full-Stack Web Engineering with Next.js 16 & Strapi",
    slug: "full-stack-nextjs-strapi",
    category: "Web Development",
    instructor: "CPS Team",
    difficulty: "Advanced",
    lessonsCount: 38,
    quizzesCount: 6,
    price: 59.99,
    isPopular: true,
  },
  {
    id: 4,
    title: "Graph Theory & Dynamic Programming Masterclass",
    slug: "graph-theory-dp-masterclass",
    category: "Competitive Programming",
    instructor: "Wasif Hasan",
    difficulty: "Advanced",
    lessonsCount: 30,
    quizzesCount: 6,
    price: 44.99,
    isPopular: false,
  },
];

export default function Home() {
  return (
    <div className="w-full flex flex-col transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="bg-surface py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge variant="highlight" size="sm">
                CPS Academy 2026
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
                <span className="text-xs text-muted">Structured Syllabus</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Interactive</span>
                <span className="text-xs text-muted">YouTube Video Player</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Timed</span>
                <span className="text-xs text-muted">Automated Quizzes</span>
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
              href="/categories"
              className="text-sm font-semibold text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              View all categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => (
              <Card key={category.slug} hoverable className="flex flex-col justify-between">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-surface text-foreground font-bold flex items-center justify-center mb-3">
                    {category.name.charAt(0)}
                  </div>
                  <CardTitle as="h3">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-between">
                  <span className="text-xs font-semibold text-secondary">
                    {category.courseCount} Courses
                  </span>
                  <Link
                    href={`/courses?category=${category.slug}`}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_COURSES.map((course) => (
              <Card key={course.id} hoverable className="flex flex-col justify-between">
                <div>
                  {/* Thumbnail Placeholder */}
                  <div className="aspect-video w-full bg-surface border-b border-border flex items-center justify-center relative p-4">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">
                      {course.category}
                    </span>
                    {course.isPopular && (
                      <div className="absolute top-2.5 right-2.5">
                        <Badge variant="highlight" size="sm">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                      <span>{course.difficulty}</span>
                      <span>{course.lessonsCount} Lessons</span>
                    </div>
                    <CardTitle as="h3" className="text-base leading-snug">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Instructor: <strong className="text-foreground">{course.instructor}</strong>
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardFooter className="justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted">Price</span>
                    <span className="text-base font-bold text-foreground">
                      ${course.price.toFixed(2)}
                    </span>
                  </div>
                  <Button href={`/courses/${course.slug}`} variant="secondary" size="sm">
                    View Course
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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
