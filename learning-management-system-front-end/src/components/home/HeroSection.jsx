"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
  HiOutlineCheckBadge,
  HiOutlineCommandLine,
  HiOutlineArrowRight,
  HiOutlinePlayCircle,
} from "react-icons/hi2";

const SLIDES = [
  {
    id: 1,
    title: "Competitive Programming Masterclass",
    category: "Advanced Algorithms & ICPC",
    badge: "Track 01",
    description: "Master Dynamic Programming, Graph Theory, and Combinatorics with deep video breakdowns and curated problem sets.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
    link: "/courses",
    accent: "bg-emerald-600",
  },
  {
    id: 2,
    title: "Full-Stack Software Engineering",
    category: "Next.js, Node & System Design",
    badge: "Track 02",
    description: "Build robust distributed web applications with modern architectures, relational databases, and secure APIs.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    link: "/courses",
    accent: "bg-teal-600",
  },
  {
    id: 3,
    title: "Interactive Checkpoint Quiz Engine",
    category: "Instant Verification & Scorecards",
    badge: "Track 03",
    description: "Test your theoretical understanding and algorithmic precision with server-evaluated diagnostic quizzes and explanations.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    link: "/courses",
    accent: "bg-cyan-600",
  },
  {
    id: 4,
    title: "Instructor Mentorship & Community",
    category: "Collaborative Learning",
    badge: "Track 04",
    description: "Engage with expert mentors and a dedicated community of high-achieving programmers pushing each other forward.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
    link: "/about",
    accent: "bg-green-700",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const active = SLIDES[currentSlide];

  return (
    <section className="relative w-full bg-surface border-b border-border py-12 md:py-20 lg:py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Typography & CTA */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            {/* Top Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary dark:text-highlight">
              <HiOutlineSparkles className="w-4 h-4" />
              <span>CPS Academy • The Premier Computer Science Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-foreground tracking-tight leading-[1.12]">
              Master <span className="text-primary dark:text-highlight">Problem Solving</span> & Software Engineering
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base md:text-lg text-muted leading-relaxed max-w-xl">
              Accelerate your engineering career with structured curriculum roadmaps, YouTube video lessons, timed quiz assessments, and verified course certifications.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Button href="/courses" variant="primary" size="lg" className="font-bold text-xs sm:text-sm px-6 py-3.5 shadow-sm">
                <span>Explore All Courses</span>
                <HiOutlineArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button href="/auth/register" variant="outline" size="lg" className="font-bold text-xs sm:text-sm px-6 py-3.5">
                <span>Create Free Account</span>
              </Button>
            </div>

            {/* Platform Feature Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/80">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-primary dark:text-highlight font-black text-xl sm:text-2xl">
                  <span>100%</span>
                </div>
                <div className="text-xs font-semibold text-muted">Curated Tracks</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-primary dark:text-highlight font-black text-xl sm:text-2xl">
                  <span>Live</span>
                </div>
                <div className="text-xs font-semibold text-muted">Quiz Engine</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-primary dark:text-highlight font-black text-xl sm:text-2xl">
                  <span>Expert</span>
                </div>
                <div className="text-xs font-semibold text-muted">Instructors</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-primary dark:text-highlight font-black text-xl sm:text-2xl">
                  <span>Verified</span>
                </div>
                <div className="text-xs font-semibold text-muted">Certificates</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Image Slider Card */}
          <div
            className="lg:col-span-6 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Slider Container Box */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-border bg-card shadow-xl group">
              {/* Slide Media Area */}
              <div className="relative h-72 sm:h-96 md:h-[420px] w-full overflow-hidden bg-black">
                {SLIDES.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      idx === currentSlide ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                    }`}
                  >
                    {/* Background Slide Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700"
                    />

                    {/* Dark Vignette Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                    {/* Top Floating Badge */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-extrabold tracking-wide shadow-sm">
                        {slide.badge}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium border border-white/20">
                        {slide.category}
                      </span>
                    </div>

                    {/* Bottom Content Banner */}
                    <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 z-20 space-y-2 text-white">
                      <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight drop-shadow-sm">
                        {slide.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed max-w-lg drop-shadow-sm">
                        {slide.description}
                      </p>
                      <div className="pt-2">
                        <Link
                          href={slide.link}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-highlight hover:underline"
                        >
                          <span>Explore Track Details</span>
                          <HiOutlineArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider Bottom Controls Bar */}
              <div className="p-4 bg-card border-t border-border flex items-center justify-between gap-4">
                {/* Dot / Pill Indicators */}
                <div className="flex items-center gap-2">
                  {SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentSlide
                          ? "w-8 bg-primary dark:bg-highlight"
                          : "w-2 bg-border hover:bg-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Counter & Arrow Navigation */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-muted">
                    0{currentSlide + 1} / 0{SLIDES.length}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous slide"
                      className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer"
                    >
                      <HiOutlineChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next slide"
                      className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer"
                    >
                      <HiOutlineChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
