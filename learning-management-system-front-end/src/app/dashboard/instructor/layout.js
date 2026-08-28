"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InstructorProvider, useInstructor } from "@/context/InstructorContext";
import {
  HiOutlineSquares2X2,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineUser,
} from "react-icons/hi2";

function InstructorLayoutShell({ children }) {
  const { totalCourses, totalStudents } = useInstructor();

  const navItems = [
    { id: "overview", label: "Overview", icon: <HiOutlineSquares2X2 className="w-4 h-4" />, href: "/dashboard/instructor" },
    { id: "courses", label: "My Courses", icon: <HiOutlineBookOpen className="w-4 h-4" />, href: "/dashboard/instructor/courses", badge: totalCourses },
    { id: "curriculum", label: "Curriculum Hub", icon: <HiOutlineAcademicCap className="w-4 h-4" />, href: "/dashboard/instructor/curriculum" },
    { id: "progress", label: "Student Roster", icon: <HiOutlineUsers className="w-4 h-4" />, href: "/dashboard/instructor/progress", badge: totalStudents },
    { id: "profile", label: "My Profile", icon: <HiOutlineUser className="w-4 h-4" />, href: "/dashboard/instructor/profile" },
  ];

  return (
    <DashboardLayout
      roleTitle="Instructor Studio"
      subtitle="Teaching & Curricula Console"
      navItems={navItems}
    >
      {children}
    </DashboardLayout>
  );
}

export default function InstructorLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["Instructor", "instructor", "Admin", "admin"]}>
      <InstructorProvider>
        <InstructorLayoutShell>{children}</InstructorLayoutShell>
      </InstructorProvider>
    </RoleGuard>
  );
}
