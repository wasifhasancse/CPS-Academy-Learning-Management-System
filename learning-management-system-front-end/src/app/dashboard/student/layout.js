"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentProvider, useStudent } from "@/context/StudentContext";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCreditCard,
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
} from "react-icons/hi2";

function StudentLayoutShell({ children }) {
  const { enrolledCourses, quizAttempts } = useStudent();

  const navItems = [
    { id: "overview", label: "My Overview", icon: <HiOutlineHome className="w-4 h-4" />, href: "/dashboard/student" },
    { id: "courses", label: "My Courses", icon: <HiOutlineBookOpen className="w-4 h-4" />, href: "/dashboard/student/courses", badge: enrolledCourses.length },
    { id: "quizzes", label: "Quiz Scorecards", icon: <HiOutlineClipboardDocumentCheck className="w-4 h-4" />, href: "/dashboard/student/quizzes", badge: quizAttempts.length },
    { id: "orders", label: "Purchase Receipts", icon: <HiOutlineCreditCard className="w-4 h-4" />, href: "/dashboard/student/orders" },
    { id: "catalog", label: "Explore Catalog", icon: <HiOutlineMagnifyingGlass className="w-4 h-4" />, href: "/dashboard/student/catalog" },
    { id: "profile", label: "Profile & Security", icon: <HiOutlineUser className="w-4 h-4" />, href: "/dashboard/student/profile" },
  ];

  return (
    <DashboardLayout
      roleTitle="Student Learning Portal"
      subtitle="Study Center & Progress"
      navItems={navItems}
    >
      {children}
    </DashboardLayout>
  );
}

export default function StudentLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["Student", "student", "Admin", "admin", "Instructor", "instructor", "Content Manager", "content_manager"]}>
      <StudentProvider>
        <StudentLayoutShell>{children}</StudentLayoutShell>
      </StudentProvider>
    </RoleGuard>
  );
}
