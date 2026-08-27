"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getRoleDashboardPath } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/**
 * RoleGuard Component
 * @param {Object} props
 * @param {('Admin' | 'Content Manager' | 'Instructor' | 'Student')[]} props.allowedRoles
 * @param {React.ReactNode} props.children
 */
export function RoleGuard({ allowedRoles, children }) {
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary dark:border-highlight border-t-transparent animate-spin" />
        <p className="text-xs text-muted">Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const normalizedUserRole = (role || "Student").toLowerCase().replace(/\s+/g, "");
  const hasAccess = allowedRoles.some(
    (r) => r.toLowerCase().replace(/\s+/g, "") === normalizedUserRole
  );

  if (!hasAccess) {
    const authorizedPath = getRoleDashboardPath(role);

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-sm">
          <CardHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <Badge variant="surface" size="sm" className="mb-2">
              403 Forbidden
            </Badge>
            <CardTitle as="h2" className="text-xl">
              Access Restricted
            </CardTitle>
            <CardDescription>
              Your account role (<strong>{role || "Unknown"}</strong>) does not have permission to view this section.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-xs text-muted leading-relaxed">
              In accordance with platform security policies, access is strictly partitioned by role.
            </p>
            <Button href={authorizedPath} variant="primary" className="w-full">
              Go to My {role || "Student"} Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
