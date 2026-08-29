"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowPath,
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
} from "react-icons/hi2";

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    category: "Algorithms & Complexity",
    prompt: "What is the amortized time complexity of inserting N elements into a dynamic array (like std::vector) starting from an empty state?",
    options: ["O(1) amortized per insert (O(N) total)", "O(log N) per insert", "O(N) per insert", "O(N log N) total"],
    correctIndex: 0,
    explanation: "Because capacity doubles upon reaching capacity, the total copying work forms a geometric series 1 + 2 + 4 + ... + N = 2N - 1 = O(N) for N insertions, yielding O(1) amortized cost per push.",
  },
  {
    id: 2,
    category: "Graph Theory",
    prompt: "Which algorithm finds the single-source shortest path on a weighted directed graph with non-negative edge weights in O((V + E) log V) time?",
    options: ["Floyd-Warshall Algorithm", "Dijkstra's Algorithm with Min-Heap", "Breadth-First Search (BFS)", "Bellman-Ford Algorithm"],
    correctIndex: 1,
    explanation: "Dijkstra's algorithm with a binary priority queue extracts each vertex min-distance in O(log V) and relaxes each edge in O(log V), yielding O((V + E) log V).",
  },
  {
    id: 3,
    category: "Dynamic Programming",
    prompt: "What is the standard time complexity to find the Longest Common Subsequence (LCS) of two strings of lengths N and M?",
    options: ["O(N + M)", "O(N * M)", "O(2^(N+M))", "O(N log M)"],
    correctIndex: 1,
    explanation: "Using a 2D dynamic programming table dp[i][j] representing the LCS of prefixes, each state is computed in O(1) time across N * M states.",
  },
];

export function QuizPreviewSection() {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQ = SAMPLE_QUESTIONS[qIndex];
  const isCorrect = selectedOption === currentQ.correctIndex;

  const handleOptionSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setQIndex((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
  };

  return (
    <section className="py-16 md:py-24 bg-surface border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Explanatory Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-xs font-bold text-secondary">
              <HiOutlineAcademicCap className="w-4 h-4" />
              <span>Interactive Quiz Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Test Your Mastery with Instant Server Auto-Grading
            </h2>

            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Every course module is paired with timed diagnostic evaluations. Get immediate verification, scorecards, and step-by-step algorithmic explanations.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  Zero client-side answer leakage (Strict server evaluation)
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  Detailed mathematical and code solution breakdowns
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  Synchronized scorecard tracking on your student dashboard
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button href="/courses" variant="primary" size="md" className="font-bold text-xs">
                <span>Explore Verified Quizzes</span>
                <HiOutlineArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right Column: Live Interactive Quiz Preview Widget */}
          <div className="lg:col-span-7">
            <Card className="bg-card border-2 border-border shadow-lg overflow-hidden">
              {/* Card Header */}
              <CardHeader className="bg-surface/80 border-b border-border py-4 px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      Interactive Demonstration
                    </Badge>
                    <span className="text-xs font-semibold text-muted">
                      {currentQ.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-secondary">
                    Q 0{qIndex + 1} of 0{SAMPLE_QUESTIONS.length}
                  </span>
                </div>
              </CardHeader>

              {/* Card Body */}
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Question Prompt */}
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {currentQ.prompt}
                </h3>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    let optionStyles = "bg-surface border-border text-foreground hover:border-primary/50";

                    if (isSubmitted) {
                      if (optIdx === currentQ.correctIndex) {
                        optionStyles = "bg-secondary/15 border-secondary text-secondary font-bold";
                      } else if (selectedOption === optIdx) {
                        optionStyles = "bg-red-500/15 border-red-500 text-red-500 font-bold";
                      } else {
                        optionStyles = "bg-surface/50 border-border text-muted opacity-60";
                      }
                    } else if (selectedOption === optIdx) {
                      optionStyles = "bg-primary/10 border-primary text-primary dark:text-highlight font-bold shadow-xs";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(optIdx)}
                        className={`w-full p-3.5 rounded-xl text-left text-xs sm:text-sm transition-all border flex items-center justify-between gap-3 cursor-pointer ${optionStyles}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-card border border-border flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isSubmitted && optIdx === currentQ.correctIndex && (
                          <HiOutlineCheckCircle className="w-5 h-5 text-secondary shrink-0" />
                        )}
                        {isSubmitted && selectedOption === optIdx && optIdx !== currentQ.correctIndex && (
                          <HiOutlineXCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card upon submit */}
                {isSubmitted && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      isCorrect
                        ? "bg-secondary/10 border-secondary/30 text-foreground"
                        : "bg-red-500/10 border-red-500/30 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {isCorrect ? (
                        <span className="text-secondary">✓ Correct Solution!</span>
                      ) : (
                        <span className="text-red-500">✕ Incorrect Choice</span>
                      )}
                    </div>
                    <p className="leading-relaxed text-muted">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted">
                    {isSubmitted ? "Evaluated in 24ms" : "Select an option and submit to verify"}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isSubmitted ? (
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                        variant="primary"
                        size="sm"
                        className="text-xs font-bold"
                      >
                        Check Answer
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleNext}
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold gap-1.5"
                      >
                        <HiOutlineArrowPath className="w-3.5 h-3.5" />
                        <span>Next Question →</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
