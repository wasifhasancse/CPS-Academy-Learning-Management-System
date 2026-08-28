"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, getRoleDashboardPath } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, isLoading, logout } = useAuth();
  const dashboardPath = getRoleDashboardPath(role);

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Success Story", href: "/success-story" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary text-white dark:bg-highlight dark:text-primary flex items-center justify-center font-black text-base shadow-sm group-hover:bg-secondary transition-colors">
              CPS
            </div>
            <span className="font-extrabold text-lg text-foreground tracking-tight hidden sm:inline-block">
              CPS <span className="text-secondary font-semibold">Academy</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-surface text-primary dark:text-highlight font-bold"
                      : "text-foreground/80 hover:text-foreground hover:bg-surface"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Search Box */}
        <div className="flex-1 max-w-xs sm:max-w-sm hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search courses, blogs, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            />
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Right Section: Theme Toggle & Session Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {isLoading ? (
            <div className="w-20 h-8 rounded-md bg-surface animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href={dashboardPath} className="hidden sm:flex items-center gap-2 group">
                <Badge variant="highlight" size="sm">
                  {role || "Student"}
                </Badge>
                <span className="text-xs font-semibold text-foreground group-hover:text-secondary transition-colors max-w-[100px] truncate">
                  {user?.username}
                </span>
              </Link>

              <Button href={dashboardPath} variant="primary" size="sm" className="text-xs">
                Dashboard
              </Button>
              <Button onClick={logout} variant="ghost" size="sm" className="text-xs hidden sm:inline-flex">
                Log Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button href="/auth/login" variant="ghost" size="sm" className="text-xs">
                Log In
              </Button>
              <Button href="/auth/register" variant="primary" size="sm" className="text-xs">
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-foreground hover:bg-surface transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search courses, blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Mobile Nav Links */}
          <div className="flex flex-col space-y-1 pt-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  pathname === link.href
                    ? "bg-surface text-primary dark:text-highlight font-bold"
                    : "text-foreground/80 hover:text-foreground hover:bg-surface"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {isAuthenticated && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted">Logged in as {user?.username}</span>
              <button
                type="button"
                onClick={logout}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
