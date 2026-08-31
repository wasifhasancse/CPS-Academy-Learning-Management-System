"use client";

import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    HiOutlineAcademicCap,
    HiOutlineArrowLeftOnRectangle,
    HiOutlineBookOpen,
    HiOutlineChartBar,
    HiOutlineClipboardDocumentCheck,
    HiOutlineCog6Tooth,
    HiOutlineDocumentText,
    HiOutlineHome,
    HiOutlineReceiptPercent,
    HiOutlineShieldCheck,
    HiOutlineUsers,
} from "react-icons/hi2";

export function ProfileDropdown() {
  const { user, role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const rawRoleStr = (role || user?.role?.name || user?.role?.type || "student")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  const displayName = user.name || user.username || "CPS User";
  const displayEmail =
    user.email || `${user.username || "student"}@cpsacademy.io`;
  const avatarUrl = user.avatarUrl || user.avatar?.url || null;
  const initial = (displayName[0] || "U").toUpperCase();

  // Role resolution
  const isInstructor = rawRoleStr.includes("instructor");
  const isManager =
    rawRoleStr.includes("contentmanager") || rawRoleStr.includes("manager");
  const isAdmin = rawRoleStr.includes("admin");
  const isStudent = !isInstructor && !isManager && !isAdmin;

  const roleLabel = isAdmin
    ? "ADMIN"
    : isManager
      ? "CONTENT MANAGER"
      : isInstructor
        ? "INSTRUCTOR"
        : "STUDENT";

  // Build role-specific menu items with exact Next.js App Router subroutes
  let menuItems = [];

  if (isStudent) {
    menuItems = [
      {
        label: "Study Overview",
        href: "/dashboard/student",
        icon: (
          <HiOutlineHome className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "My Courses",
        href: "/dashboard/student/courses",
        icon: (
          <HiOutlineBookOpen className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Quiz Scorecards",
        href: "/dashboard/student/quizzes",
        icon: (
          <HiOutlineClipboardDocumentCheck className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Purchase Receipts",
        href: "/dashboard/student/orders",
        icon: (
          <HiOutlineReceiptPercent className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Profile & Settings",
        href: "/dashboard/student/profile",
        icon: (
          <HiOutlineCog6Tooth className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
    ];
  } else if (isInstructor) {
    menuItems = [
      {
        label: "Teaching Overview",
        href: "/dashboard/instructor",
        icon: (
          <HiOutlineHome className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "My Authored Courses",
        href: "/dashboard/instructor/courses",
        icon: (
          <HiOutlineBookOpen className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Curriculum Hub",
        href: "/dashboard/instructor/curriculum",
        icon: (
          <HiOutlineAcademicCap className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Student Roster & Progress",
        href: "/dashboard/instructor/progress",
        icon: (
          <HiOutlineUsers className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Sales & Invoices",
        href: "/dashboard/instructor/orders",
        icon: (
          <HiOutlineReceiptPercent className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Profile & Settings",
        href: "/dashboard/instructor/profile",
        icon: (
          <HiOutlineCog6Tooth className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
    ];
  } else if (isManager) {
    menuItems = [
      {
        label: "Management Console",
        href: "/dashboard/manager",
        icon: (
          <HiOutlineHome className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Course Catalog",
        href: "/dashboard/manager/courses",
        icon: (
          <HiOutlineBookOpen className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Curriculum Builder",
        href: "/dashboard/manager/curriculum",
        icon: (
          <HiOutlineAcademicCap className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Student Progress Roster",
        href: "/dashboard/manager/progress",
        icon: (
          <HiOutlineChartBar className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Manage Blog Posts",
        href: "/dashboard/manager/blogs",
        icon: (
          <HiOutlineDocumentText className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Orders & Revenue",
        href: "/dashboard/manager/orders",
        icon: (
          <HiOutlineReceiptPercent className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Profile & Settings",
        href: "/dashboard/manager/profile",
        icon: (
          <HiOutlineCog6Tooth className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
    ];
  } else if (isAdmin) {
    menuItems = [
      {
        label: "Admin Console",
        href: "/dashboard/admin",
        icon: (
          <HiOutlineShieldCheck className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Manage Users & Roles",
        href: "/dashboard/admin/users",
        icon: (
          <HiOutlineUsers className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Global Courses",
        href: "/dashboard/admin/courses",
        icon: (
          <HiOutlineBookOpen className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Curriculum Hub",
        href: "/dashboard/admin/curriculum",
        icon: (
          <HiOutlineAcademicCap className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Student Progress Analytics",
        href: "/dashboard/admin/progress",
        icon: (
          <HiOutlineChartBar className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Platform Blog Articles",
        href: "/dashboard/admin/blogs",
        icon: (
          <HiOutlineDocumentText className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Orders & Invoices",
        href: "/dashboard/admin/orders",
        icon: (
          <HiOutlineReceiptPercent className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
      {
        label: "Profile & Security",
        href: "/dashboard/admin/profile",
        icon: (
          <HiOutlineCog6Tooth className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
        ),
      },
    ];
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar Profile Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-surface hover:bg-surface-hover dark:hover:text-[#E7F8EE] border border-border text-foreground transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-secondary/50"
      >
        {/* User Avatar Circle */}
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/20 text-primary dark:bg-highlight/20 dark:text-highlight flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-border">
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        {/* User Name */}
        <span className="text-xs font-semibold text-foreground max-w-[100px] sm:max-w-[120px] truncate">
          {displayName}
        </span>

        {/* Chevron Icon */}
        <svg
          className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Floating Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-card border border-border shadow-1 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header User Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-border/60">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary dark:bg-highlight/20 dark:text-highlight flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-border">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-foreground truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-muted truncate">
                {displayEmail}
              </span>
              <div className="mt-1">
                <Badge
                  variant="primary"
                  size="sm"
                  className="text-[9px] px-1.5 py-0"
                >
                  {roleLabel}
                </Badge>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border my-2.5" />

          {/* Navigation Links */}
          <div className="space-y-1">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-[#E7F8EE]/40 hover:text-[#309255] dark:hover:bg-surface-hover dark:hover:text-[#E7F8EE] transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-border my-2.5" />

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 w-full transition-colors cursor-pointer"
          >
            <HiOutlineArrowLeftOnRectangle className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
