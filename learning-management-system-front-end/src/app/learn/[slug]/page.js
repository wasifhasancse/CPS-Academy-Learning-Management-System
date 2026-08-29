"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { api } from "@/lib/api";
import {
  HiOutlinePlay,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineLockClosed,
  HiOutlineQuestionMarkCircle,
  HiOutlineSparkles,
} from "react-icons/hi2";

function extractYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function CoursePlayerPage({ params }) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug;
  const slug = rawSlug ? decodeURIComponent(rawSlug).trim() : "";
  const router = useRouter();

  const { user, role, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [activeItem, setActiveItem] = useState(null); // { type: 'lesson' | 'quiz', data: object, moduleIndex: number }
  const [completedItemIds, setCompletedItemIds] = useState(new Set());
  const [expandedModules, setExpandedModules] = useState(new Set([0])); // First module open by default
  const [activeTab, setActiveTab] = useState("overview"); // overview, notes, resources
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Quiz Runner States
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // 1. Fetch Course and Curriculum
  useEffect(() => {
    async function loadCoursePlayer() {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let foundCourse = null;
        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

        // Direct fetch
        const directRes = await api
          .get(
            `/courses/${encodeURIComponent(slug)}?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[category]=*&populate[instructor]=*&populate[enrollments][populate]=student`,
            { token }
          )
          .catch(() => null);

        if (directRes?.data && !Array.isArray(directRes.data)) {
          foundCourse = directRes.data;
        }

        // List fallback
        if (!foundCourse) {
          const listRes = await api
            .get(
              `/courses?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[category]=*&populate[instructor]=*&populate[enrollments][populate]=student`,
              { token }
            )
            .catch(() => null);

          const allCourses = Array.isArray(listRes?.data) ? listRes.data : [];
          foundCourse =
            allCourses.find((c) => {
              if (!c) return false;
              const cSlug = (c.slug || "").toLowerCase();
              const cTitleSlug = (c.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
              const cDocId = (c.documentId || "").toLowerCase();
              const cId = String(c.id || "").toLowerCase();
              const target = slug.toLowerCase();

              return (
                cSlug === target ||
                cSlug === normalizedSlug ||
                cDocId === target ||
                cId === target ||
                cTitleSlug === normalizedSlug ||
                cTitleSlug === target
              );
            }) || null;
        }

        if (foundCourse) {
          setCourse(foundCourse);

          // Build sequential timeline
          const timeline = [];
          (foundCourse.modules || []).forEach((m, mIdx) => {
            (m.lessons || []).forEach((l) => {
              timeline.push({ type: "lesson", data: l, moduleIndex: mIdx, moduleId: m.id || m.documentId });
            });
          });
          (foundCourse.quizzes || []).forEach((q) => {
            timeline.push({ type: "quiz", data: q, moduleIndex: 0, moduleId: "quizzes" });
          });

          if (timeline.length > 0) {
            setActiveItem(timeline[0]);
          }

          // Expand all modules by default for easier discovery
          const allModuleIndices = new Set((foundCourse.modules || []).map((_, idx) => idx));
          setExpandedModules(allModuleIndices);

          // Check Access Authorization
          const isStaff = ["Admin", "admin", "Content Manager", "content_manager", "Instructor", "instructor"].includes(role);
          if (!isStaff && user?.id && Array.isArray(foundCourse.enrollments) && foundCourse.enrollments.length > 0) {
            const isEnrolled = foundCourse.enrollments.some(
              (e) =>
                e.student?.id === user.id ||
                e.student?.documentId === user.documentId ||
                e.student === user.id ||
                e.student?.email === user.email
            );
            if (!isEnrolled && Number(foundCourse.price || 0) > 0) {
              setAccessDenied(true);
            }
          }
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error("Failed to load course player:", err);
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (!isAuthLoading) {
      loadCoursePlayer();
    }
  }, [slug, user, role, token, isAuthLoading]);

  // Build complete sequential curriculum list
  const curriculumTimeline = [];
  (course?.modules || []).forEach((m, mIdx) => {
    (m.lessons || []).forEach((l) => {
      curriculumTimeline.push({
        id: `lesson-${l.documentId || l.id}`,
        type: "lesson",
        data: l,
        moduleIndex: mIdx,
        moduleTitle: m.title,
      });
    });
  });
  (course?.quizzes || []).forEach((q) => {
    curriculumTimeline.push({
      id: `quiz-${q.documentId || q.id}`,
      type: "quiz",
      data: q,
      moduleIndex: (course?.modules || []).length,
      moduleTitle: "Diagnostic Evaluation",
    });
  });

  const currentTimelineIndex = curriculumTimeline.findIndex(
    (item) =>
      item.type === activeItem?.type &&
      (item.data?.documentId || item.data?.id) === (activeItem?.data?.documentId || activeItem?.data?.id)
  );

  const prevItem = currentTimelineIndex > 0 ? curriculumTimeline[currentTimelineIndex - 1] : null;
  const nextItem = currentTimelineIndex >= 0 && currentTimelineIndex < curriculumTimeline.length - 1 ? curriculumTimeline[currentTimelineIndex + 1] : null;

  // Toggle Module Accordion
  const toggleModuleAccordion = (mIdx) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(mIdx)) {
        next.delete(mIdx);
      } else {
        next.add(mIdx);
      }
      return next;
    });
  };

  // Toggle Item Completion & Sync Progress
  const markCurrentItemComplete = async (itemId) => {
    const nextSet = new Set(completedItemIds);
    nextSet.add(itemId);
    setCompletedItemIds(nextSet);

    // Calculate percentage
    const totalCount = curriculumTimeline.length;
    const progressPercent = totalCount > 0 ? Math.round((nextSet.size / totalCount) * 100) : 0;

    // Advance to next sequential item if available
    if (nextItem) {
      setActiveItem(nextItem);
      setSelectedAnswers({});
      setQuizSubmitted(false);
      // Auto expand the module of the next item
      if (nextItem.moduleIndex !== undefined) {
        setExpandedModules((prev) => new Set([...prev, nextItem.moduleIndex]));
      }
    }
  };

  // Handle Quiz Submission
  const handleQuizSubmit = () => {
    if (!activeItem || activeItem.type !== "quiz") return;
    const questions = activeItem.data?.questions || [];
    let correctCount = 0;

    questions.forEach((q) => {
      const selected = selectedAnswers[q.id || q.documentId];
      if (selected !== undefined && Number(selected) === Number(q.correctAnswer)) {
        correctCount += 1;
      }
    });

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;
    setQuizScore(score);
    setQuizSubmitted(true);

    const passingScore = activeItem.data?.passingScore || 80;
    if (score >= passingScore) {
      markCurrentItemComplete(`quiz-${activeItem.data.documentId || activeItem.data.id}`);
    }
  };

  const totalItemsCount = curriculumTimeline.length;
  const completedItemsCount = completedItemIds.size;
  const overallProgress = totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  if (isLoading || isAuthLoading) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted">Loading syllabus and video lessons...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Course Not Found</h2>
        <p className="text-sm text-muted">
          The curriculum you are trying to view does not exist or has been removed.
        </p>
        <Button href="/courses" variant="primary" size="md">
          ← Back to Course Catalog
        </Button>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>
        <h2 className="text-2xl font-bold text-foreground">Enrollment Required</h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          You must be enrolled in <strong>{course.title}</strong> to access video lessons and learning checkpoints.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button href={`/courses/${encodeURIComponent(course.slug || slug)}`} variant="primary" size="md">
            Go to Course Enrollment Page
          </Button>
        </div>
      </div>
    );
  }

  const isVideoLesson = activeItem?.type === "lesson";
  const isQuizItem = activeItem?.type === "quiz";
  const youtubeVideoId = isVideoLesson ? extractYouTubeId(activeItem?.data?.videoUrl) : null;
  const currentActiveId = activeItem ? `${activeItem.type}-${activeItem.data?.documentId || activeItem.data?.id}` : "";
  const isCurrentComplete = completedItemIds.has(currentActiveId);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Navigation & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button href="/dashboard/student/courses" variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>My Courses</span>
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground line-clamp-1">
              {course.title}
            </h1>
            <p className="text-xs text-muted">
              {course.category?.name || "Track"} • {course.modules?.length || 0} Modules • {totalItemsCount} Total Learning Units
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {completedItemsCount} / {totalItemsCount} Completed
              </span>
              <span className="font-extrabold text-secondary">({overallProgress}%)</span>
            </div>
            <div className="w-36">
              <ProgressBar progress={overallProgress} />
            </div>
          </div>
          <Button href={`/courses/${encodeURIComponent(course.slug || slug)}`} variant="secondary" size="sm" className="text-xs">
            Course Overview
          </Button>
        </div>
      </div>

      {/* Course Completion Banner */}
      {overallProgress === 100 && (
        <div className="p-4 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HiOutlineSparkles className="w-6 h-6 text-secondary shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-foreground">Congratulations! You&apos;ve Completed this Course!</h4>
              <p className="text-xs text-muted">All modules, lessons, and diagnostic quizzes are 100% completed.</p>
            </div>
          </div>
          <Button href="/dashboard/student/courses" variant="primary" size="sm">
            View Certificate Summary
          </Button>
        </div>
      )}

      {/* Main Grid: Video Player / Quiz Engine + Reference Curriculum Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Main Player & Stage */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Stage View */}
          {isVideoLesson ? (
            /* 16:9 Video Player */
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-border shadow-sm">
              {youtubeVideoId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&enablejsapi=1`}
                  title={activeItem?.data?.title || "Lesson Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#091413]">
                  <HiOutlineAcademicCap className="w-12 h-12 text-secondary" />
                  <h3 className="text-base font-bold text-foreground">
                    {activeItem?.data?.title || "Video Lesson"}
                  </h3>
                  <p className="text-xs text-muted max-w-sm">
                    {activeItem?.data?.content || "Lesson content and video material are ready for practice."}
                  </p>
                </div>
              )}
            </div>
          ) : isQuizItem ? (
            /* Interactive Quiz Runner Stage */
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="bg-surface/60 border-b border-border py-4 px-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Badge variant="primary" size="sm">
                      Quiz Checkpoint
                    </Badge>
                    <CardTitle className="text-lg font-bold text-foreground mt-1">
                      {activeItem?.data?.title || "Course Checkpoint Quiz"}
                    </CardTitle>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <span>Passing Score: </span>
                    <strong className="text-foreground">{activeItem?.data?.passingScore || 80}%</strong>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {(activeItem?.data?.questions || []).length === 0 ? (
                  <div className="py-12 text-center space-y-2 text-muted">
                    <HiOutlineQuestionMarkCircle className="w-10 h-10 mx-auto text-muted" />
                    <p className="text-sm font-semibold text-foreground">No questions attached to this quiz checkpoint.</p>
                    <p className="text-xs">You may mark this checkpoint complete to advance.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeItem.data.questions.map((q, qIdx) => {
                      const qId = q.id || q.documentId || qIdx;
                      const selected = selectedAnswers[qId];
                      const isCorrect = Number(selected) === Number(q.correctAnswer);

                      return (
                        <div key={qId} className="p-4 rounded-xl bg-surface border border-border space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="font-mono font-bold text-xs text-secondary mt-0.5">
                              {qIdx + 1}.
                            </span>
                            <h4 className="text-sm font-bold text-foreground leading-snug">
                              {q.prompt || q.title || `Question ${qIdx + 1}`}
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {(Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"]).map((opt, optIdx) => {
                              const isOptionSelected = Number(selected) === optIdx;

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }))}
                                  className={`p-3 rounded-lg text-left text-xs font-medium transition-all border cursor-pointer ${
                                    isOptionSelected
                                      ? "bg-secondary/15 border-secondary text-foreground font-semibold ring-1 ring-secondary"
                                      : "bg-card border-border hover:bg-surface/80 text-foreground"
                                  } ${quizSubmitted && optIdx === Number(q.correctAnswer) ? "!bg-green-500/15 !border-green-600 !text-green-700 dark:!text-green-300" : ""}`}
                                >
                                  <span className="font-mono text-muted mr-2">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span>{typeof opt === "string" ? opt : opt.text || `Option ${optIdx + 1}`}</span>
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && q.explanation && (
                            <div className="p-3 rounded-lg bg-surface/80 border border-border text-xs text-muted">
                              <strong className="text-foreground">Explanation: </strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {quizSubmitted && (
                      <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted">Your Score:</p>
                          <p className="text-xl font-black text-foreground">
                            {quizScore}%{" "}
                            <span className={quizScore >= (activeItem.data.passingScore || 80) ? "text-green-600 font-bold text-sm" : "text-red-500 font-bold text-sm"}>
                              {quizScore >= (activeItem.data.passingScore || 80) ? "(PASSED)" : "(RETRY RECOMMENDED)"}
                            </span>
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setQuizSubmitted(false);
                            setSelectedAnswers({});
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Retake Quiz
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Player Sequential Controls Bar */}
          <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                {isVideoLesson ? "Current Lesson" : "Current Checkpoint"}
              </span>
              <h2 className="text-base font-bold text-foreground">
                {activeItem?.data?.title || "Welcome to the Track"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {prevItem && (
                <Button
                  onClick={() => {
                    setActiveItem(prevItem);
                    setSelectedAnswers({});
                    setQuizSubmitted(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="p-2.5"
                >
                  <HiOutlineChevronLeft className="w-4 h-4" />
                </Button>
              )}

              {isVideoLesson ? (
                <Button
                  onClick={() => markCurrentItemComplete(currentActiveId)}
                  variant={isCurrentComplete ? "secondary" : "primary"}
                  size="sm"
                  className="text-xs gap-1.5 font-bold"
                >
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  <span>{isCurrentComplete ? "Completed ✓" : "Mark Complete & Next →"}</span>
                </Button>
              ) : isQuizItem ? (
                !quizSubmitted ? (
                  <Button
                    onClick={handleQuizSubmit}
                    variant="primary"
                    size="sm"
                    className="text-xs font-bold"
                  >
                    Submit Quiz Attempt →
                  </Button>
                ) : (
                  <Button
                    onClick={() => markCurrentItemComplete(currentActiveId)}
                    variant="primary"
                    size="sm"
                    className="text-xs font-bold"
                  >
                    Continue to Next Lesson →
                  </Button>
                )
              ) : null}

              {nextItem && isCurrentComplete && (
                <Button
                  onClick={() => {
                    setActiveItem(nextItem);
                    setSelectedAnswers({});
                    setQuizSubmitted(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="p-2.5"
                >
                  <HiOutlineChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Lesson Details & Notes */}
          {isVideoLesson && (
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-5 border-b border-border bg-surface/50">
                <div className="flex gap-4 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                      activeTab === "overview" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-foreground"
                    }`}
                  >
                    Lesson Notes & Practice
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-5 text-sm text-muted leading-relaxed space-y-3">
                <p>
                  {activeItem?.data?.content ||
                    "Review the foundational topics covered in this lesson. Practice with the problem sets to build mastery."}
                </p>
                {activeItem?.data?.duration && (
                  <p className="text-xs text-muted">
                    Estimated Duration: <strong className="text-foreground">{activeItem.data.duration}</strong>
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: Course Syllabus Accordion (Matching Reference Image 2) */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card border-border overflow-hidden shadow-sm">
            <CardHeader className="py-4 px-5 bg-surface border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle as="h3" className="text-sm font-bold text-foreground flex items-center gap-2">
                  <HiOutlineBookOpen className="w-4 h-4 text-secondary" />
                  <span>কোর্স সিলেবাস (Course Syllabus)</span>
                </CardTitle>
                <span className="text-xs text-muted font-medium">
                  {course.modules?.length || 0} Modules
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-border/60 max-h-[750px] overflow-y-auto">
              {(course.modules || []).map((mod, mIdx) => {
                const isExpanded = expandedModules.has(mIdx);
                const lessons = mod.lessons || [];

                return (
                  <div key={mod.documentId || mod.id || mIdx} className="bg-card">
                    {/* Module Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleModuleAccordion(mIdx)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-surface/60 transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5 pr-2">
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">
                          {mod.title || `Module ${mIdx + 1}`}
                        </h4>
                        <p className="text-[11px] text-muted">
                          {lessons.length}টি ভিডিও ({lessons.length} Lessons)
                        </p>
                      </div>
                      <div className="text-muted shrink-0">
                        {isExpanded ? (
                          <HiOutlineChevronUp className="w-4 h-4" />
                        ) : (
                          <HiOutlineChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {/* Connected Tree Timeline (Matching Image 2 Reference) */}
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1">
                        <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/80">
                          {lessons.map((lesson, lIdx) => {
                            const itemId = `lesson-${lesson.documentId || lesson.id}`;
                            const isSelected =
                              activeItem?.type === "lesson" &&
                              (activeItem.data?.documentId || activeItem.data?.id) === (lesson.documentId || lesson.id);
                            const isComplete = completedItemIds.has(itemId);

                            return (
                              <div key={lesson.documentId || lesson.id || lIdx} className="relative flex items-center">
                                {/* Timeline Step Node Icon */}
                                <div
                                  className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-colors ${
                                    isComplete
                                      ? "bg-secondary text-white ring-2 ring-background"
                                      : isSelected
                                      ? "bg-amber-500 text-white ring-2 ring-background animate-pulse"
                                      : "bg-surface border-2 border-border text-muted"
                                  }`}
                                >
                                  {isComplete ? (
                                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <HiOutlinePlay className="w-2.5 h-2.5" />
                                  )}
                                </div>

                                {/* Step Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveItem({ type: "lesson", data: lesson, moduleIndex: mIdx });
                                    setSelectedAnswers({});
                                    setQuizSubmitted(false);
                                  }}
                                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                    isSelected
                                      ? "bg-secondary text-white font-semibold shadow-xs"
                                      : "hover:bg-surface text-foreground"
                                  }`}
                                >
                                  <span className="truncate">{lesson.title}</span>
                                  {lesson.duration && (
                                    <span className={`text-[10px] shrink-0 ${isSelected ? "text-white/80" : "text-muted"}`}>
                                      {lesson.duration}
                                    </span>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Course Quizzes in Curriculum Tree */}
              {(course.quizzes || []).length > 0 && (
                <div className="bg-card">
                  <div className="px-4 py-3 border-t border-border bg-surface/30">
                    <h4 className="text-xs font-bold text-foreground">
                      কোর্স কুইজ ও মূল্যায়ন (Course Quizzes)
                    </h4>
                    <p className="text-[11px] text-muted">
                      {course.quizzes.length} Diagnostic Evaluations
                    </p>
                  </div>

                  <div className="px-4 py-2">
                    <div className="relative pl-6 space-y-2.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/80">
                      {course.quizzes.map((quiz, qIdx) => {
                        const itemId = `quiz-${quiz.documentId || quiz.id}`;
                        const isSelected =
                          activeItem?.type === "quiz" &&
                          (activeItem.data?.documentId || activeItem.data?.id) === (quiz.documentId || quiz.id);
                        const isComplete = completedItemIds.has(itemId);

                        return (
                          <div key={quiz.id || qIdx} className="relative flex items-center">
                            <div
                              className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-colors ${
                                isComplete
                                  ? "bg-secondary text-white ring-2 ring-background"
                                  : isSelected
                                  ? "bg-amber-500 text-white ring-2 ring-background animate-pulse"
                                  : "bg-surface border-2 border-border text-muted"
                              }`}
                            >
                              {isComplete ? (
                                <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <HiOutlineAcademicCap className="w-2.5 h-2.5" />
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveItem({ type: "quiz", data: quiz, moduleIndex: (course.modules || []).length });
                                setSelectedAnswers({});
                                setQuizSubmitted(false);
                              }}
                              className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? "bg-secondary text-white font-semibold shadow-xs"
                                  : "hover:bg-surface text-foreground"
                              }`}
                            >
                              <span className="truncate">Checkpoint: {quiz.title}</span>
                              <span className={`text-[10px] shrink-0 ${isSelected ? "text-white/80" : "text-muted"}`}>
                                {quiz.questions?.length || 0} Qs
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
