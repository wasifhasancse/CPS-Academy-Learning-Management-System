"use client";

import Link from "next/link";
import { useAuth, getRoleDashboardPath } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  const { user, role, isAuthenticated, isLoading, logout } = useAuth();
  const dashboardPath = getRoleDashboardPath(role);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary text-white dark:bg-highlight dark:text-primary flex items-center justify-center font-black text-base shadow-sm group-hover:bg-secondary transition-colors">
              CPS
            </div>
            <span className="font-extrabold text-lg text-foreground tracking-tight">
              CPS <span className="text-secondary font-semibold">Academy</span>
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <Link
              href="/courses"
              className="text-sm font-medium text-foreground/80 hover:text-foreground px-3 py-2 rounded-md hover:bg-surface transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-foreground/80 hover:text-foreground px-3 py-2 rounded-md hover:bg-surface transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/quizzes"
              className="text-sm font-medium text-foreground/80 hover:text-foreground px-3 py-2 rounded-md hover:bg-surface transition-colors"
            >
              Quizzes
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground/80 hover:text-foreground px-3 py-2 rounded-md hover:bg-surface transition-colors"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Right Section: Theme Toggle & Session Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isLoading ? (
            <div className="w-20 h-8 rounded-md bg-surface animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardPath} className="flex items-center gap-2 group">
                <Badge variant="highlight" size="sm" className="hidden sm:inline-flex">
                  {role || "Student"}
                </Badge>
                <span className="text-xs font-semibold text-foreground group-hover:text-secondary transition-colors">
                  {user?.username}
                </span>
              </Link>

              <Button href={dashboardPath} variant="primary" size="sm">
                Dashboard
              </Button>
              <Button onClick={logout} variant="ghost" size="sm" className="text-xs">
                Log Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button href="/auth/login" variant="ghost" size="sm">
                Log In
              </Button>
              <Button href="/auth/register" variant="primary" size="sm">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
