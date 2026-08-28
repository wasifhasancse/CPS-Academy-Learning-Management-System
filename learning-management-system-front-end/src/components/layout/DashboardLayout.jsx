"use client";

import { useAuth } from "@/context/AuthContext";

export function DashboardLayout({
  roleTitle = "Administrative Console",
  subtitle = "Overview",
  navItems = [],
  activeTab,
  onTabChange,
  extraSidebarAction,
  children,
}) {
  const { user, role, logout } = useAuth();

  const displayRole = (role || "Student").toUpperCase();

  return (
    <div className="w-full bg-background text-foreground transition-colors min-h-[calc(100vh-4rem)]">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0 bg-[#091413] text-[#F0F7F4] rounded-2xl border border-[#1E3A33] p-3.5 flex flex-col gap-3 lg:sticky lg:top-24">
            {/* User Identity Card */}
            <div className="p-3 rounded-xl bg-[#0D1C19] border border-[#1E3A33] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-base shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-sm text-white truncate block">
                  {user?.username || "User"}
                </span>
                <span className="text-[10px] font-black tracking-wider text-red-400 uppercase truncate block">
                  {displayRole}
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1.5" aria-label="Dashboard Navigation">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (onTabChange) onTabChange(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 text-left cursor-pointer ${
                      isActive
                        ? "bg-[#285A48] text-white shadow-xs"
                        : "text-[#82A79B] hover:bg-[#122421] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <span className="shrink-0 text-base">{item.icon}</span>}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge !== null && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#B0E4CC] text-[#091413]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Optional Extra Action in Sidebar */}
            {extraSidebarAction && (
              <div className="pt-2 border-t border-[#1E3A33]">
                {extraSidebarAction}
              </div>
            )}

            {/* Pinned Sign Out Action */}
            <div className="pt-2 border-t border-[#1E3A33]">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
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
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
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
