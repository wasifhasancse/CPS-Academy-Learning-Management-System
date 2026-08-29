"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ManagerProvider, useManager } from "@/context/ManagerContext";
import {
  HiOutlineSquares2X2,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlinePencilSquare,
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlineUser,
} from "react-icons/hi2";

function ManagerLayoutShell({ children }) {
  const { totalCourses, totalBlogs } = useManager();

  const navItems = [
    { id: "overview", label: "Studio Overview", icon: <HiOutlineSquares2X2 className="w-4 h-4" />, href: "/dashboard/manager" },
    { id: "courses", label: "Course Tracks", icon: <HiOutlineBookOpen className="w-4 h-4" />, href: "/dashboard/manager/courses", badge: totalCourses },
    { id: "curriculum", label: "Curriculum Hub", icon: <HiOutlineAcademicCap className="w-4 h-4" />, href: "/dashboard/manager/curriculum" },
    { id: "blogs", label: "Blog Publisher", icon: <HiOutlinePencilSquare className="w-4 h-4" />, href: "/dashboard/manager/blogs", badge: totalBlogs },
    { id: "orders", label: "Orders & Invoices", icon: <HiOutlineCreditCard className="w-4 h-4" />, href: "/dashboard/manager/orders" },
    { id: "progress", label: "Student Progress", icon: <HiOutlineChartBar className="w-4 h-4" />, href: "/dashboard/manager/progress" },
    { id: "profile", label: "My Profile", icon: <HiOutlineUser className="w-4 h-4" />, href: "/dashboard/manager/profile" },
  ];

  return (
    <DashboardLayout
      roleTitle="Content Manager Studio"
      subtitle="Curriculum Hub & Publishing"
      navItems={navItems}
    >
      {children}
    </DashboardLayout>
  );
}

export default function ManagerLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["Content Manager", "content_manager", "Admin", "admin"]}>
      <ManagerProvider>
        <ManagerLayoutShell>{children}</ManagerLayoutShell>
      </ManagerProvider>
    </RoleGuard>
  );
}
