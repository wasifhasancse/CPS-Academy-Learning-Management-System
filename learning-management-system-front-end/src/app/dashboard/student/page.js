"use client";

import { useStudent } from "@/context/StudentContext";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { GrowthLineChart } from "@/components/dashboard/GrowthLineChart";
import { DistributionDonutChart } from "@/components/dashboard/DistributionDonutChart";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton, DashboardStatsSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function StudentOverviewPage() {
  const {
    stats,
    studentActivities,
    studentSeries,
    enrolledCourses,
    catalogCourses,
    categories,
    isLoading,
  } = useStudent();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Header Banner Skeleton */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="w-48 h-6 rounded-md" />
              <Skeleton className="w-64 h-4 rounded" />
            </div>
          </div>
          <Skeleton className="w-36 h-10 rounded-xl" />
        </div>

        {/* Metric Cards Skeleton */}
        <DashboardStatsSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />

        {/* Charts & Enrolled Course Progress Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="w-44 h-5 rounded-md" />
              <Skeleton className="w-24 h-4 rounded" />
            </div>
            <Skeleton className="w-full h-64 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 p-6 rounded-3xl bg-card border border-border space-y-4">
            <Skeleton className="w-36 h-5 rounded-md" />
            <div className="flex justify-center py-4">
              <Skeleton className="w-44 h-44 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-full h-3.5 rounded" />
              <Skeleton className="w-full h-3.5 rounded" />
            </div>
          </div>
        </div>

        {/* Recent Activity Table Skeleton */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="w-40 h-5 rounded-md" />
            <Skeleton className="w-20 h-4 rounded" />
          </div>
          <TableSkeleton rows={4} columns={5} />
        </div>
      </div>
    );
  }

  // Transform activities into table rows with contextual subroute links
  const tableRows = studentActivities.map((a) => {
    let href = "/dashboard/student/courses";
    if (a.action === "QUIZ_EVALUATION") {
      href = "/dashboard/student/quizzes";
    }
    return {
      id: a.id,
      item: a.title,
      user: a.timestamp,
      category: a.badgeText,
      status: a.action === "COURSE_ENROLLED" ? "Active" : a.badgeText === "PASSED" ? "Completed" : "Pending",
      actionLabel: "View",
      href,
    };
  });

  const activeCourse = enrolledCourses[0];
  const activeCourseProgress = Number(activeCourse?.progressPercentage || 0);
  const isActiveCourseCompleted = activeCourseProgress === 100;

  return (
    <div className="space-y-6">
      {/* Student Study Metrics */}
      <DashboardStatsGrid stats={stats} />

      {/* Continue Learning Callout */}
      {enrolledCourses.length > 0 ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-highlight">
                  CURRENT LEARNING GOAL
                </span>
                {isActiveCourseCompleted && (
                  <Badge variant="highlight" size="sm">
                    ✓ Course Completed
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg mt-1">
                {activeCourse?.title}
              </CardTitle>
            </div>
            <Link href={`/learn/${activeCourse?.slug || activeCourse?.documentId || activeCourse?.id}`}>
              <Button variant={isActiveCourseCompleted ? "outline" : "primary"} size="sm" className="font-bold">
                {isActiveCourseCompleted ? "✓ Review Completed Course" : "Resume Course →"}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted">Syllabus Completion</span>
                <span className={`font-bold ${isActiveCourseCompleted ? "text-primary dark:text-highlight" : "text-foreground"}`}>
                  {activeCourseProgress}%
                </span>
              </div>
              <ProgressBar progress={activeCourseProgress} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-surface p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-foreground">Welcome to CPS Academy!</h3>
              <p className="text-xs text-muted mt-1">
                Explore our competitive programming & engineering courses to start your learning journey.
              </p>
            </div>
            <Link href="/dashboard/student/catalog">
              <Button variant="primary" size="sm">
                Explore Course Catalog
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Analytics Charts Row with Equalized Height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <GrowthLineChart
            title="Study Milestones Trend"
            subtitle="Your course enrollments and quiz checkpoint completions"
            series={studentSeries}
            className="h-full"
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <DistributionDonutChart
            title="Course Tracks by Category"
            subtitle="Categories of your active courses"
            items={enrolledCourses.length > 0 ? enrolledCourses : catalogCourses}
            categories={categories}
            className="h-full"
          />
        </div>
      </div>

      {/* Recent Activity Table */}
      <ActivityTable
        title="Your Learning History"
        subtitle="Chronological log of your enrollments and quiz attempts"
        columns={["EVENT", "DATE", "TYPE", "STATUS", "ACTION"]}
        data={tableRows}
        emptyMessage="No learning activity recorded yet. Enroll in a course to get started!"
      />
    </div>
  );
}
