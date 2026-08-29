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
import Link from "next/link";

export default function StudentOverviewPage() {
  const {
    stats,
    studentActivities,
    enrolledCourses,
    catalogCourses,
    categories,
    isLoading,
  } = useStudent();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-surface rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-surface rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-surface rounded-2xl" />
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

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthLineChart
            title="Study Milestones"
            subtitle="Your course enrollments and quiz completions"
            dataPoints={studentActivities}
            metricLabel="Milestones"
          />
        </div>
        <div>
          <DistributionDonutChart
            title="Course Distribution"
            subtitle="Categories of your enrolled courses"
            items={enrolledCourses.length > 0 ? enrolledCourses : catalogCourses}
            categories={categories}
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
