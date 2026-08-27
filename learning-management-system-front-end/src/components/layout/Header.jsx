import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
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

        {/* Right Section: Theme Toggle & Auth CTAs */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button href="/auth/login" variant="ghost" size="sm">
            Log In
          </Button>
          <Button href="/auth/register" variant="primary" size="sm">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}
