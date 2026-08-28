"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth, getRoleDashboardPath } from "@/context/AuthContext";

export function ProfileDropdown() {
  const { user, role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dashboardPath = getRoleDashboardPath(role);

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

  const displayName = user.name || user.username || "Learner";
  const displayEmail = user.email || `${user.username || "student"}@cpsacademy.io`;
  const avatarUrl = user.avatarUrl || user.avatar?.url || null;
  const initial = (displayName[0] || "U").toUpperCase();

  // Role-specific menu items
  const menuItems = [
    {
      label: "Dashboard & Profile",
      href: dashboardPath,
      icon: (
        <svg className="w-4 h-4 text-muted group-hover:text-primary dark:group-hover:text-highlight transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      label: role === "Student" ? "My Enrolled Courses" : "Manage Courses",
      href: role === "Student" ? "/dashboard/student?tab=my-courses" : dashboardPath,
      icon: (
        <svg className="w-4 h-4 text-muted group-hover:text-primary dark:group-hover:text-highlight transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: role === "Student" ? "Quiz Scorecards" : "Curriculum & Assessments",
      href: role === "Student" ? "/dashboard/student?tab=quizzes" : dashboardPath,
      icon: (
        <svg className="w-4 h-4 text-muted group-hover:text-primary dark:group-hover:text-highlight transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "Account Settings",
      href: dashboardPath,
      icon: (
        <svg className="w-4 h-4 text-muted group-hover:text-primary dark:group-hover:text-highlight transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar Profile Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-surface hover:bg-surface/80 border border-border text-foreground transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-secondary/50"
      >
        {/* User Avatar Circle */}
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/20 text-primary dark:bg-highlight/20 dark:text-highlight flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-border">
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-card border border-border shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header User Card */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-surface/70 border border-border/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary dark:bg-highlight/20 dark:text-highlight flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-border">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-foreground truncate">{displayName}</span>
              <span className="text-[11px] text-muted truncate">{displayEmail}</span>
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
                className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface hover:text-primary dark:hover:text-highlight transition-colors"
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
            <svg className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
