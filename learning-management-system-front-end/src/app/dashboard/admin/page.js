"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="highlight" size="sm">
                Super Admin
              </Badge>
              <span className="text-xs text-muted">Full Platform Control & User Role Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Administration Hub — {user?.username || "Admin"}
            </h1>
            <p className="text-sm text-muted">
              Manage platform users, assign/change user roles, audit financial transactions, and oversee global system health.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button href="/dashboard/admin/users" variant="primary" size="md">
              Manage Users & Roles
            </Button>
          </div>
        </div>

        {/* Admin Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Total Users</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Platform accounts across 4 roles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Instructors</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Active course creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Content Managers</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Curation & editorial staff</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase">Total Revenue</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1">
                $0.00
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Stripe transactions processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Operations */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Administrative Control Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <h3 className="text-base font-bold text-foreground">User & Role Management</h3>
              <p className="text-xs text-muted leading-relaxed">
                Assign and modify user roles (`Admin`, `Content Manager`, `Instructor`, `Student`) and manage account permissions.
              </p>
              <Button href="/dashboard/admin/users" variant="primary" size="sm" className="w-full">
                Open User Manager
              </Button>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-base font-bold text-foreground">Course & Catalog Override</h3>
              <p className="text-xs text-muted leading-relaxed">
                Global view of all courses, instructor assignments, pricing tiers, and direct catalog overrides.
              </p>
              <Button href="/dashboard/admin/courses" variant="surface" size="sm" className="w-full">
                View Global Courses
              </Button>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-base font-bold text-foreground">Stripe & Billing Logs</h3>
              <p className="text-xs text-muted leading-relaxed">
                Inspect webhook event deliveries, student checkout sessions, refunds, and financial audit reports.
              </p>
              <Button href="/dashboard/admin/billing" variant="surface" size="sm" className="w-full">
                View Financial Logs
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
