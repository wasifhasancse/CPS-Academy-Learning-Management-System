"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
  HiOutlineSquares2X2,
  HiOutlineChevronRight,
  HiOutlineUserCircle,
} from "react-icons/hi2";

export function DashboardLayout({
  roleTitle = "Administrative Console",
  subtitle = "Overview",
  navItems = [],
  activeTab,
  onTabChange,
  extraSidebarAction,
  children,
}) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const displayRole = (role || "Student").toUpperCase();
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full bg-background text-foreground transition-colors min-h-[calc(100vh-4rem)]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0 bg-card border border-border rounded-2xl p-4 flex flex-col gap-4 lg:sticky lg:top-24 shadow-1">
            {/* User Profile Card */}
            <div className="p-3.5 rounded-xl bg-surface border border-border/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/15 dark:text-[#E7F8EE] border border-[#309255]/25 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                {user?.username ? user.username.charAt(0).toUpperCase() : <HiOutlineShieldCheck className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-sm text-foreground truncate block leading-tight">
                  {user?.username || "User"}
                </span>
                <span className="text-[10px] font-black tracking-wider text-[#309255] dark:text-[#E7F8EE] uppercase truncate block mt-0.5">
                  {displayRole}
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted px-2.5 block mb-1.5">
                Navigation
              </span>
              <nav className="flex flex-col gap-1" aria-label="Dashboard Navigation">
                {navItems.map((item) => {
                  const isActive = item.href
                    ? pathname === item.href
                    : activeTab === item.id;

                  const itemClass = `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 text-left cursor-pointer ${
                    isActive
                      ? "bg-[#309255] text-white shadow-1 font-black"
                      : "text-muted hover:bg-[#E7F8EE]/40 hover:text-[#309255] dark:hover:bg-surface dark:hover:text-[#E7F8EE]"
                  }`;

                  const content = (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.icon && <span className="shrink-0 text-base flex items-center justify-center">{item.icon}</span>}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                            isActive
                              ? "bg-white text-[#309255]"
                              : "bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  );

                  if (item.href) {
                    return (
                      <Link key={item.id || item.href} href={item.href} className={itemClass}>
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (onTabChange) onTabChange(item.id);
                      }}
                      className={itemClass}
                    >
                      {content}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Optional Extra Action in Sidebar */}
            {extraSidebarAction && (
              <div className="pt-2 border-t border-border">
                {extraSidebarAction}
              </div>
            )}

            {/* Pinned Sign Out Action */}
            <div className="pt-2 border-t border-border mt-auto">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors cursor-pointer"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content Workspace */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* Top Breadcrumbs & Console Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-[#309255] dark:text-[#E7F8EE] shadow-2xs">
                  <HiOutlineSquares2X2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted font-medium mb-0.5">
                    <span>Dashboard</span>
                    <HiOutlineChevronRight className="w-3 h-3 text-muted/60" />
                    <span className="text-foreground font-bold">{subtitle}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-tight">
                    {roleTitle}
                  </h1>
                </div>
              </div>

              {/* Status / Date Pill */}
              <div className="flex items-center gap-2.5">
                <div className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-muted shadow-2xs">
                  📅 {currentDate}
                </div>
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
