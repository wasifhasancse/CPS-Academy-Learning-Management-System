"use client";

import { Badge } from "@/components/ui/Badge";
import {
  HiOutlineStar,
  HiOutlineCheckBadge,
  HiOutlineAcademicCap,
} from "react-icons/hi2";

const TESTIMONIALS = [
  {
    name: "Tanzim Hasan",
    role: "ICPC Asia Regionalist & Candidate Master",
    course: "Competitive Programming Masterclass",
    avatar: "T",
    rating: 5,
    quote: "The graph theory and dynamic programming modules on CPS Academy are by far the most thorough explanations I've ever seen. The checkpoint quizzes ensured I had zero conceptual blind spots before contest season.",
  },
  {
    name: "Anika Rahman",
    role: "Full-Stack Engineer at Tech Mahindra",
    course: "Full-Stack Software Architecture",
    avatar: "A",
    rating: 5,
    quote: "Transitioning from basic web design to full production-ready Next.js with PostgreSQL was effortless with CPS. The video lessons and hands-on curriculum gave me the confidence to ace my technical interviews.",
  },
  {
    name: "Sabbir Ahmed",
    role: "National Olympiad in Informatics Medalist",
    course: "Algorithms & Data Structures",
    avatar: "S",
    rating: 5,
    quote: "The quiz evaluations and scorecards are unmatched. Being able to review my exact mistakes with step-by-step mathematical breakdowns accelerated my problem-solving speed drastically.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-background border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="highlight" size="sm">
            Student Outcomes
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Trusted by Top Contestants and Engineers
          </h2>
          <p className="text-sm sm:text-base text-muted">
            Read how students transformed their problem-solving and software development skills.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-surface border border-border hover:border-primary transition-all flex flex-col justify-between space-y-6 shadow-xs group"
            >
              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <HiOutlineStar key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-border/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                      {t.name}
                    </span>
                    <HiOutlineCheckBadge className="w-4 h-4 text-secondary shrink-0" />
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    {t.role}
                  </div>
                  <div className="text-[10px] font-semibold text-secondary truncate mt-0.5">
                    Enrolled in {t.course}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
