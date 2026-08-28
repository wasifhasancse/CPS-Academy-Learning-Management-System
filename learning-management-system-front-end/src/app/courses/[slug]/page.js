"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, getRoleDashboardPath } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { api } from "@/lib/api";

export default function CourseDetailPage({ params }) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug;
  const slug = rawSlug ? decodeURIComponent(rawSlug).trim() : "";
  const router = useRouter();

  const { user, role, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const dashboardPath = getRoleDashboardPath(role);

  const [course, setCourse] = useState(null);
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

        // 1. Try direct findOne endpoint (supports documentId, slug, title, id)
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

        // 3. If still not found, fetch courses catalog and match specifically against slug, documentId, id, or title
        if (!foundCourse) {
          const listRes = await api
            .get(
              `/courses?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[category]=*&populate[instructor]=*&populate[enrollments][populate]=student`
            )
            .catch(() => null);

          const allCourses = Array.isArray(listRes?.data) ? listRes.data : [];
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

          // Check if current authenticated student is already enrolled
          if (user?.id && Array.isArray(foundCourse.enrollments)) {
            const hasEnrollment = foundCourse.enrollments.some(
              (e) =>
                e.student?.id === user.id ||
                e.student?.documentId === user.documentId ||
                e.student === user.id
            );
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

    loadCourse();
  }, [slug, user]);

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
    } catch (err) {
      setErrorMessage(err?.message || "Failed to enroll in course. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-11/12 mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="w-48 h-6 bg-surface rounded" />
        <div className="w-3/4 h-12 bg-surface rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-64 bg-surface rounded-xl" />
            <div className="w-full h-40 bg-surface rounded-xl" />
          </div>
          <div className="w-full h-80 bg-surface rounded-xl" />
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
    <div className="w-full pb-20">
      {/* Course Hero Banner */}
      <section className="bg-surface border-b border-border py-12 lg:py-16">
        <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="highlight" size="sm" className="uppercase font-bold">
                  {categoryName}
                </Badge>
                <Badge variant="surface" size="sm">
                  {course.difficulty || "All Levels"}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-muted leading-relaxed">
                {course.description || "Master core concepts, algorithms, and practical implementations with step-by-step video modules and hands-on quiz evaluations."}
              </p>

              {/* Course Meta Info */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted">Instructor:</span>
                  <strong className="font-semibold text-foreground">{instructorName}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted">Curriculum:</span>
                  <span className="font-medium text-foreground">
                    {allLessons.length} Lessons • {allQuizzes.length} {allQuizzes.length === 1 ? "Quiz" : "Quizzes"}
                  </span>
                </div>
                {enrollmentsCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted">Enrolled:</span>
                    <span className="font-medium text-foreground">{enrollmentsCount} Students</span>
                  </div>
                )}
              </div>
            </div>

            {/* Breadcrumb / Back Link */}
            <div className="shrink-0">
              <Button href="/courses" variant="outline" size="sm">
                ← Browse Catalog
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sticky Enrollment Sidebar */}
      <section className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Syllabus & Learning Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Messages */}
            {errorMessage && (
              <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-semibold">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div role="alert" className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-semibold">
                {successMessage}
              </div>
            )}

            {/* Course Syllabus / Modules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Course Curriculum</h2>
                <span className="text-xs text-muted font-medium">
                  {allModules.length} Modules • {allLessons.length} Lessons
                </span>
              </div>

              {allModules.length === 0 ? (
                <Card className="p-6 text-center text-muted text-xs bg-card border-border">
                  No modules published yet for this course.
                </Card>
              ) : (
                <div className="space-y-3">
                  {allModules.map((module, mIdx) => (
                    <Card key={module.documentId || module.id || mIdx} className="bg-card border-border overflow-hidden">
                      <CardHeader className="py-3.5 px-5 bg-surface/50 border-b border-border">
                        <div className="flex items-center justify-between">
                          <CardTitle as="h3" className="text-sm font-bold text-foreground">
                            Module {mIdx + 1}: {module.title}
                          </CardTitle>
                          <span className="text-xs text-muted">
                            {module.lessons?.length || 0} lessons
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 divide-y divide-border">
                        {module.lessons && module.lessons.length > 0 ? (
                          module.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.documentId || lesson.id || lIdx}
                              className="py-3 px-5 flex items-center justify-between text-xs hover:bg-surface/30 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-muted font-medium w-5">{lIdx + 1}.</span>
                                <span className="font-medium text-foreground">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.isFreePreview && (
                                  <Badge variant="highlight" size="sm">
                                    Free Preview
                                  </Badge>
                                )}
                                {lesson.duration && (
                                  <span className="text-muted text-[11px]">{lesson.duration}</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-3 px-5 text-xs text-muted">
                            Lessons in development.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Quizzes Section */}
            {allQuizzes.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="text-base font-bold text-foreground">Evaluations & Quizzes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allQuizzes.map((quiz, qIdx) => (
                    <Card key={quiz.documentId || quiz.id || qIdx} className="p-4 bg-card border-border">
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge variant="surface" size="sm">Quiz {qIdx + 1}</Badge>
                        <span className="text-xs text-muted">Pass: {quiz.passingScore || 80}%</span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{quiz.title}</h4>
                      <p className="text-xs text-muted mt-1">
                        {quiz.questions?.length || 0} Questions • Time Limit: {quiz.timeLimitMinutes || 20} mins
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Enrollment & Price Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="p-6 bg-card border-border space-y-5 shadow-sm">
                {/* Thumbnail Image */}
                {course.thumbnailUrl && (
                  <div className="w-full h-44 rounded-xl overflow-hidden border border-border bg-surface">
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
                    <span className="text-xs text-muted font-medium uppercase tracking-wider">Tuition Fee</span>
                    <div className="text-3xl font-black text-foreground mt-0.5">
                      ৳{Number(course.price || 0).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="highlight" size="sm">
                    Full Lifetime Access
                  </Badge>
                </div>

                {/* Role-Based Enrollment / Access Actions */}
                <div className="pt-2 space-y-3">
                  {!isAuthenticated ? (
                    <div className="space-y-2">
                      <Button
                        href={`/auth/login?redirect=/courses/${encodeURIComponent(slug)}`}
                        variant="primary"
                        size="md"
                        className="w-full font-bold"
                      >
                        Log In to Enroll
                      </Button>
                      <p className="text-center text-[11px] text-muted">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="text-secondary font-semibold hover:underline">
                          Create Free Account
                        </Link>
                      </p>
                    </div>
                  ) : isStudent ? (
                    isEnrolled ? (
                      <div className="space-y-2">
                        <Button
                          href={`/learn/${course.slug || slug}`}
                          variant="primary"
                          size="md"
                          className="w-full font-bold"
                        >
                          ▶ Resume Course Player
                        </Button>
                        <Badge variant="success" size="sm" className="w-full text-center py-1">
                          ✓ Enrolled in this Course
                        </Badge>
                      </div>
                    ) : (
                      <Button
                        onClick={handleStudentEnroll}
                        disabled={isEnrolling}
                        variant="primary"
                        size="md"
                        className="w-full font-bold"
                      >
                        {isEnrolling ? "Enrolling..." : `Enroll Now • ৳${Number(course.price || 0).toLocaleString()}`}
                      </Button>
                    )
                  ) : isStaff ? (
                    <div className="space-y-3 p-3.5 rounded-xl bg-surface border border-border">
                      <div className="flex items-center justify-between">
                        <Badge variant="surface" size="sm" className="font-bold">
                          {role} View
                        </Badge>
                        <span className="text-[11px] text-muted">Staff Access</span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        Only student accounts can enroll in courses. As an authorized <strong>{role}</strong>, you can manage or preview this curriculum from your control center.
                      </p>
                      <div className="flex flex-col gap-2 pt-1">
                        <Button href={dashboardPath} variant="primary" size="sm" className="w-full">
                          Go to {role} Dashboard
                        </Button>
                        <Button href={`/learn/${course.slug || slug}`} variant="outline" size="sm" className="w-full">
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
                      className="w-full font-bold"
                    >
                      Enroll in Course
                    </Button>
                  )}
                </div>

                {/* What's Included Feature List */}
                <div className="pt-4 border-t border-border space-y-2.5 text-xs text-foreground">
                  <span className="font-bold block text-muted uppercase tracking-wider text-[11px]">
                    This Course Includes
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span>
                    <span>{allLessons.length} Full Video Lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span>
                    <span>{allQuizzes.length} Timed Diagnostic Quizzes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span>
                    <span>Direct Access to Instructor Materials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span>
                    <span>CPS Academy Certificate of Completion</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
