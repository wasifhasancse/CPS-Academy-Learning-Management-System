"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function TeacherDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["Instructor", "Admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="highlight" size="sm">
                Instructor Workspace
              </Badge>
              <span className="text-xs text-muted">Authoring & Student Progress Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Instructor Dashboard — {user?.username || "Instructor"}
            </h1>
            <p className="text-sm text-muted">
              Manage your authored courses, organize YouTube video lessons, create quizzes, and monitor enrolled students.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button href="/dashboard/teacher/courses/create" variant="primary" size="md">
              + Create New Course
            </Button>
          </div>
        </div>

        {/* Instructor Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">My Courses</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Courses created under your profile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Enrolled Students</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Students actively studying your classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Quizzes Managed</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Assessments across your curriculum</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Avg Completion</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                --
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Syllabus progression rate</p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Your Authored Courses</h2>
            <Badge variant="surface" size="sm">
              Own Courses Scope Only
            </Badge>
          </div>
          <Card className="p-10 text-center border-dashed border-2">
            <div className="max-w-sm mx-auto space-y-3">
              <h3 className="text-base font-bold text-foreground">No courses authored yet</h3>
              <p className="text-xs text-muted">
                Create your first curriculum module, attach YouTube lesson videos, and build quizzes.
              </p>
              <Button href="/dashboard/teacher/courses/create" variant="primary" size="sm">
                Create First Course
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
