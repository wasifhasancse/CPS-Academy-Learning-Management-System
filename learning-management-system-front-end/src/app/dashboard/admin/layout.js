"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineCreditCard,
  HiOutlineChartBar,
  HiOutlineUser,
} from "react-icons/hi2";

function AdminLayoutShell({ children }) {
  const { totalUsers, totalCourses, totalBlogs } = useAdmin();

  const navItems = [
    { id: "overview", label: "Control Center", icon: <HiOutlineSquares2X2 className="w-4 h-4" />, href: "/dashboard/admin" },
    { id: "users", label: "User Accounts", icon: <HiOutlineUsers className="w-4 h-4" />, href: "/dashboard/admin/users", badge: totalUsers },
    { id: "courses", label: "Course Tracks", icon: <HiOutlineBookOpen className="w-4 h-4" />, href: "/dashboard/admin/courses", badge: totalCourses },
    { id: "curriculum", label: "Curriculum Hub", icon: <HiOutlineAcademicCap className="w-4 h-4" />, href: "/dashboard/admin/curriculum" },
    { id: "blogs", label: "Blog Articles", icon: <HiOutlineDocumentText className="w-4 h-4" />, href: "/dashboard/admin/blogs", badge: totalBlogs },
    { id: "orders", label: "Orders & Invoices", icon: <HiOutlineCreditCard className="w-4 h-4" />, href: "/dashboard/admin/orders" },
    { id: "progress", label: "Student Progress", icon: <HiOutlineChartBar className="w-4 h-4" />, href: "/dashboard/admin/progress" },
    { id: "profile", label: "Profile Settings", icon: <HiOutlineUser className="w-4 h-4" />, href: "/dashboard/admin/profile" },
  ];

  return (
    <DashboardLayout
      roleTitle="CPS Platform Administration"
      subtitle="Global Management Console"
      navItems={navItems}
    >
      {children}
    </DashboardLayout>
  );
}

export default function AdminLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["Admin", "admin"]}>
      <AdminProvider>
        <AdminLayoutShell>{children}</AdminLayoutShell>
      </AdminProvider>
    </RoleGuard>
  );
}
