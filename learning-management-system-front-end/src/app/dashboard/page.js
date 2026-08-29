"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getRoleDashboardPath } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/ui/Spinner";

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
    <LoadingScreen
      title="Accessing CPS Portal..."
      description="Navigating to your role-specific dashboard overview."
      minHeight="min-h-[70vh]"
    />
  );
}
