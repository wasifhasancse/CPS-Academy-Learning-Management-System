"use client";

import { useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock Enrolled Courses
  const [enrolledCourses, setEnrolledCourses] = useState([
    {
      id: 1,
      slug: "competitive-programming-complete-track",
      title: "কম্পিটিটিভ প্রোগ্রামিং পূর্ণাঙ্গ কোর্স",
      category: "Competitive Programming",
      duration: "সময়ঃ ১২ মাস",
      instructor: "Mohaimin",
      completedLessons: 6,
      totalLessons: 10,
      currentLesson: "Binary Search & Monotonic Predicates",
      fee: "৪,০০০ টাকা",
    },
    {
      id: 2,
      slug: "full-stack-asp-net-8",
      title: "ফুল-স্ট্যাক ASP.NET 8 ও মাইক্রোসার্ভিস",
      category: "Software Engineering",
      duration: "সময়ঃ ৮ মাস",
      instructor: "Arafat",
      completedLessons: 3,
      totalLessons: 8,
      currentLesson: "Clean Architecture: CQRS & MediatR",
      fee: "৫,৫০০ টাকা",
    },
  ]);

  // Mock Available Catalog
  const catalogCourses = [
    {
      id: 3,
      slug: "job-interview-prep",
      title: "জব ইন্টারভিউ প্রিপারেশন ও মক টেস্ট",
      category: "Interview Prep",
      duration: "সময়ঃ ৬ মাস",
      instructor: "Mohaimin & Arafat",
      fee: "৬,০০০ টাকা",
      description: "বিডি বিগ টেক ও FAANG-এ সফটওয়্যার ইঞ্জিনিয়ারিং জব ইন্টারভিউ ক্র্যাক করার পূর্ণাঙ্গ রোডম্যাপ।",
      points: ["৮০+ লাইভ ক্লাসেস ও MCQ টেস্ট", "৪০০+ LeetCode ভিডিও সল্যুশন", "মক ইন্টারভিউ"],
    },
  ];

  // Mock Quiz Attempts
  const [quizAttempts, setQuizAttempts] = useState([
    {
      id: 1,
      quizTitle: "Asymptotic Complexity & STL Diagnostic",
      courseTitle: "কম্পিটিটিভ প্রোগ্রামিং পূর্ণাঙ্গ কোর্স",
      date: "2026-08-25",
      score: 90,
      passingScore: 80,
      status: "Passed",
    },
    {
      id: 2,
      quizTitle: "Clean Architecture & Domain Models",
      courseTitle: "ফুল-স্ট্যাক ASP.NET 8 ও মাইক্রোসার্ভিস",
      date: "2026-08-26",
      score: 70,
      passingScore: 75,
      status: "Failed",
    },
  ]);

  const totalCompletedLessons = enrolledCourses.reduce((acc, c) => acc + c.completedLessons, 0);
  const totalCourseLessons = enrolledCourses.reduce((acc, c) => acc + c.totalLessons, 0);
  const overallProgressPercent = totalCourseLessons > 0 ? Math.round((totalCompletedLessons / totalCourseLessons) * 100) : 0;

  const avgQuizScore = quizAttempts.length > 0
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
        subtitle="Welcome back"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">Learner Overview</h2>
              <Button onClick={() => setActiveTab("catalog")} variant="primary" size="sm">
                Explore More Courses
              </Button>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#285A48]/15 text-[#285A48] dark:bg-[#B0E4CC]/15 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{enrolledCourses.length}</span>
                  <span className="text-xs font-semibold text-muted block">Enrolled Classes</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#408A71]/15 text-[#408A71] dark:bg-[#408A71]/25 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{totalCompletedLessons}</span>
                  <span className="text-xs font-semibold text-muted block">Lessons Finished</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#285A48]/15 text-[#285A48] dark:bg-[#B0E4CC]/15 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{overallProgressPercent}%</span>
                  <span className="text-xs font-semibold text-muted block">Overall Progress</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#408A71]/15 text-[#408A71] dark:bg-[#408A71]/25 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{avgQuizScore}%</span>
                  <span className="text-xs font-semibold text-muted block">Avg Quiz Score</span>
                </div>
              </Card>
            </div>

            {/* Continue Learning Callout */}
            {enrolledCourses.length > 0 && (
              <Card className="p-6 bg-card border-border border-l-4 border-l-[#285A48] dark:border-l-[#B0E4CC]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#285A48] dark:text-[#B0E4CC] uppercase tracking-wide">
                      Continue Learning
                    </span>
                    <h3 className="font-extrabold text-lg text-foreground">
                      {enrolledCourses[0].title}
                    </h3>
                    <p className="text-xs text-muted">
                      Next Lesson: <strong className="text-foreground">{enrolledCourses[0].currentLesson}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 hidden sm:block">
                      <ProgressBar
                        value={Math.round((enrolledCourses[0].completedLessons / enrolledCourses[0].totalLessons) * 100)}
                        size="sm"
                        showLabel={true}
                      />
                    </div>
                    <Button href={`/learn/${enrolledCourses[0].slug}`} variant="primary" size="md">
                      ▶ Resume Lesson
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Enrolled Courses Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">My Enrolled Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {enrolledCourses.map((c) => {
                  const percent = Math.round((c.completedLessons / c.totalLessons) * 100);
                  return (
                    <Card key={c.id} className="p-6 bg-card border-border flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="highlight" size="sm">
                            {c.category}
                          </Badge>
                          <span className="text-xs text-muted font-medium">{c.duration}</span>
                        </div>
                        <h4 className="font-extrabold text-base text-foreground">{c.title}</h4>
                        <p className="text-xs text-muted mt-1">Instructor: {c.instructor}</p>

                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-muted">Completion</span>
                            <span className="text-foreground">{percent}%</span>
                          </div>
                          <ProgressBar value={percent} size="sm" />
                          <span className="text-[11px] text-muted block">
                            {c.completedLessons} of {c.totalLessons} lessons completed
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <Button href={`/learn/${c.slug}`} variant="primary" size="sm" className="w-full">
                          ▶ Open Course Player
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY COURSES */}
        {activeTab === "my-courses" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">All Enrolled Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {enrolledCourses.map((c) => {
                const percent = Math.round((c.completedLessons / c.totalLessons) * 100);
                return (
                  <Card key={c.id} className="p-6 bg-card border-border flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="highlight" size="sm">
                          {c.category}
                        </Badge>
                        <Badge variant="surface" size="sm">
                          {c.duration}
                        </Badge>
                      </div>
                      <h3 className="font-extrabold text-base text-foreground">{c.title}</h3>
                      <p className="text-xs text-muted">Instructor: {c.instructor}</p>
                      <div className="space-y-1.5">
                        <ProgressBar value={percent} size="sm" showLabel={true} />
                        <span className="text-[11px] text-muted">
                          {c.completedLessons} of {c.totalLessons} lessons completed
                        </span>
                      </div>
                    </div>
                    <Button href={`/learn/${c.slug}`} variant="primary" size="sm" className="w-full mt-2">
                      ▶ Continue Learning
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: QUIZZES & SCORECARDS */}
        {activeTab === "quizzes" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">My Quiz History & Scorecards</h2>
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
          </div>
        )}

        {/* TAB 4: EXPLORE CATALOG */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Explore CPS Academy Courses</h2>
              <Button href="/courses" variant="outline" size="sm">
                View Full Catalog →
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogCourses.map((c) => (
                <Card key={c.id} className="p-6 bg-card border-border flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="highlight" size="sm">
                        {c.category}
                      </Badge>
                      <Badge variant="surface" size="sm">
                        {c.duration}
                      </Badge>
                    </div>
                    <h3 className="font-extrabold text-lg text-foreground">{c.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{c.description}</p>
                    <ul className="space-y-2 pt-2 border-t border-dashed border-border">
                      {c.points.map((pt, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-muted">
                          <span className="w-4 h-4 rounded-full bg-[#285A48]/15 text-[#285A48] dark:text-[#B0E4CC] flex items-center justify-center font-bold text-[10px]">
                            ✓
                          </span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-muted block">Course Fee</span>
                      <span className="font-extrabold text-base text-foreground">{c.fee}</span>
                    </div>
                    <Button href={`/courses/${c.slug}`} variant="primary" size="sm">
                      Enroll Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
