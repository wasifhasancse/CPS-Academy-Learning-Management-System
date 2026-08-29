"use client";

import { useAdmin } from "@/context/AdminContext";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { GrowthLineChart } from "@/components/dashboard/GrowthLineChart";
import { DistributionDonutChart } from "@/components/dashboard/DistributionDonutChart";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton, DashboardStatsSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function AdminOverviewPage() {
  const {
    stats,
    adminActivities,
    courses,
    categories,
    isLoading,
    handleOpenAddCourse,
    handleOpenAddBlog,
  } = useAdmin();

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
  const tableRows = adminActivities.map((a) => {
    let href = "/dashboard/admin/courses";
    if (a.action === "USER_REGISTRATION") {
      href = "/dashboard/admin/users";
    } else if (a.action === "COURSE_PUBLISHED") {
      href = "/dashboard/admin/curriculum";
    }
    return {
      id: a.id,
      item: a.title,
      user: a.timestamp,
      category: a.badgeText,
      status: a.action === "USER_REGISTRATION" ? "Active" : "Published",
      actionLabel: "View",
      href,
    };
  });

  return (
    <div className="space-y-6">
      {/* Platform KPI Grid */}
      <DashboardStatsGrid stats={stats} />

      {/* Quick Access Actions */}
      <Card className="p-4 bg-surface border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-foreground">Global Control Panel</h3>
            <p className="text-xs text-muted">
              Quickly perform platform actions or inspect role-based records
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
              + New Course
            </Button>
            <Button variant="secondary" size="sm" onClick={handleOpenAddBlog}>
              + Write Blog
            </Button>
            <Link href="/dashboard/admin/users">
              <Button variant="surface" size="sm">
                Manage Roles
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthLineChart
            title="Platform Activity Trend"
            subtitle="Cumulative user registrations and course publications"
            dataPoints={adminActivities}
            metricLabel="Events"
          />
        </div>
        <div>
          <DistributionDonutChart
            title="Courses by Category"
            subtitle="Platform course track distribution"
            items={courses}
            categories={categories}
          />
        </div>
      </div>

      {/* Live Activity Feed */}
      <ActivityTable
        title="Recent Platform Activity"
        subtitle="Live audit trail of user registrations and course publications"
        columns={["EVENT", "DATE", "TYPE", "STATUS", "ACTION"]}
        data={tableRows}
        emptyMessage="No platform activity recorded yet."
      />
    </div>
  );
}
