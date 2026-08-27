"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["Student", "Admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="highlight" size="sm">
                Student Portal
              </Badge>
              <span className="text-xs text-muted">Learner Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome back, {user?.username || "Student"}
            </h1>
            <p className="text-sm text-muted">
              Continue your courses, track your progress, and practice for upcoming contest quizzes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button href="/courses" variant="primary" size="md">
              Browse More Courses
            </Button>
          </div>
        </div>

        {/* Learning Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Enrolled Courses</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Active classes you are currently studying</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Quizzes Completed</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Evaluated assessments and submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Avg Passing Score</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                --
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Overall performance across quiz attempts</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Enrolled Courses */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">My Enrolled Courses</h2>
          <Card className="p-10 text-center border-dashed border-2">
            <div className="max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface text-muted flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-foreground">No active enrollments yet</h3>
              <p className="text-xs text-muted">
                Explore our catalog of structured competitive programming and software engineering courses.
              </p>
              <Button href="/courses" variant="primary" size="sm">
                Explore Catalog
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
