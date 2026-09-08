"use client";

import { Badge } from "@/components/ui/Badge";
import {
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineTrophy,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineCommandLine,
} from "react-icons/hi2";

const STATS = [
  {
    icon: <HiOutlineUsers className="w-6 h-6 text-[#309255]" />,
    number: "15,000+",
    label: "Active Programmers",
    desc: "Enrolled in structured algorithms and software tracks.",
  },
  {
    icon: <HiOutlineAcademicCap className="w-6 h-6 text-[#309255]" />,
    number: "500+",
    label: "Curated Lessons",
    desc: "High-yield video lectures, code snippets & resources.",
  },
  {
    icon: <HiOutlineTrophy className="w-6 h-6 text-[#309255]" />,
    number: "50+",
    label: "ICPC Regional Finalists",
    desc: "Students competing at top national and regional contests.",
  },
  {
    icon: <HiOutlineStar className="w-6 h-6 text-[#309255]" />,
    number: "4.9 / 5.0",
    label: "Student Satisfaction",
    desc: "Verified student reviews across all course tracks.",
  },
];

export function ImpactMetricsSection() {
  return (
    <section className="py-16 md:py-24 bg-surface border-b border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="highlight" size="sm">
            Platform Impact
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Empowering the Next Generation of Problem Solvers
          </h2>
          <p className="text-sm sm:text-base text-muted">
            Our data-driven numbers reflect our commitment to real student outcomes.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-card border border-border hover:border-[#309255] hover:-translate-y-0.5 shadow-1 hover:shadow-1 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E7F8EE] dark:bg-[#E7F8EE]/15 border border-[#309255]/20 flex items-center justify-center">
                {stat.icon}
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                  {stat.number}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {stat.label}
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
