"use client";

import { Logo } from "@/components/layout/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCcMastercard, FaCcVisa, FaStripe } from "react-icons/fa6";
import { HiOutlineEnvelope, HiOutlineGlobeAlt } from "react-icons/hi2";

const footerLinkClass =
  "inline-flex items-center rounded-md text-footer-fg/80 transition-all duration-200 hover:translate-x-1 hover:text-[#E7F8EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#309255] focus-visible:ring-offset-2 focus-visible:ring-offset-footer-bg";

export function Footer() {
  const pathname = usePathname();

  // Do not render footer on dashboard pages
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-footer-bg text-footer-fg border-t border-border transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3">
            <Logo variant="footer" />
            <p className="text-xs text-footer-fg/70 leading-relaxed">
              Empowering students and software engineers through structured
              competitive programming, algorithms, and practical software
              engineering courses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#E7F8EE] mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className={footerLinkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/courses" className={footerLinkClass}>
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/blog" className={footerLinkClass}>
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/success-story" className={footerLinkClass}>
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-highlight mb-3">
              Learn & Grow
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/auth/register" className={footerLinkClass}>
                  Create an Account
                </Link>
              </li>
              <li>
                <Link href="/courses" className={footerLinkClass}>
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/about" className={footerLinkClass}>
                  Learning Approach
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
                <Link href="/about" className={footerLinkClass}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className={footerLinkClass}>
                  Log In
                </Link>
              </li>
              <li>
                <span className="text-footer-fg/50">Privacy & Terms</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-highlight mb-3">
              Contact
            </h4>
            <address className="space-y-2 text-xs not-italic">
              <a
                href="mailto:support@cpsacademy.com"
                className={footerLinkClass}
              >
                <HiOutlineEnvelope className="w-4 h-4 mr-2 shrink-0" />
                support@cpsacademy.com
              </a>
              <Link href="/about" className={footerLinkClass}>
                <HiOutlineGlobeAlt className="w-4 h-4 mr-2 shrink-0" />
                Learn about CPS Academy
              </Link>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border flex flex-col lg:flex-row items-center justify-between text-xs text-footer-fg/60 gap-4">
          <p>© {new Date().getFullYear()} CPS Academy. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-footer-fg/70">
              Secure card payments via Stripe
            </span>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <FaStripe
              className="h-5 w-auto text-[#E7F8EE]"
              aria-label="Stripe"
            />
            <FaCcVisa className="h-5 w-auto text-[#E7F8EE]" aria-label="Visa" />
            <FaCcMastercard
              className="h-5 w-auto text-[#E7F8EE]"
              aria-label="Mastercard"
            />
          </div>
          <span>Built with Next.js 16 & Strapi v5</span>
        </div>
      </div>
    </footer>
  );
}
