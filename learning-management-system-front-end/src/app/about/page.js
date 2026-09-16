"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  HiOutlineAcademicCap,
  HiOutlineCommandLine,
  HiOutlineCheckBadge,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineTrophy,
  HiOutlineShieldCheck,
  HiOutlineCpuChip,
  HiOutlineGlobeAlt,
  HiOutlineArrowRight,
  HiOutlineLightBulb,
} from "react-icons/hi2";

export default function AboutPage() {
  const pillars = [
    {
      title: "Competitive Programming Rigor",
      desc: "Deep mathematical and algorithmic intuition covering Dynamic Programming, Segment Trees, Graph Theory, and Number Theory for ICPC, Codeforces, and Olympiads.",
      icon: <HiOutlineCommandLine className="w-6 h-6 text-secondary" />,
      badge: "Algorithms",
    },
    {
      title: "Modern Software Architecture",
      desc: "Real-world full-stack systems engineering with Next.js 16, PostgreSQL relational modeling, distributed APIs, clean code design, and secure cloud deployments.",
      icon: <HiOutlineCpuChip className="w-6 h-6 text-secondary" />,
      badge: "Engineering",
    },
    {
      title: "Server-Verified Quizzes & Scorecards",
      desc: "Timed checkpoint evaluations with server auto-grading and step-by-step algorithmic explanations ensuring zero conceptual blind spots.",
      icon: <HiOutlineShieldCheck className="w-6 h-6 text-secondary" />,
      badge: "Evaluations",
    },
    {
      title: "Direct Mentor Guidance & Community",
      desc: "One-on-one feedback and collaborative learning alongside top national contest problem solvers and seasoned engineering practitioners.",
      icon: <HiOutlineUsers className="w-6 h-6 text-secondary" />,
      badge: "Mentorship",
    },
  ];

  const pedagogy = [
    {
      step: "01",
      title: "First-Principles Theory",
      desc: "Break down complex concepts into fundamental mathematical and computer science primitives before writing code.",
    },
    {
      step: "02",
      title: "Guided Video & Text Lessons",
      desc: "Stream timestamped video lectures accompanied by comprehensive reading notes, diagrams, and downloadable templates.",
    },
    {
      step: "03",
      title: "Diagnostic Checkpoints",
      desc: "Evaluate understanding with auto-graded quizzes and inspect mistakes through detailed answer key reviews.",
    },
    {
      step: "04",
      title: "Universal Progress Certification",
      desc: "Synchronize completion across dashboards and achieve verified proof of mastery for technical interviews.",
    },
  ];

  const faculty = [
    {
      name: "Wasif Hasan",
      role: "Lead Architect & Founder",
      bio: "ICPC Asia Regionalist, competitive programming mentor, and full-stack distributed systems engineer.",
      tags: ["Algorithms", "Next.js", "Distributed Systems", "PostgreSQL"],
      avatar: "W",
    },
    {
      name: "Mohaimin",
      role: "Senior Instructor — CP Track",
      bio: "Codeforces Master with extensive coaching experience preparing university teams for ICPC and national Olympiads.",
      tags: ["Codeforces Master", "ICPC Coach", "C++ STL", "Tree DP"],
      avatar: "M",
    },
    {
      name: "Arafat Rahman",
      role: "Senior Instructor — Systems Track",
      bio: "Backend specialist focusing on clean software design, relational database schemas, microservices, and interview prep.",
      tags: ["System Design", "Databases", "Clean Code", "APIs"],
      avatar: "A",
    },
  ];

  const stats = [
    { label: "Students Trained", value: "15,000+", desc: "Across competitive programming and web tracks" },
    { label: "Contest Problems Solved", value: "500,000+", desc: "In training sessions and contest evaluations" },
    { label: "ICPC Regional Finalists", value: "120+", desc: "Mentored into top national contest podiums" },
    { label: "Course Satisfaction", value: "98.5%", desc: "Verified ratings from enrolled learners" },
  ];

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16 sm:space-y-20">
      {/* 1. HERO BANNER */}
      <section className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary dark:text-highlight">
          <HiOutlineSparkles className="w-4 h-4" />
          <span>Bridging Academic Theory & Tech Industry Excellence</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.12]">
          Empowering the Next Generation of Problem Solvers & Engineers
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-muted leading-relaxed">
          CPS Academy is a comprehensive Learning Management System built for students, instructors, and engineers. We provide structured, step-by-step paths from foundational programming to national contest podiums and software engineering roles.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
          <Button href="/courses" variant="primary" size="md" className="font-bold text-xs sm:text-sm px-6 py-3">
            <span>Explore All Courses</span>
            <HiOutlineArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <Button href="/success-story" variant="outline" size="md" className="font-bold text-xs sm:text-sm px-6 py-3">
            <span>Read Success Stories</span>
          </Button>
        </div>
      </section>

      {/* 2. KEY STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-card border border-border space-y-1 text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-black text-primary dark:text-highlight tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs font-bold text-foreground">
              {stat.label}
            </div>
            <p className="text-[11px] text-muted">
              {stat.desc}
            </p>
          </div>
        ))}
      </section>

      {/* 3. OUR STORY & FOUNDING VISION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        <div className="lg:col-span-6 space-y-4">
          <Badge variant="highlight" size="sm">
            Our Origin & Mission
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Why We Built CPS Academy
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Most aspiring programmers get stuck in "tutorial hell" — jumping between unorganized playlists without structured feedback, rigorous checkpoints, or clear roadmaps.
          </p>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            CPS Academy was engineered to solve this. We combined university-level computer science foundations with competitive programming problem sets, server-evaluated quizzes, and direct instructor mentorship to give every learner a predictable path to technical mastery.
          </p>
        </div>

        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
              <HiOutlineLightBulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Our Core Promise</h3>
              <span className="text-xs text-secondary font-semibold">Structured, Verifiable Outcomes</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Whether your goal is winning an ICPC regional medal, mastering algorithms for technical interviews, or architecting production distributed systems, every course module on CPS is crafted to eliminate ambiguity and build confidence.
          </p>
        </div>
      </section>

      {/* 4. CORE MISSION PILLARS */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline">Our Standards</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            The 4 Pillars of CPS Academy
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Every feature on our platform is designed around these four principles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <Card key={idx} className="p-6 space-y-4 bg-surface border-border hover:border-primary transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center">
                    {pillar.icon}
                  </div>
                  <Badge variant="surface" className="text-[10px] font-bold">
                    {pillar.badge}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-semibold text-secondary">
                <HiOutlineCheckBadge className="w-3.5 h-3.5" />
                <span>Verified Standard</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. PEDAGOGY / 4-STEP MASTERY CYCLE */}
      <section className="p-8 sm:p-12 rounded-3xl bg-surface border border-border space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="highlight" size="sm">
            Learning Methodology
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            The 4-Step Mastery Framework
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            How our curriculum takes you from theoretical understanding to effortless implementation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pedagogy.map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-card border border-border space-y-2.5">
              <span className="text-2xl font-black text-secondary font-mono">
                {item.step}
              </span>
              <h3 className="text-sm font-bold text-foreground">
                {item.title}
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FACULTY & LEAD MENTORS */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline">World-Class Mentors</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Meet the CPS Academy Faculty
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Learn directly from active competitive programmers and senior software architects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {faculty.map((member, idx) => (
            <Card key={idx} className="flex flex-col justify-between p-6 bg-surface border-border hover:border-primary transition-all group">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                    {member.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">{member.name}</CardTitle>
                    <CardDescription className="text-xs font-semibold text-secondary">
                      {member.role}
                    </CardDescription>
                  </div>
                </div>

                <p className="text-xs text-muted leading-relaxed">{member.bio}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-border">
                {member.tags.map((tag, tIdx) => (
                  <Badge key={tIdx} variant="surface" className="text-[10px] font-semibold">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="relative overflow-hidden p-8 sm:p-14 rounded-3xl bg-[#212832] text-white border border-[#2E3846] text-center space-y-6 max-w-4xl mx-auto shadow-1">
        {/* Subtle Background Decorative Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#309255]/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#309255]/15 blur-2xl pointer-events-none" />

        <div className="w-12 h-12 rounded-2xl bg-[#309255]/20 text-[#E7F8EE] border border-[#309255]/40 flex items-center justify-center mx-auto shadow-1 relative z-10">
          <HiOutlineAcademicCap className="w-6 h-6" />
        </div>

        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
            Ready to Accelerate Your <span className="text-[#309255]">Problem Solving</span> Journey?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
            Join thousands of learners solving algorithmic problems, acing tech interviews, and building scalable software.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center items-center gap-3.5 relative z-10">
          <Button
            href="/auth/register"
            variant="primary"
            size="lg"
            className="font-bold text-xs sm:text-sm px-6 py-3.5 shadow-1 transition-all duration-200 hover:-translate-y-0.5"
          >
            Create Free Account
          </Button>
          <Button
            href="/courses"
            variant="outline"
            size="lg"
            className="text-white border-white/40 hover:bg-white/10 dark:text-white dark:border-white/40 dark:hover:bg-white/10 font-bold text-xs sm:text-sm px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
          >
            Explore Courses
          </Button>
        </div>
      </section>
    </div>
  );
}
