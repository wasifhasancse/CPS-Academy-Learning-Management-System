"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from "react-icons/hi2";

const COMPARISON_ROWS = [
  {
    feature: "Structured Step-by-Step Curriculum",
    cps: "100% Curated from Beginner to Advanced",
    cpsStatus: true,
    generic: "Random video playlists with fragmented topics",
    genericStatus: false,
  },
  {
    feature: "Diagnostic Timed Quiz Engine",
    cps: "Instant server auto-grading with explanation keys",
    cpsStatus: true,
    generic: "No quizzes or unscored static forms",
    genericStatus: false,
  },
  {
    feature: "Universal Live Progress Synchronization",
    cps: "Real-time sync across Student, Instructor & Admin dashboards",
    cpsStatus: true,
    generic: "Manual tick boxes that clear on browser refresh",
    genericStatus: false,
  },
  {
    feature: "Course Scorecards & Answer Key Reviews",
    cps: "Inspect exact question mistakes & correct solutions anytime",
    cpsStatus: true,
    generic: "Not available",
    genericStatus: false,
  },
  {
    feature: "Direct Instructor Access & Mentorship",
    cps: "Verified instructors and collaborative learner discussions",
    cpsStatus: true,
    generic: "Inactive comment sections with zero feedback",
    genericStatus: false,
  },
  {
    feature: "One-Click Safe Stripe Checkout",
    cps: "Immediate transactional access & automated invoice generation",
    cpsStatus: true,
    generic: "Manual bank transfers or insecure forms",
    genericStatus: false,
  },
];

export function ComparisonSection() {
  return (
    <section className="py-16 md:py-24 bg-background border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="highlight" size="sm">
            The CPS Academy Advantage
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Why Programmers Choose CPS Academy
          </h2>
          <p className="text-sm sm:text-base text-muted">
            See how our structured, verified learning system compares to disorganized tutorials.
          </p>
        </div>

        {/* Comparison Table Card */}
        <div className="rounded-3xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="py-5 px-6 text-xs font-extrabold text-foreground uppercase tracking-wider w-2/5">
                    Learning Feature
                  </th>
                  <th className="py-5 px-6 text-xs font-extrabold text-secondary uppercase tracking-wider w-3/10 bg-secondary/10">
                    <div className="flex items-center gap-2">
                      <HiOutlineSparkles className="w-4 h-4 text-secondary" />
                      <span>CPS Academy System</span>
                    </div>
                  </th>
                  <th className="py-5 px-6 text-xs font-extrabold text-muted uppercase tracking-wider w-3/10">
                    Generic Online Tutorials
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs sm:text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-card/50 transition-colors">
                    <td className="py-4.5 px-6 font-bold text-foreground">
                      {row.feature}
                    </td>
                    <td className="py-4.5 px-6 bg-secondary/5 font-semibold text-foreground">
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <span>{row.cps}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-muted">
                      <div className="flex items-start gap-2.5">
                        <HiOutlineXCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <span>{row.generic}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
