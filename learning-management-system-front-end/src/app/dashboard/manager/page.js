"use client";

import { useManager } from "@/context/ManagerContext";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { GrowthLineChart } from "@/components/dashboard/GrowthLineChart";
import { DistributionDonutChart } from "@/components/dashboard/DistributionDonutChart";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ManagerOverviewPage() {
  const {
    stats,
    managerActivities,
    courses,
    categories,
    isLoading,
    handleOpenAddCourse,
    handleOpenAddBlog,
  } = useManager();

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
  const tableRows = managerActivities.map((a) => {
    let href = "/dashboard/manager/curriculum";
    if (a.action === "BLOG_SAVED") {
      href = "/dashboard/manager/blogs";
    }
    return {
      id: a.id,
      item: a.title,
      user: a.timestamp,
      category: a.badgeText,
      status: a.action === "COURSE_PUBLISHED" ? "Published" : "Updated",
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthLineChart
            title="Content Publishing Trend"
            subtitle="Recent course and article publication activity"
            dataPoints={managerActivities}
            metricLabel="Publications"
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
        title="Content Management Activity"
        subtitle="Recent syllabus modifications, quiz additions, and article publishing"
        columns={["EVENT", "DATE", "TYPE", "STATUS", "ACTION"]}
        data={tableRows}
        emptyMessage="No content activity recorded yet."
      />
    </div>
  );
}
