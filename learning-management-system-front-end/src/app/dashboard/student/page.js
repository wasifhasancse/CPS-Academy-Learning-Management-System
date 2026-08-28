"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { CourseCard } from "@/components/courses/CourseCard";
import { api } from "@/lib/api";

export default function StudentDashboardPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudentData = useCallback(async () => {
    if (!token || !user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [enrollRes, quizRes, courseRes] = await Promise.all([
        // 1. Fetch live enrolled courses
        api
          .get(
            `/enrollments?filters[student][id][$eq]=${user.id}&populate[course][populate]=modules.lessons&populate[course][populate]=category&populate[course][populate]=instructor`,
            { token }
          )
          .catch(() => null),

        // 2. Fetch live quiz attempts
        api
          .get(
            `/quiz-attempts?filters[student][id][$eq]=${user.id}&populate[quiz][populate]=course&sort=createdAt:desc`,
            { token }
          )
          .catch(() => null),

        // 3. Fetch catalog courses for explore tab
        api
          .get(
            `/courses?populate[modules][populate]=lessons&populate[quizzes]=*&populate[category]=*&populate[instructor]=*`
          )
          .catch(() => null),
      ]);

      // Normalize Enrollments
      const enrollList = Array.isArray(enrollRes?.data) ? enrollRes.data : [];
      const formattedEnrollments = enrollList
        .map((enroll) => {
          const c = enroll.course;
          if (!c) return null;
          const allLessons = c.modules?.flatMap((m) => m.lessons || []) || [];
          return {
            id: c.documentId || c.id,
            enrollmentId: enroll.documentId || enroll.id,
            slug: c.slug || "course",
            title: c.title,
            category: c.category?.name || "Track",
            difficulty: c.difficulty || "All Levels",
            instructor:
              c.instructor?.username ||
              c.instructor?.name ||
              (typeof c.instructor === "string" ? c.instructor : "CPS Instructor"),
            completedLessons: 0, // dynamic progress
            totalLessons: allLessons.length,
            currentLesson: allLessons[0]?.title || "Course Introduction",
            price: c.price || 0,
          };
        })
        .filter(Boolean);

      setEnrolledCourses(formattedEnrollments);

      // Normalize Quiz Attempts
      const quizList = Array.isArray(quizRes?.data) ? quizRes.data : [];
      const formattedAttempts = quizList.map((attempt) => ({
        id: attempt.documentId || attempt.id,
        quizTitle: attempt.quiz?.title || "Course Diagnostic Quiz",
        courseTitle: attempt.quiz?.course?.title || "CPS Academy Track",
        date: attempt.submittedAt || attempt.createdAt
          ? new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently",
        score: Number(attempt.score || 0),
        status: attempt.passed ? "Passed" : "Failed",
      }));

      setQuizAttempts(formattedAttempts);

      // Normalize Catalog
      if (Array.isArray(courseRes?.data)) {
        setCatalogCourses(courseRes.data);
      }
    } catch (err) {
      console.warn("Could not load student dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  const totalCompletedLessons = enrolledCourses.reduce((acc, c) => acc + c.completedLessons, 0);
  const totalCourseLessons = enrolledCourses.reduce((acc, c) => acc + c.totalLessons, 0);
  const overallProgressPercent =
    totalCourseLessons > 0 ? Math.round((totalCompletedLessons / totalCourseLessons) * 100) : 0;

  const avgQuizScore =
    quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + q.score, 0) / quizAttempts.length)
      : "--";

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "my-courses",
      label: "My Enrolled Courses",
      badge: enrolledCourses.length,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "quizzes",
      label: "Quiz Scorecards",
      badge: quizAttempts.length > 0 ? quizAttempts.length : undefined,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: "catalog",
      label: "Explore Courses",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={["Student", "Admin"]}>
      <DashboardLayout
        roleTitle="Student Learning Portal"
        subtitle="Track enrolled courses, video progress, and timed quiz scorecards"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {isLoading ? (
          <div className="p-12 text-center text-muted text-sm animate-pulse">
            Loading your learning records from Neon PostgreSQL...
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Welcome back, {user?.username}</h2>
                    <p className="text-xs text-muted">Here is a live summary of your active enrollments and evaluation metrics.</p>
                  </div>
                  <Button onClick={() => setActiveTab("catalog")} variant="primary" size="sm">
                    Explore More Courses
                  </Button>
                </div>

                {/* Metric KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                  <Card className="p-5 flex items-center gap-4 bg-card border-border">
                    <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary dark:bg-highlight/15 dark:text-highlight flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold text-foreground">{enrolledCourses.length}</span>
                      <span className="text-xs font-semibold text-muted block">Enrolled Courses</span>
                    </div>
                  </Card>

                  <Card className="p-5 flex items-center gap-4 bg-card border-border">
                    <div className="w-11 h-11 rounded-xl bg-secondary/15 text-secondary dark:text-highlight flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold text-foreground">{totalCourseLessons}</span>
                      <span className="text-xs font-semibold text-muted block">Total Lessons</span>
                    </div>
                  </Card>

                  <Card className="p-5 flex items-center gap-4 bg-card border-border">
                    <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary dark:bg-highlight/15 dark:text-highlight flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold text-foreground">{overallProgressPercent}%</span>
                      <span className="text-xs font-semibold text-muted block">Active Progress</span>
                    </div>
                  </Card>

                  <Card className="p-5 flex items-center gap-4 bg-card border-border">
                    <div className="w-11 h-11 rounded-xl bg-secondary/15 text-secondary dark:text-highlight flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold text-foreground">{avgQuizScore}{avgQuizScore !== "--" ? "%" : ""}</span>
                      <span className="text-xs font-semibold text-muted block">Avg Quiz Score</span>
                    </div>
                  </Card>
                </div>

                {/* Continue Learning Callout */}
                {enrolledCourses.length > 0 ? (
                  <Card className="p-6 bg-card border-border border-l-4 border-l-primary dark:border-l-highlight">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-primary dark:text-highlight uppercase tracking-wide">
                          Continue Learning
                        </span>
                        <h3 className="font-extrabold text-lg text-foreground">
                          {enrolledCourses[0].title}
                        </h3>
                        <p className="text-xs text-muted">
                          Next Up: <strong className="text-foreground">{enrolledCourses[0].currentLesson}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button href={`/learn/${enrolledCourses[0].slug}`} variant="primary" size="md">
                          ▶ Open Course Player
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 text-center bg-card border-border space-y-3">
                    <p className="text-sm text-muted">
                      You are not currently enrolled in any courses. Explore our curated tracks to begin learning!
                    </p>
                    <Button onClick={() => setActiveTab("catalog")} variant="primary" size="sm">
                      Browse Course Catalog
                    </Button>
                  </Card>
                )}

                {/* Enrolled Courses Grid */}
                {enrolledCourses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-foreground">My Enrolled Courses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {enrolledCourses.map((c) => (
                        <Card key={c.id} className="p-6 bg-card border-border flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <Badge variant="highlight" size="sm">
                                {c.category}
                              </Badge>
                              <Badge variant="surface" size="sm">
                                {c.difficulty}
                              </Badge>
                            </div>
                            <h4 className="font-extrabold text-base text-foreground">{c.title}</h4>
                            <p className="text-xs text-muted mt-1">Instructor: {c.instructor}</p>

                            <div className="mt-4 space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-muted">Curriculum</span>
                                <span className="text-foreground">{c.totalLessons} Lessons</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-border flex items-center justify-between">
                            <Button href={`/learn/${c.slug}`} variant="primary" size="sm" className="w-full">
                              ▶ Open Course Player
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MY COURSES */}
            {activeTab === "my-courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">All Enrolled Courses</h2>
                  <Button href="/courses" variant="outline" size="sm">
                    + Explore More
                  </Button>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="p-16 text-center text-muted text-sm border border-dashed border-border rounded-xl">
                    No active enrollments found. Browse the catalog to enroll in your first course.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {enrolledCourses.map((c) => (
                      <Card key={c.id} className="p-6 bg-card border-border flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="highlight" size="sm">
                              {c.category}
                            </Badge>
                            <Badge variant="surface" size="sm">
                              {c.difficulty}
                            </Badge>
                          </div>
                          <h3 className="font-extrabold text-base text-foreground">{c.title}</h3>
                          <p className="text-xs text-muted">Instructor: {c.instructor}</p>
                          <span className="text-xs text-muted block">
                            {c.totalLessons} Lessons Available
                          </span>
                        </div>
                        <Button href={`/learn/${c.slug}`} variant="primary" size="sm" className="w-full mt-2">
                          ▶ Continue Learning
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: QUIZZES & SCORECARDS */}
            {activeTab === "quizzes" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">My Quiz History & Scorecards</h2>
                {quizAttempts.length === 0 ? (
                  <div className="p-16 text-center text-muted text-sm border border-dashed border-border rounded-xl">
                    You have not taken any timed quiz evaluations yet. Completed attempts will appear here.
                  </div>
                ) : (
                  <Card className="overflow-hidden border-border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Quiz Name</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead className="text-right">Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quizAttempts.map((q) => (
                          <TableRow key={q.id}>
                            <TableCell className="font-bold text-xs text-foreground">{q.quizTitle}</TableCell>
                            <TableCell className="text-xs text-muted">{q.courseTitle}</TableCell>
                            <TableCell className="text-xs text-muted">{q.date}</TableCell>
                            <TableCell className="text-xs font-extrabold text-foreground">{q.score}%</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={q.status === "Passed" ? "success" : "danger"} size="sm">
                                {q.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </div>
            )}

            {/* TAB 4: EXPLORE CATALOG */}
            {activeTab === "catalog" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Explore CPS Academy Courses</h2>
                  <Button href="/courses" variant="outline" size="sm">
                    View Full Catalog Page →
                  </Button>
                </div>

                {catalogCourses.length === 0 ? (
                  <div className="p-16 text-center text-muted text-sm border border-dashed border-border rounded-xl">
                    No courses available in catalog.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catalogCourses.map((course) => (
                      <CourseCard key={course.documentId || course.id} course={course} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
