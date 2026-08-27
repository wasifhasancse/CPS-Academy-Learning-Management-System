"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={["Instructor", "Admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-background text-foreground">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="highlight" size="sm">
                Instructor Workspace
              </Badge>
              <span className="text-xs text-muted">Course, Lesson & Quiz Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Instructor Dashboard
            </h1>
            <p className="text-sm text-muted mt-1">
              Logged in as <strong className="text-foreground">{user?.username || "Instructor"}</strong>. Manage your assigned courses, video lessons, and student progress.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="surface"
              size="sm"
              onClick={() => setIsLessonModalOpen(true)}
              className="border border-border"
            >
              + Add Lesson
            </Button>
            <Button
              type="button"
              variant="surface"
              size="sm"
              onClick={() => setIsQuizModalOpen(true)}
              className="border border-border"
            >
              + Create Quiz
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCourseModalOpen(true)}
            >
              + New Course
            </Button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
