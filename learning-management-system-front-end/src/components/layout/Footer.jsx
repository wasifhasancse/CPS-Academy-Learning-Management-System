"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Do not render footer on dashboard pages
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-footer-bg text-footer-fg border-t border-border transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#309255] text-white flex items-center justify-center font-black text-sm shadow-xs">
                CPS
              </div>
              <span className="font-extrabold text-base text-white">CPS Academy</span>
            </div>
            <p className="text-xs text-footer-fg/70 leading-relaxed">
              Empowering students and software engineers through structured competitive programming, algorithms, and practical software engineering courses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#E7F8EE] mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-footer-fg/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-footer-fg/80 hover:text-white transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-footer-fg/80 hover:text-white transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/success-story" className="text-footer-fg/80 hover:text-white transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Instructors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-highlight mb-3">
              Teach & Lead
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/auth/register" className="text-footer-fg/80 hover:text-highlight transition-colors">
                  Become an Instructor
                </Link>
              </li>
              <li>
                <Link href="/dashboard/instructor" className="text-footer-fg/80 hover:text-highlight transition-colors">
                  Instructor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-footer-fg/80 hover:text-highlight transition-colors">
                  Curriculum Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-highlight mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="text-footer-fg/80 hover:text-highlight transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-footer-fg/80 hover:text-highlight transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <span className="text-footer-fg/50">Privacy & Terms</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-footer-fg/60 gap-4">
          <p>© {new Date().getFullYear()} CPS Academy. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Built with Next.js 16 & Strapi v5</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
