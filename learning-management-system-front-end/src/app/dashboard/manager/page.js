"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ManagerDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["Content Manager", "Admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="highlight" size="sm">
                Content Manager Portal
              </Badge>
              <span className="text-xs text-muted">Platform Content Library & Moderation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Content Management — {user?.username || "Manager"}
            </h1>
            <p className="text-sm text-muted">
              Curate, edit, and organize all courses, categories, lesson modules, quizzes, and publish blog articles across CPS Academy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button href="/dashboard/manager/courses/create" variant="primary" size="md">
              + Add New Course
            </Button>
            <Button href="/dashboard/manager/blogs/create" variant="outline" size="md">
              + Write Blog Post
            </Button>
          </div>
        </div>

        {/* Manager Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Global Courses</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                4
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Total courses across all categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Pending Reviews</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Teacher drafts awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Taxonomies</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                4
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Active course categories & tags</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Blog Articles</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Published engineering posts</p>
            </CardContent>
          </Card>
        </div>

        {/* Global Content Management Table Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Content Library Oversight</h2>
            <Badge variant="surface" size="sm">
              All Courses Scope
            </Badge>
          </div>
          <Card className="p-6">
            <p className="text-xs text-muted leading-relaxed mb-4">
              Content Managers have full authorization to manage all course assets, curriculum modules, and blog posts. User role assignments are strictly restricted to Administrators.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/dashboard/manager/courses" variant="surface" size="sm">
                Manage All Courses →
              </Button>
              <Button href="/dashboard/manager/categories" variant="surface" size="sm">
                Manage Categories →
              </Button>
              <Button href="/dashboard/manager/blogs" variant="surface" size="sm">
                Manage Blog Posts →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
