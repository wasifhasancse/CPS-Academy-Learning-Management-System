"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  HiOutlineChevronDown,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi2";

const FAQ_ITEMS = [
  {
    category: "Enrollment & Access",
    question: "Do I get lifetime access to the courses I enroll in?",
    answer: "Yes! Once you enroll in any CPS Academy course via Stripe, you receive unlimited lifetime access to all current and future video lectures, module updates, code templates, and quiz evaluations for that course.",
  },
  {
    category: "Quizzes & Certificates",
    question: "How does the quiz evaluation and scoring work?",
    answer: "All quizzes on CPS Academy are graded automatically on the server with zero client answer leakage. Upon submission, you immediately receive a verified percentage scorecard with visual review highlighting your mistakes and correct solutions.",
  },
  {
    category: "Enrollment & Access",
    question: "Can I preview lessons before paying for a course?",
    answer: "Yes, instructors mark introductory foundation lessons as Free Preview. You can watch and read free preview lessons without needing an active course enrollment.",
  },
  {
    category: "Quizzes & Certificates",
    question: "Do I receive a certificate upon finishing a course?",
    answer: "Yes, completing 100% of curriculum units (all video/text lessons and passing all diagnostic quizzes) automatically qualifies you for a verified completion status on your student dashboard.",
  },
  {
    category: "Instructors & Mentorship",
    question: "How can I ask questions if I get stuck on a problem?",
    answer: "Every course has direct mentor and instructor contact information. You can also review lesson notes, solution code snippets, and collaborative discussion points inside the learning player tray.",
  },
  {
    category: "Instructors & Mentorship",
    question: "How do I become an instructor on CPS Academy?",
    answer: "You can sign up as an instructor through our registration portal. Once authorized by the admin team, you can build courses, upload video/text modules, author quiz question banks, and track enrolled student progress.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Enrollment & Access", "Quizzes & Certificates", "Instructors & Mentorship"];

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 md:py-24 bg-background border-b border-border">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="highlight" size="sm">
            Got Questions?
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted">
            Everything you need to know about our learning tracks, evaluations, and enrollments.
          </p>
        </div>

        {/* FAQ Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#309255] text-white shadow-sm"
                  : "bg-surface border border-border text-muted hover:text-[#309255] hover:bg-[#E7F8EE]/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl bg-surface border overflow-hidden transition-all duration-200 ${
                  isOpen ? "border-[#309255]/40 shadow-xs" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-card/50 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-foreground leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-card border flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 text-[#309255] bg-[#E7F8EE] dark:bg-[#E7F8EE]/20 border-[#309255]"
                        : "text-muted border-border"
                    }`}
                  >
                    <HiOutlineChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-muted leading-relaxed border-t border-border/50 bg-card/30">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
