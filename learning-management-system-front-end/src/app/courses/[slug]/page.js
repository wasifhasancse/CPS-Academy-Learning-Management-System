"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, getRoleDashboardPath } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CourseCard } from "@/components/courses/CourseCard";
import { api } from "@/lib/api";
import {
  HiOutlineArrowLeft,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlinePlay,
  HiOutlineDocumentText,
  HiOutlineLightBulb,
} from "react-icons/hi2";

export default function CourseDetailPage({ params }) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug;
  const slug = rawSlug ? decodeURIComponent(rawSlug).trim() : "";
  const router = useRouter();

  const { user, role, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const dashboardPath = getRoleDashboardPath(role);

  const [course, setCourse] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadCourse() {
      if (!slug) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        let foundCourse = null;
        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

        // 1. Try direct findOne endpoint
        const directRes = await api
          .get(
            `/courses/${encodeURIComponent(slug)}?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[category]=*&populate[instructor]=*&populate[enrollments][populate]=student`
          )
          .catch(() => null);

        if (directRes?.data && !Array.isArray(directRes.data)) {
          foundCourse = directRes.data;
        }

        // 2. Try normalized slug if direct with raw slug didn't return
        if (!foundCourse && normalizedSlug && normalizedSlug !== slug) {
          const normRes = await api
            .get(
              `/courses/${encodeURIComponent(normalizedSlug)}?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[category]=*&populate[instructor]=*&populate[enrollments][populate]=student`
            )
            .catch(() => null);

          if (normRes?.data && !Array.isArray(normRes.data)) {
            foundCourse = normRes.data;
          }
        }

        // 3. Fallback: fetch courses catalog and match
        const listRes = await api
          .get(
            `/courses?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[category]=*&populate[instructor]=*&populate[enrollments]=*`
          )
          .catch(() => null);

        const allCourses = Array.isArray(listRes?.data) ? listRes.data : [];

        if (!foundCourse) {
          foundCourse = allCourses.find((c) => {
            if (!c) return false;
            const cSlug = (c.slug || "").toLowerCase();
            const cTitle = (c.title || "").toLowerCase();
            const cTitleSlug = cTitle.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            const cDocId = (c.documentId || "").toLowerCase();
            const cId = String(c.id || "").toLowerCase();
            const target = slug.toLowerCase();

            return (
              cSlug === target ||
              cSlug === normalizedSlug ||
              cDocId === target ||
              cId === target ||
              cTitle === target ||
              cTitleSlug === normalizedSlug ||
              cTitleSlug === target
            );
          }) || null;
        }

        if (foundCourse) {
          setCourse(foundCourse);

          // Get recommended courses (excluding current course)
          const targetCourseId = foundCourse.documentId || foundCourse.id;
          const related = allCourses
            .filter((c) => (c.documentId || c.id) !== targetCourseId)
            .slice(0, 3);
          setRecommendedCourses(related);

          // Check if current authenticated student is already enrolled
          if (token && user?.id) {
            const enrollsRes = await api.get("/enrollments", { token }).catch(() => ({ data: [] }));
            const myEnrolls = Array.isArray(enrollsRes?.data) ? enrollsRes.data : [];
            const hasEnrollment = myEnrolls.some((e) => {
              const c = e.course;
              if (!c) return false;
              const cSlug = (c.slug || "").toLowerCase();
              const cDocId = (c.documentId || "").toLowerCase();
              const cId = String(c.id || "").toLowerCase();
              const targetSlug = (foundCourse.slug || slug).toLowerCase();
              const targetDocId = (foundCourse.documentId || "").toLowerCase();
              const targetId = String(foundCourse.id || "").toLowerCase();
              return cSlug === targetSlug || cDocId === targetDocId || cId === targetId;
            });
            setIsEnrolled(hasEnrollment);
          }
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error("Failed to load course details:", err);
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (!isAuthLoading) {
      loadCourse();
    }
  }, [slug, user, token, isAuthLoading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("canceled")) {
        setErrorMessage("Checkout was canceled. You can try again whenever you're ready.");
      }
    }
  }, []);

  const handleStudentEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/courses/${encodeURIComponent(slug)}`);
      return;
    }

    if (role !== "Student") {
      setErrorMessage("Only students can enroll in courses.");
      return;
    }

    setIsEnrolling(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const targetCourseId = course.documentId || course.id;
      const coursePrice = Number(course.price || 0);

      // Paid course -> Create Stripe Checkout session
      if (coursePrice > 0) {
        const response = await fetch("/api/checkout_sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price: coursePrice,
            className: course.title,
            trainer: instructorName,
            classId: targetCourseId,
            courseSlug: course.slug || slug,
            userId: user.id,
            userEmail: user.email,
            userName: user.username || user.name,
          }),
        });

        const checkoutRes = await response.json();

        if (checkoutRes?.url) {
          window.location.href = checkoutRes.url;
          return;
        } else if (checkoutRes?.error) {
          throw new Error(checkoutRes.error);
        } else {
          throw new Error("Unable to create checkout session. Please try again.");
        }
      } else {
        // Free course -> Instant direct enrollment
        await api.post(
          "/enrollments",
          {
            data: {
              course: targetCourseId,
              student: user.id,
              enrolledAt: new Date(),
            },
          },
          { token }
        );

        setIsEnrolled(true);
        setSuccessMessage("Enrollment successful! You can now start learning.");
      }
    } catch (err) {
      setErrorMessage(err?.message || "Failed to initiate payment. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="w-36 h-6 bg-surface rounded-lg" />
        <div className="w-3/4 h-12 bg-surface rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-64 bg-surface rounded-2xl" />
            <div className="w-full h-40 bg-surface rounded-2xl" />
          </div>
          <div className="w-full h-80 bg-surface rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Course Not Found</h2>
        <p className="text-sm text-muted">
          The course you are looking for might have been moved or does not exist.
        </p>
        <Button href="/courses" variant="primary" size="md">
          ← Back to All Courses
        </Button>
      </div>
    );
  }

  const categoryName = course.category?.name || "Programming Track";
  const instructorName =
    course.instructor?.username ||
    course.instructor?.name ||
    (typeof course.instructor === "string" ? course.instructor : "") ||
    "CPS Instructor";

  const allModules = course.modules || [];
  const allLessons = allModules.flatMap((m) => m.lessons || []);
  const allQuizzes = course.quizzes || [];
  const enrollmentsCount = course.enrollments?.length || 0;

  const isStudent = role === "Student";
  const isStaff = ["Admin", "Content Manager", "Instructor"].includes(role);

  return (
    <div className="w-full pb-20 space-y-12">
      {/* 1. TOP HERO HEADER BANNER */}
      <section className="bg-surface border-b border-border py-10 lg:py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top-Left Back / Browse Catalog Button */}
          <div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors bg-card border border-border px-3.5 py-1.5 rounded-xl shadow-xs"
            >
              <HiOutlineArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Course Catalog</span>
            </Link>
          </div>

          <div className="max-w-4xl space-y-4">
            {/* Category & Difficulty Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="highlight" size="sm" className="font-bold text-[11px]">
                {categoryName}
              </Badge>
              <Badge variant="outline" size="sm" className="font-semibold text-[11px]">
                {course.difficulty || "All Levels"}
              </Badge>
              {course.isFree && (
                <Badge variant="secondary" size="sm" className="font-bold text-[11px]">
                  Free Course
                </Badge>
              )}
            </div>

            {/* Main Course Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              {course.title}
            </h1>

            {/* Course Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs sm:text-sm text-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-xs shrink-0">
                  {instructorName.charAt(0).toUpperCase()}
                </div>
                <span className="text-muted">Instructor:</span>
                <strong className="font-bold text-foreground">{instructorName}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <HiOutlineBookOpen className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-foreground">
                  {allLessons.length} Lessons • {allQuizzes.length} {allQuizzes.length === 1 ? "Quiz" : "Quizzes"}
                </span>
              </div>

              {enrollmentsCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <HiOutlineAcademicCap className="w-4 h-4 text-secondary" />
                  <span className="font-semibold text-foreground">{enrollmentsCount} Students Enrolled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT & STICKY SIDEBAR */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Course Overview, What You'll Learn, Curriculum, and Quizzes */}
          <div className="lg:col-span-8 space-y-8">
            {/* Status Messages */}
            {errorMessage && (
              <div role="alert" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-semibold">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div role="alert" className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-semibold">
                {successMessage}
              </div>
            )}

            {/* Enrolled Status Banner */}
            {isEnrolled && (
              <div className="p-5 rounded-2xl bg-secondary/15 border border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center font-bold text-base shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">You are currently enrolled in this track</h3>
                    <p className="text-xs text-muted">You have unlimited lifetime access to all course lectures and quiz scorecards.</p>
                  </div>
                </div>
                <Button href={`/learn/${course.slug || slug}`} variant="primary" size="sm" className="font-bold text-xs shrink-0">
                  <span>Continue Learning →</span>
                </Button>
              </div>
            )}

            {/* A. COURSE DETAILS & LEARNING OBJECTIVES (ABOVE CURRICULUM) */}
            <Card className="bg-surface border-border overflow-hidden shadow-xs">
              <CardHeader className="py-4 px-6 bg-card border-b border-border">
                <div className="flex items-center gap-2">
                  <HiOutlineLightBulb className="w-5 h-5 text-secondary" />
                  <CardTitle as="h2" className="text-base sm:text-lg font-bold text-foreground">
                    Course Overview & What You Will Learn
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Detailed Description */}
                <div className="text-xs pt-6 sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                  {course.description || "In this course, you will learn industry-tested computer science foundations, solve contest-grade problem sets, and build verifiable skills."}
                </div>

                {/* Key Takeaways Grid */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Core Learning Takeaways
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-foreground">
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border">
                      <HiOutlineCheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span>Deep theoretical intuition & problem-solving frameworks</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border">
                      <HiOutlineCheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span>Hands-on implementation of core algorithms & data structures</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border">
                      <HiOutlineCheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span>Timed server-evaluated checkpoint quizzes with review scorecards</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border">
                      <HiOutlineCheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span>Verified Certificate of Completion for resumes and portfolios</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* B. কোর্স সিলেবাস (COURSE CURRICULUM) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground">কোর্স সিলেবাস (Course Curriculum)</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {allModules.length} Modules • {allLessons.length} Video & Text Lessons • {allQuizzes.length} Diagnostic Quizzes
                  </p>
                </div>
              </div>

              {allModules.length === 0 ? (
                <Card className="p-8 text-center text-muted text-xs bg-card border-border">
                  Course syllabus is currently being organized by the instructor.
                </Card>
              ) : (
                <div className="space-y-3.5">
                  {allModules.map((module, mIdx) => (
                    <Card key={module.documentId || module.id || mIdx} className="bg-card border-border overflow-hidden shadow-xs">
                      <CardHeader className="py-4 px-6 bg-surface/70 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <CardTitle as="h3" className="text-sm sm:text-base font-bold text-foreground">
                              Module {mIdx + 1}: {module.title}
                            </CardTitle>
                            <p className="text-xs text-muted font-medium">
                              {module.lessons?.length || 0} Lessons
                            </p>
                          </div>
                          {isEnrolled && (
                            <Link href={`/learn/${course.slug || slug}`}>
                              <Badge variant="primary" size="sm" className="cursor-pointer hover:bg-secondary">
                                ▶ Start Module
                              </Badge>
                            </Link>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-5">
                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/80">
                            {module.lessons.map((lesson, lIdx) => (
                              <div
                                key={lesson.documentId || lesson.id || lIdx}
                                className="relative flex items-center justify-between text-xs py-1 hover:text-secondary transition-colors"
                              >
                                <div
                                  className="absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10 bg-surface border-2 border-border text-secondary"
                                >
                                  {lesson.youtubeUrl ? (
                                    <HiOutlinePlay className="w-2.5 h-2.5" />
                                  ) : (
                                    <HiOutlineDocumentText className="w-3 h-3" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  {isEnrolled ? (
                                    <Link href={`/learn/${course.slug || slug}`} className="font-semibold text-foreground hover:text-secondary truncate">
                                      {lesson.title}
                                    </Link>
                                  ) : (
                                    <span className="font-semibold text-foreground truncate">{lesson.title}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {lesson.isFreePreview && (
                                    <Badge variant="highlight" size="sm" className="text-[10px]">
                                      Free Preview
                                    </Badge>
                                  )}
                                  {lesson.duration && (
                                    <span className="text-muted text-[11px] font-mono">{lesson.duration}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-2 text-xs text-muted">
                            Lessons in development.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* C. DIAGNOSTIC EVALUATIONS & QUIZZES */}
            {allQuizzes.length > 0 && (
              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Diagnostic Evaluations & Quizzes</h3>
                  <p className="text-xs text-muted">Server-evaluated checkpoints with scorecards and answer key reviews.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allQuizzes.map((quiz, qIdx) => (
                    <Card key={quiz.documentId || quiz.id || qIdx} className="p-5 bg-card border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="surface" size="sm">Quiz {qIdx + 1}</Badge>
                        <span className="text-xs font-bold text-secondary">Passing: {quiz.passingScore || 80}%</span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{quiz.title}</h4>
                      <p className="text-xs text-muted">
                        {quiz.questions?.length || 0} Questions • Time Limit: {quiz.timeLimitMinutes || 20} mins
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Enrollment Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <Card className="p-6 bg-card border-2 border-border space-y-6 shadow-md rounded-3xl">
                {/* Thumbnail Image */}
                {course.thumbnailUrl && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-border bg-surface relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Price Display */}
                <div className="flex items-baseline justify-between pt-1">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">Tuition Fee</span>
                    <div className="text-3xl sm:text-4xl font-black text-foreground mt-0.5">
                      {Number(course.price || 0) === 0 ? "Free Track" : `৳${Number(course.price || 0).toLocaleString()}`}
                    </div>
                  </div>
                  <Badge variant="highlight" size="sm" className="font-bold text-[11px]">
                    Full Lifetime Access
                  </Badge>
                </div>

                {/* Role-Based Enrollment / Access Actions */}
                <div className="pt-2 space-y-3">
                  {!isAuthenticated ? (
                    <div className="space-y-2.5">
                      <Button
                        href={`/auth/login?redirect=/courses/${encodeURIComponent(slug)}`}
                        variant="primary"
                        size="md"
                        className="w-full font-bold text-xs sm:text-sm py-3"
                      >
                        Log In to Enroll
                      </Button>
                      <p className="text-center text-xs text-muted">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="text-secondary font-bold hover:underline">
                          Create Free Account
                        </Link>
                      </p>
                    </div>
                  ) : isStudent ? (
                    isEnrolled ? (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-secondary/15 border border-secondary/30 text-center space-y-1">
                          <p className="text-xs font-bold text-foreground flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-secondary"></span>
                            <span>Enrolled & Ready</span>
                          </p>
                          <p className="text-[11px] text-muted">Access all lectures and quizzes anytime.</p>
                        </div>
                        <Button
                          href={`/learn/${course.slug || slug}`}
                          variant="primary"
                          size="md"
                          className="w-full font-bold text-xs sm:text-sm py-3"
                        >
                          <span>Go to Learning Player →</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleStudentEnroll}
                        disabled={isEnrolling}
                        variant="primary"
                        size="md"
                        className="w-full font-bold text-xs sm:text-sm py-3"
                      >
                        {isEnrolling
                          ? (Number(course.price || 0) > 0 ? "Redirecting to Stripe..." : "Enrolling...")
                          : (Number(course.price || 0) > 0
                              ? `Pay & Enroll Now • ৳${Number(course.price || 0).toLocaleString()}`
                              : "Enroll in Free Course")}
                      </Button>
                    )
                  ) : isStaff ? (
                    <div className="space-y-3 p-4 rounded-2xl bg-surface border border-border">
                      <div className="flex items-center justify-between">
                        <Badge variant="surface" size="sm" className="font-bold">
                          {role} View
                        </Badge>
                        <span className="text-[11px] text-muted font-semibold">Staff Access</span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        Only student accounts can enroll. As an authorized <strong>{role}</strong>, you can manage or preview this course from your dashboard.
                      </p>
                      <div className="flex flex-col gap-2 pt-1">
                        <Button href={dashboardPath} variant="primary" size="sm" className="w-full text-xs font-bold">
                          Go to {role} Dashboard
                        </Button>
                        <Button href={`/learn/${course.slug || slug}`} variant="outline" size="sm" className="w-full text-xs font-bold">
                          Preview Player
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleStudentEnroll}
                      disabled={isEnrolling}
                      variant="primary"
                      size="md"
                      className="w-full font-bold text-xs sm:text-sm py-3"
                    >
                      Enroll in Course
                    </Button>
                  )}
                </div>

                {/* What's Included Feature List */}
                <div className="pt-4 border-t border-border space-y-3 text-xs text-foreground">
                  <span className="font-bold block text-muted uppercase tracking-wider text-[11px]">
                    This Course Includes
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-secondary font-bold">✓</span>
                    <span>{allLessons.length} Full Video & Text Lessons</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-secondary font-bold">✓</span>
                    <span>{allQuizzes.length} Timed Diagnostic Quizzes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-secondary font-bold">✓</span>
                    <span>Direct Access to Instructor Code Templates</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-secondary font-bold">✓</span>
                    <span>CPS Academy Certificate of Completion</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RECOMMENDED COURSES HORIZONTAL SECTION AT BOTTOM */}
      {recommendedCourses.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-border space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="highlight" size="sm" className="mb-2">
                Explore More
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Recommended Courses & Related Tracks
              </h2>
            </div>
            <Link
              href="/courses"
              className="text-xs font-bold text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <span>View All Courses</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((recCourse) => (
              <CourseCard key={recCourse.documentId || recCourse.id} course={recCourse} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
