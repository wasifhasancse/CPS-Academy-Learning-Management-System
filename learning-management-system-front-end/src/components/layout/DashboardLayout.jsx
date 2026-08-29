"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HiOutlineShieldCheck, HiOutlineArrowRightOnRectangle, HiOutlineSquares2X2 } from "react-icons/hi2";

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

  return (
    <div className="w-full bg-background text-foreground transition-colors min-h-[calc(100vh-4rem)]">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0 bg-card dark:bg-[#2A3D5A] text-foreground dark:text-[#DFF2EB] rounded-2xl border border-border dark:border-[#7AB2D3]/40 p-3.5 flex flex-col gap-3 lg:sticky lg:top-24 shadow-xs">
            {/* User Identity Card */}
            <div className="p-3 rounded-xl bg-surface dark:bg-[#1E2A3A] border border-border dark:border-[#7AB2D3]/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7AB2D3]/15 text-[#4A628A] dark:bg-[#7AB2D3]/20 dark:text-[#B9E5E8] border border-[#B9E5E8]/40 flex items-center justify-center font-bold text-lg shrink-0">
                <HiOutlineShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-sm text-foreground dark:text-white truncate block">
                  {user?.username || "User"}
                </span>
                <span className="text-[10px] font-black tracking-wider text-[#7AB2D3] dark:text-[#B9E5E8] uppercase truncate block">
                  {displayRole}
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1.5" aria-label="Dashboard Navigation">
              {navItems.map((item) => {
                const isActive = item.href
                  ? pathname === item.href
                  : activeTab === item.id;

                const itemClass = `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? "bg-[#7AB2D3] text-white dark:bg-[#7AB2D3] dark:text-[#1E2A3A] shadow-xs font-black"
                    : "text-muted hover:bg-surface hover:text-foreground dark:text-[#B9E5E8] dark:hover:bg-[#1E2A3A] dark:hover:text-[#DFF2EB]"
                }`;

                const content = (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      {item.icon && <span className="shrink-0 text-base flex items-center justify-center">{item.icon}</span>}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge !== null && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                          isActive
                            ? "bg-[#DFF2EB] text-[#4A628A]"
                            : "bg-[#7AB2D3]/15 text-[#4A628A] dark:bg-[#B9E5E8]/20 dark:text-[#B9E5E8]"
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

            {/* Optional Extra Action in Sidebar */}
            {extraSidebarAction && (
              <div className="pt-2 border-t border-border dark:border-[#1E3A33]">
                {extraSidebarAction}
              </div>
            )}

            {/* Pinned Sign Out Action */}
            <div className="pt-2 border-t border-border dark:border-[#1E3A33]">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors cursor-pointer"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content Workspace */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* Main Console Title with Icon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface dark:bg-[#122421] border border-border flex items-center justify-center text-primary dark:text-highlight">
                  <HiOutlineSquares2X2 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground dark:text-white tracking-tight">
                    {roleTitle} {subtitle}
                  </h1>
                  <p className="text-xs text-muted pt-1">
                    Logged in as <span className="font-semibold text-foreground dark:text-white">{user?.username}</span> ({user?.email})
                  </p>
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
