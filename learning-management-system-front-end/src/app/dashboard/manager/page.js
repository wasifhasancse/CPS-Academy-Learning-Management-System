"use client";

import { useManager } from "@/context/ManagerContext";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { GrowthLineChart } from "@/components/dashboard/GrowthLineChart";
import { DistributionDonutChart } from "@/components/dashboard/DistributionDonutChart";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton, DashboardStatsSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function ManagerOverviewPage() {
  const {
    stats,
    managerActivities,
    managerSeries,
    courses,
    categories,
    isLoading,
    handleOpenAddCourse,
    handleOpenAddBlog,
  } = useManager();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Header Banner Skeleton */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-56 h-6 rounded-md" />
            <Skeleton className="w-72 h-4 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-28 h-10 rounded-xl" />
            <Skeleton className="w-28 h-10 rounded-xl" />
          </div>
        </div>

        {/* Metric Cards Skeleton */}
        <DashboardStatsSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />

        {/* Charts Skeleton */}
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
  const tableRows = managerActivities.map((a) => {
    let href = "/dashboard/manager/curriculum";
    if (a.action === "BLOG_SAVED") {
      href = "/dashboard/manager/blogs";
    } else if (a.action === "STUDENT_ENROLLED") {
      href = "/dashboard/manager/progress";
    }
    return {
      id: a.id,
      item: a.title,
      user: a.timestamp,
      category: a.badgeText,
      status:
        a.action === "STUDENT_ENROLLED"
          ? "Enrolled"
          : a.action === "COURSE_PUBLISHED"
          ? "Published"
          : "Active",
      actionLabel: "View",
      href,
    };
  });

  return (
    <div className="space-y-6">
      {/* Studio KPI Grid */}
      <DashboardStatsGrid stats={stats} />

      {/* Quick Access Actions */}
      <Card className="p-4 bg-surface border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-foreground">Content Operations Panel</h3>
            <p className="text-xs text-muted">
              Create curriculum tracks, manage video syllabi, and publish technical guides
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
              + New Course
            </Button>
            <Button variant="secondary" size="sm" onClick={handleOpenAddBlog}>
              + Write Blog
            </Button>
          </div>
        </div>
      </Card>

      {/* Analytics Charts Row with Equalized Height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <GrowthLineChart
            title="Content Activity Trend"
            subtitle="Curriculum updates, article publishing, and student enrollments"
            series={managerSeries}
            className="h-full"
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <DistributionDonutChart
            title="Courses by Category"
            subtitle="Platform course track distribution"
            items={courses}
            categories={categories}
            className="h-full"
          />
        </div>
      </div>

      {/* Live Activity Feed */}
      <ActivityTable
        title="Content Management Activity"
        subtitle="Recent syllabus modifications, quiz additions, and article publishing"
        columns={["EVENT", "DATE", "TYPE", "STATUS", "ACTION"]}
        data={tableRows}
        emptyMessage="No content activity recorded yet."
      />
    </div>
  );
}
