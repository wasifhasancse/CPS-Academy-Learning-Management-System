"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function DashboardLayout({
  roleTitle = "Dashboard",
  subtitle = "Welcome back",
  navItems = [],
  activeTab,
  onTabChange,
  children,
}) {
  const { user, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#091413] text-[#F0F7F4] flex flex-col border-r border-[#1E3A33] transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#1E3A33]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#285A48] text-[#B0E4CC] flex items-center justify-center font-black text-sm">
              CPS
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">
              CPS <span className="text-[#B0E4CC]">Academy</span>
            </span>
          </Link>
          <button
            className="lg:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-[#122421] border border-[#1E3A33] flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#285A48] border-2 border-[#408A71] text-[#B0E4CC] flex items-center justify-center font-bold text-lg shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white truncate block">
                {user?.username || "User"}
              </span>
            </div>
            <span className="text-[11px] text-[#82A79B] truncate block">
              {user?.email || "user@cpsacademy.io"}
            </span>
            <div className="mt-1">
              <Badge variant="highlight" size="sm" className="text-[10px] px-2 py-0.5">
                {role || "Student"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Dashboard Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onTabChange) onTabChange(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                  isActive
                    ? "bg-[#285A48] text-white shadow-sm font-bold"
                    : "text-[#82A79B] hover:bg-[#122421] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B0E4CC] text-[#091413]">
                    {item.badge}
                  </span>
                )}
                {isActive && <span className="text-white text-xs">›</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Action */}
        <div className="p-3 border-t border-[#1E3A33]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-card border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-surface text-foreground"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight leading-tight">
                {roleTitle}
              </h1>
              <p className="text-xs text-muted">
                {subtitle}, <span className="font-semibold text-foreground">{user?.username || "Learner"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-semibold text-muted hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
