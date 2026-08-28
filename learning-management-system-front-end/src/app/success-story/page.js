"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const SUCCESS_STORIES = [
  {
    id: 1,
    name: "Ariful Islam",
    role: "Candidate Master on Codeforces • ICPC Regionalist",
    category: "contest",
    badge: "Codeforces 1920+",
    initialRating: "1250 (Pupil)",
    achievedRating: "1924 (Candidate Master)",
    quote:
      "CPS Academy transformed my dynamic programming and graph theory intuition. The disciplined practice routines and timed MCQ assessments gave me the contest stamina to climb over 650 rating points in 8 months.",
    currentCompany: "Competitive Programmer & Coach",
  },
  {
    id: 2,
    name: "Nusrat Jahan",
    role: "Software Engineer at Global Tech Firm",
    category: "career",
    badge: "FAANG Placement",
    initialRating: "Self-taught Developer",
    achievedRating: "Senior Backend Engineer",
    quote:
      "The system design track and rigorous problem-solving fundamentals taught at CPS Academy were the decisive factor in passing my 4-round technical interview for a US-based remote engineering team.",
    currentCompany: "Remote US Microservices Team",
  },
  {
    id: 3,
    name: "Tanvir Ahmed",
    role: "ICPC Dhaka Regional 8th Place",
    category: "contest",
    badge: "ICPC Regional Medalist",
    initialRating: "1400 (Specialist)",
    achievedRating: "2110 (Master)",
    quote:
      "Learning advanced Segment Trees, Trie, and Flow Algorithms directly from experienced coaches made the hardest contest problems feel approachable. CPS Academy is a game changer.",
    currentCompany: "BUET Contest Team",
  },
  {
    id: 4,
    name: "Sadia Rahman",
    role: "Full-Stack Engineer & Open Source Contributor",
    category: "career",
    badge: "Career Switcher",
    initialRating: "Non-CS Background",
    achievedRating: "Full-Stack Web Architect",
    quote:
      "I started with zero coding experience. The step-by-step modular lessons and responsive teacher reviews helped me build production-grade web applications and land my first developer job within 6 months.",
    currentCompany: "FinTech Innovation Lab",
  },
  {
    id: 5,
    name: "Mahir Faysal",
    role: "Expert on Codeforces & LeetCode Top 1%",
    category: "contest",
    badge: "LeetCode 2300+",
    initialRating: "1100 (Newbie)",
    achievedRating: "1850 (Expert)",
    quote:
      "The MCQ quizzes after every lesson forced me to actually understand time complexities and edge cases instead of just copy-pasting solutions. My problem-solving speed quadrupled.",
    currentCompany: "CS Undergraduate & Mentor",
  },
  {
    id: 6,
    name: "Zubair Al Mamun",
    role: "Distributed Systems Backend Engineer",
    category: "career",
    badge: "Top MNC Placement",
    initialRating: "Junior Developer",
    achievedRating: "Distributed Systems Lead",
    quote:
      "CPS Academy gave me the engineering rigor to design low-latency PostgreSQL architectures and secure token-based RBAC systems with confidence.",
    currentCompany: "Enterprise Cloud Solutions",
  },
];

export default function SuccessStoryPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredStories = SUCCESS_STORIES.filter((story) => {
    if (selectedFilter === "all") return true;
    return story.category === selectedFilter;
  });

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="highlight">Proven Track Record</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          CPS Academy Success Stories
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed">
          From first lines of code to Codeforces Master ranks and global software engineering roles. Discover how our students achieve their milestones.
        </p>
      </section>

      {/* Highlights Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div className="text-center p-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-highlight">
            +650 Avg
          </div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
            Rating Gain on CF
          </div>
        </div>
        <div className="text-center p-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-secondary">
            94%
          </div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
            Course Completion Rate
          </div>
        </div>
        <div className="text-center p-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
            150+
          </div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
            Regional Finalists
          </div>
        </div>
        <div className="text-center p-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-highlight">
            Top 5%
          </div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
            Interview Pass Rate
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant={selectedFilter === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("all")}
          className="text-xs"
        >
          All Stories ({SUCCESS_STORIES.length})
        </Button>
        <Button
          variant={selectedFilter === "contest" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("contest")}
          className="text-xs"
        >
          Competitive Programming & ICPC
        </Button>
        <Button
          variant={selectedFilter === "career" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("career")}
          className="text-xs"
        >
          Tech Careers & FAANG
        </Button>
      </div>

      {/* Stories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <Card
            key={story.id}
            className="flex flex-col justify-between hover:border-primary/50 transition-colors p-6 bg-card border-border"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-sm">
                    {story.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{story.name}</h3>
                    <p className="text-[11px] text-muted">{story.currentCompany}</p>
                  </div>
                </div>
                <Badge variant="highlight" className="text-[10px]">
                  {story.badge}
                </Badge>
              </div>

              {/* Progress trajectory badge */}
              <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-muted block">Started As</span>
                  <span className="font-semibold text-foreground">{story.initialRating}</span>
                </div>
                <span className="text-secondary font-bold">➔</span>
                <div className="text-right">
                  <span className="text-[10px] text-muted block">Achieved</span>
                  <span className="font-bold text-primary dark:text-highlight">{story.achievedRating}</span>
                </div>
              </div>

              {/* Quote */}
              <p className="text-xs text-foreground/90 leading-relaxed italic">
                &ldquo;{story.quote}&rdquo;
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] font-semibold text-secondary">
                {story.role}
              </span>
              <span className="text-xs text-primary dark:text-highlight font-bold">
                Verified Alum ✓
              </span>
            </div>
          </Card>
        ))}
      </section>

      {/* CTA Footer */}
      <section className="p-8 sm:p-12 rounded-2xl bg-surface border border-border text-center space-y-4 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Write Your Own Success Story With CPS Academy
        </h2>
        <p className="text-sm text-muted max-w-xl mx-auto">
          Start with our structured curriculum, practice on real problem sets, and get guided mentorship from day one.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Button href="/courses" variant="primary" size="md">
            View All Courses
          </Button>
          <Button href="/auth/register" variant="outline" size="md">
            Create Free Account
          </Button>
        </div>
      </section>
    </div>
  );
}
