"use client";

import { useInstructor } from "@/context/InstructorContext";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { GrowthLineChart } from "@/components/dashboard/GrowthLineChart";
import { DistributionDonutChart } from "@/components/dashboard/DistributionDonutChart";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function InstructorOverviewPage() {
  const {
    stats,
    instructorActivities,
    courses,
    categories,
    isLoading,
    handleOpenAddCourse,
  } = useInstructor();

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
      {/* KPI Grid */}
      <DashboardStatsGrid stats={stats} />

      {/* Quick Access Actions */}
      <Card className="p-4 bg-surface border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-foreground">Teaching Studio Controls</h3>
            <p className="text-xs text-muted">
              Create and manage your assigned course syllabi, video lectures, and MCQ quizzes
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
            + Create New Course Track
          </Button>
        </div>
      </Card>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthLineChart
            title="Student Enrollment Trend in Your Tracks"
            subtitle="Cumulative learner registrations across your courses"
            dataPoints={instructorActivities}
            metricLabel="Enrolled"
            color="primary"
          />
        </div>
        <div>
          <DistributionDonutChart
            title="Your Authored Tracks"
            subtitle="Category breakdown of your courses"
            items={courses}
            categories={categories}
          />
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityTable
        title="Student Learning & Roster Activity"
        subtitle="Live feed of student enrollments and curriculum updates"
        activities={instructorActivities}
      />
    </div>
  );
}
