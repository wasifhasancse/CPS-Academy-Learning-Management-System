"use client";

import { useAdmin } from "@/context/AdminContext";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { GrowthLineChart } from "@/components/dashboard/GrowthLineChart";
import { DistributionDonutChart } from "@/components/dashboard/DistributionDonutChart";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
            title="Platform User Registrations Trend"
            subtitle="Real-time cumulative account creation curve"
            dataPoints={adminActivities}
            metricLabel="Users"
            color="primary"
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
        subtitle="Live audit trail of user registrations, courses, and publications"
        activities={adminActivities}
      />
    </div>
  );
}
