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

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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

  const totalCompletedLessons = enrolledCourses.reduce((acc, c) => acc + c.completedLessons, 0);
  const totalCourseLessons = enrolledCourses.reduce((acc, c) => acc + c.totalLessons, 0);
  const overallProgressPercent = totalCourseLessons > 0 ? Math.round((totalCompletedLessons / totalCourseLessons) * 100) : 0;

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
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Learner Overview</h2>

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
                  <span className="text-2xl font-extrabold text-foreground">85%</span>
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
                    <Button href={`/learn/${enrolledCourses[0].slug}`} variant="primary" size="md">
                      ▶ Resume Lesson
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
