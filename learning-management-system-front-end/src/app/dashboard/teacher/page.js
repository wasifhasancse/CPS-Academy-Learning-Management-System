"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";

export default function TeacherDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["Instructor", "Admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
      </div>
    </RoleGuard>
  );
}
