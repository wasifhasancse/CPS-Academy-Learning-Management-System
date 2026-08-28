"use client";

import { useStudent } from "@/context/StudentContext";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { GrowthLineChart } from "@/components/dashboard/GrowthLineChart";
import { DistributionDonutChart } from "@/components/dashboard/DistributionDonutChart";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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

  return (
    <div className="space-y-6">
      {/* Student Study Metrics */}
      <DashboardStatsGrid stats={stats} />

      {/* Continue Learning Callout */}
      {enrolledCourses.length > 0 ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-highlight">
                CURRENT LEARNING GOAL
              </span>
              <CardTitle className="text-lg mt-1">
                {enrolledCourses[0]?.title}
              </CardTitle>
            </div>
            <Link href={`/courses/${enrolledCourses[0]?.slug || enrolledCourses[0]?.id}`}>
              <Button variant="primary" size="sm">
                Resume Course →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted">Syllabus Completion</span>
                <span className="text-foreground font-bold">
                  {enrolledCourses[0]?.progressPercentage || 0}%
                </span>
              </div>
              <ProgressBar progress={enrolledCourses[0]?.progressPercentage || 0} />
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
            title="Study Milestones & Activity"
            subtitle="Your course enrollments and checkpoint assessments"
            dataPoints={studentActivities}
            metricLabel="Milestones"
            color="primary"
          />
        </div>
        <div>
          <DistributionDonutChart
            title="Active Syllabus Distribution"
            subtitle="Categories of your courses"
            items={enrolledCourses.length > 0 ? enrolledCourses : catalogCourses}
            categories={categories}
          />
        </div>
      </div>

      {/* Recent Activity Table */}
      <ActivityTable
        title="Your Learning History"
        subtitle="Chronological log of your course enrollments and evaluation attempts"
        activities={studentActivities}
      />
    </div>
  );
}
