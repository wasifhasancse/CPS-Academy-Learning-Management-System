"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  HiOutlineCommandLine,
  HiOutlineCpuChip,
  HiOutlineGlobeAlt,
  HiOutlineClock,
  HiOutlineBookOpen,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
} from "react-icons/hi2";

const ROADMAPS = [
  {
    id: "cp",
    name: "Competitive Programming",
    icon: <HiOutlineCommandLine className="w-5 h-5" />,
    badge: "Most Popular",
    duration: "6 Months • 120+ Hours",
    description: "From beginner syntax to national programming contest finalist with deep mathematical and algorithmic foundations.",
    steps: [
      {
        step: "01",
        title: "C++ Fundamentals & STL Mastery",
        desc: "Vectors, Sets, Maps, Iterators, Fast I/O, and Time Complexity Analysis.",
        problems: "50+ Problems",
      },
      {
        step: "02",
        title: "Number Theory & Combinatorics",
        desc: "Prime Sieve, Modular Arithmetic, GCD/LCM, Fermat's Little Theorem, and Matrix Exponentiation.",
        problems: "60+ Problems",
      },
      {
        step: "03",
        title: "Graph Theory & Trees",
        desc: "BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal's MST, and LCA.",
        problems: "80+ Problems",
      },
      {
        step: "04",
        title: "Dynamic Programming Masterclass",
        desc: "0/1 Knapsack, LIS, LCS, Tree DP, Bitmask DP, and Digit DP with memoization.",
        problems: "90+ Problems",
      },
      {
        step: "05",
        title: "Advanced Data Structures",
        desc: "Segment Trees, Lazy Propagation, Fenwick Trees, Treap, and Sqrt Decomposition.",
        problems: "70+ Problems",
      },
    ],
  },
  {
    id: "web",
    name: "Full-Stack Software Architecture",
    icon: <HiOutlineGlobeAlt className="w-5 h-5" />,
    badge: "Career Track",
    duration: "5 Months • 100+ Hours",
    description: "Build robust distributed web applications with modern architectures, relational databases, and secure APIs.",
    steps: [
      {
        step: "01",
        title: "Modern JavaScript & TypeScript",
        desc: "ES6+, Async/Await, Closures, DOM Architecture, and Strict Type Safety.",
        problems: "40+ Projects",
      },
      {
        step: "02",
        title: "React 19 & Next.js 16 App Router",
        desc: "Server Components, Client Hydration, Layouts, Streaming SSR, and Custom Hooks.",
        problems: "15 Real Apps",
      },
      {
        step: "03",
        title: "PostgreSQL & Database Modeling",
        desc: "Relational Schemas, Indexing, Transactions, Strapi v5 CMS, and ORM Integration.",
        problems: "20 Schema Labs",
      },
      {
        step: "04",
        title: "Authentication, Payments & Security",
        desc: "JWT Guards, Google OAuth, Stripe Webhook Listeners, and RBAC Permission Matrices.",
        problems: "10 Full Modules",
      },
      {
        step: "05",
        title: "Production Deployment & CI/CD",
        desc: "Vercel Edge, Docker Containerization, Neon Database Pools, and Load Testing.",
        problems: "Live Capstone",
      },
    ],
  },
  {
    id: "dsa",
    name: "Core Data Structures & Algorithms",
    icon: <HiOutlineCpuChip className="w-5 h-5" />,
    badge: "Interview Prep",
    duration: "4 Months • 80+ Hours",
    description: "Targeted curriculum designed to crack technical interviews at top tier technology companies.",
    steps: [
      {
        step: "01",
        title: "Linear Data Structures & Pointers",
        desc: "Dynamic Arrays, Singly & Doubly Linked Lists, Stacks, and Monotonic Queues.",
        problems: "45+ Questions",
      },
      {
        step: "02",
        title: "Sorting, Searching & Two Pointers",
        desc: "Binary Search on Answer, QuickSort, MergeSort, Sliding Window, and Prefix Sums.",
        problems: "50+ Questions",
      },
      {
        step: "03",
        title: "Non-Linear Structures & Heaps",
        desc: "Binary Search Trees, AVL Trees, Priority Queues, Binary Heaps, and Trie Strings.",
        problems: "55+ Questions",
      },
      {
        step: "04",
        title: "Recursion & Backtracking",
        desc: "Permutations, Combinations, N-Queens, Sudoku Solver, and Subset Generation.",
        problems: "40+ Questions",
      },
      {
        step: "05",
        title: "System Mock Interviews & Review",
        desc: "Live timed coding assessments, space-time optimization, and code review.",
        problems: "30+ Mock Tests",
      },
    ],
  },
];

export function RoadmapsSection() {
  const [activeTab, setActiveTab] = useState("cp");

  const currentRoadmap = ROADMAPS.find((r) => r.id === activeTab) || ROADMAPS[0];

  return (
    <section className="py-16 md:py-24 bg-surface border-b border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="highlight" size="sm">
            Structured Roadmaps
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Curated Step-by-Step Learning Paths
          </h2>
          <p className="text-sm sm:text-base text-muted">
            Eliminate guesswork. Follow industry-tested curriculums with guided video lessons and checkpoints.
          </p>
        </div>

        {/* Track Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto p-1.5 rounded-2xl bg-surface border border-border">
          {ROADMAPS.map((roadmap) => {
            const isSelected = activeTab === roadmap.id;
            return (
              <button
                key={roadmap.id}
                type="button"
                onClick={() => setActiveTab(roadmap.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#309255] text-white shadow-1"
                    : "text-muted hover:text-[#309255] hover:bg-[#E7F8EE]/30"
                }`}
              >
                {roadmap.icon}
                <span>{roadmap.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Roadmap Timeline Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-surface border border-border shadow-1 space-y-8">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Badge variant="primary" size="sm">
                  {currentRoadmap.badge}
                </Badge>
                <span className="text-xs font-semibold text-muted flex items-center gap-1">
                  <HiOutlineClock className="w-3.5 h-3.5 text-secondary" />
                  <span>{currentRoadmap.duration}</span>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                {currentRoadmap.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted max-w-2xl">
                {currentRoadmap.description}
              </p>
            </div>

            <Button href="/courses" variant="primary" size="sm" className="shrink-0 text-xs font-bold shadow-1">
              <span>View All Courses in Track</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Stepped Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {currentRoadmap.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border hover:border-[#309255] shadow-1 hover:shadow-1 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-[#309255] font-mono">
                      {step.step}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F8EE] dark:bg-[#E7F8EE]/10 border border-[#309255]/20 text-[#309255] dark:text-[#E7F8EE]">
                      {step.problems}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-[#309255] transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 text-[11px] font-semibold text-[#309255] dark:text-[#E7F8EE]">
                  <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                  <span>Verified Curriculum</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
