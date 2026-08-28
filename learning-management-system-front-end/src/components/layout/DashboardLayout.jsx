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
          <aside className="w-full lg:w-64 shrink-0 bg-card dark:bg-[#091413] text-foreground dark:text-[#F0F7F4] rounded-2xl border border-border dark:border-[#1E3A33] p-3.5 flex flex-col gap-3 lg:sticky lg:top-24 shadow-xs">
            {/* User Identity Card */}
            <div className="p-3 rounded-xl bg-surface dark:bg-[#0D1C19] border border-border dark:border-[#1E3A33] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-highlight border border-primary/20 dark:border-primary/30 flex items-center justify-center font-bold text-lg shrink-0">
                <HiOutlineShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-sm text-foreground dark:text-white truncate block">
                  {user?.username || "User"}
                </span>
                <span className="text-[10px] font-black tracking-wider text-primary dark:text-highlight uppercase truncate block">
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
                    ? "bg-[#285A48] text-white shadow-xs"
                    : "text-muted hover:bg-surface hover:text-foreground dark:text-[#82A79B] dark:hover:bg-[#122421] dark:hover:text-white"
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
                            ? "bg-[#B0E4CC] text-[#091413]"
                            : "bg-primary/10 text-primary dark:bg-[#B0E4CC] dark:text-[#091413]"
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
