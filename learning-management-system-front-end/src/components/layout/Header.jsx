"use client";

import { Logo } from "@/components/layout/Logo";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  HiOutlineAcademicCap,
  HiOutlineBars3,
  HiOutlineBookOpen,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineInformationCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineSparkles,
  HiOutlineXMark,
} from "react-icons/hi2";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, isLoading, mounted, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Global search shortcut listener (/ and Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (
        (e.key === "/" && !isInput) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const targetPath = pathname.startsWith("/blog") ? "/blog" : "/courses";
    router.push(
      `${targetPath}?search=${encodeURIComponent(searchQuery.trim())}`,
    );
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", href: "/", icon: HiOutlineHome },
    { name: "Courses", href: "/courses", icon: HiOutlineBookOpen },
    { name: "Blog", href: "/blog", icon: HiOutlineDocumentText },
    { name: "About", href: "/about", icon: HiOutlineInformationCircle },
    { name: "Success Story", href: "/success-story", icon: HiOutlineSparkles },
  ];

  // Role resolution for mobile quick action
  const rawRoleStr = (role || user?.role?.name || user?.role?.type || "student")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  const isInstructor = rawRoleStr.includes("instructor");
  const isManager =
    rawRoleStr.includes("contentmanager") || rawRoleStr.includes("manager");
  const isAdmin = rawRoleStr.includes("admin");

  const dashboardPath = isAdmin
    ? "/dashboard/admin"
    : isManager
      ? "/dashboard/manager"
      : isInstructor
        ? "/dashboard/instructor"
        : "/dashboard/student";

  const roleLabel = isAdmin
    ? "Admin"
    : isManager
      ? "Manager"
      : isInstructor
        ? "Instructor"
        : "Student";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border/80 transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-3 md:gap-6">
          {/* Left: Brand Logo & Integrated Search Bar */}
          <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-md">
            <Logo />

            {/* Desktop / Tablet Search Input */}
            <div className="w-full max-w-xs hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative w-full group">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search courses, blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-surface border border-border text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-[#309255] focus:ring-2 focus:ring-[#309255]/15 transition-all duration-200 shadow-2xs"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted group-focus-within:text-[#309255] transition-colors">
                  <HiOutlineMagnifyingGlass className="w-4 h-4" />
                </div>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground hover:bg-surface-hover p-1 rounded-md transition-colors"
                    aria-label="Clear search"
                  >
                    <HiOutlineXMark className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center justify-center px-1.5 py-0.5 text-[10px] font-mono text-muted/80 bg-background border border-border/70 rounded shadow-2xs pointer-events-none">
                    /
                  </kbd>
                )}
              </form>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-1.5"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/10 dark:text-[#E7F8EE] font-bold shadow-2xs"
                      : "text-foreground/80 hover:text-[#309255] hover:bg-[#E7F8EE]/50 dark:text-[#F5FBF7]/80 dark:hover:bg-surface-hover dark:hover:text-[#E7F8EE]"
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#309255] dark:bg-[#E7F8EE] shrink-0" />
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Theme Toggle & Session Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />

            {!mounted ? (
              <div className="w-20 h-9 rounded-xl bg-surface border border-border/40 animate-pulse" />
            ) : user ? (
              <ProfileDropdown />
            ) : isLoading ? (
              <div className="w-20 h-9 rounded-xl bg-surface border border-border/40 animate-pulse" />
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  href="/auth/login"
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm font-semibold hover:bg-[#E7F8EE]/50 dark:hover:bg-surface-hover rounded-xl px-3 sm:px-3.5 py-2"
                >
                  Log In
                </Button>
                <Button
                  href="/auth/register"
                  variant="primary"
                  size="sm"
                  className="text-xs sm:text-sm font-bold rounded-xl px-3.5 sm:px-4 py-2 shadow-1"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover hover:text-[#309255] dark:hover:text-[#E7F8EE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#309255]/30 cursor-pointer"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <HiOutlineXMark className="w-5 h-5" />
              ) : (
                <HiOutlineBars3 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu & Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 sm:top-[68px] z-40 lg:hidden flex flex-col">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 top-16 sm:top-[68px] bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content Panel */}
          <div className="relative z-50 bg-card border-b border-border shadow-1 p-4 sm:p-5 max-h-[calc(100vh-4.5rem)] overflow-y-auto space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search courses, blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-[#309255] focus:ring-2 focus:ring-[#309255]/15 transition-all shadow-2xs"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <HiOutlineMagnifyingGlass className="w-4 h-4" />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 rounded-md"
                  aria-label="Clear search"
                >
                  <HiOutlineXMark className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 pt-1">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/15 dark:text-[#E7F8EE] font-bold shadow-2xs"
                        : "text-foreground/80 hover:text-[#309255] hover:bg-[#E7F8EE]/50 dark:hover:bg-surface-hover dark:hover:text-[#E7F8EE]"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-[#309255] dark:text-[#E7F8EE]" : "text-muted"}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile User / Auth Section */}
            <div className="pt-3 border-t border-border">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] flex items-center justify-center font-bold text-xs shrink-0 border border-[#309255]/20">
                        {(user.name || user.username || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">
                          {user.name || user.username}
                        </span>
                        <span className="text-[10px] text-muted truncate">
                          {user.email || `${user.username}@cpsacademy.io`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-xs font-semibold text-red-500 hover:underline shrink-0 ml-2"
                    >
                      Log Out
                    </button>
                  </div>

                  <Button
                    href={dashboardPath}
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold rounded-xl py-2.5 justify-center shadow-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Go to {roleLabel} Dashboard
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    href="/auth/login"
                    variant="surface"
                    size="sm"
                    className="w-full text-xs font-semibold rounded-xl py-2.5 justify-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Button>
                  <Button
                    href="/auth/register"
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold rounded-xl py-2.5 justify-center shadow-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

