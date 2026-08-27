"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getRoleDashboardPath } from "@/context/AuthContext";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { role, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login?redirect=/dashboard");
      } else {
        const destination = getRoleDashboardPath(role);
        router.replace(destination);
      }
    }
  }, [isLoading, isAuthenticated, role, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-primary dark:border-highlight border-t-transparent animate-spin" />
      <p className="text-xs text-muted">Redirecting to your dashboard...</p>
    </div>
  );
}
