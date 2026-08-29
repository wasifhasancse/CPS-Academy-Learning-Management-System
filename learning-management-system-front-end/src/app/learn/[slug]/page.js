"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CoursePlayerSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import {
  HiOutlineAcademicCap,
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineBookOpen,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronUp,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlinePlay,
  HiOutlineQuestionMarkCircle,
  HiOutlineTrophy,
  HiOutlineXCircle,
  HiOutlineXMark,
} from "react-icons/hi2";

function extractYouTubeId(url) {
  if (!url) return null;
  const str = String(url).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = str.match(regExp);
  return match && match[1] ? match[1] : null;
}

export default function CoursePlayerPage({ params }) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug;
  const slug = rawSlug ? decodeURIComponent(rawSlug).trim() : "";
  const router = useRouter();

  const {
    user,
    role,
    token,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth();

  const [course, setCourse] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [completedItemIds, setCompletedItemIds] = useState(new Set());
  const [storedQuizAttempts, setStoredQuizAttempts] = useState({}); // { [quizKey]: attemptObj }
  const [expandedModules, setExpandedModules] = useState(new Set([0]));
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  // Authoritative percentage from the Enrollment record — same value shown on every dashboard.
  const [enrollmentProgress, setEnrollmentProgress] = useState(null);

  // Quiz Runner States
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Helper to retrieve saved attempt from state or localStorage
  const getSavedAttemptForQuiz = useCallback(
    (quizData) => {
      if (!quizData) return null;
      const docId = quizData.documentId ? String(quizData.documentId) : null;
      const numId = quizData.id !== undefined ? String(quizData.id) : null;
      const qSlug = quizData.slug ? String(quizData.slug) : null;

      // 1. Check in-memory attempts map
      if (docId && storedQuizAttempts[docId]) return storedQuizAttempts[docId];
      if (numId && storedQuizAttempts[numId]) return storedQuizAttempts[numId];
      if (qSlug && storedQuizAttempts[qSlug]) return storedQuizAttempts[qSlug];

      // 2. Check local storage fallback
      if (typeof window !== "undefined") {
        const keysToCheck = [
          `cps_quiz_attempt_${user?.id || "guest"}_${docId}`,
          `cps_quiz_attempt_${user?.id || "guest"}_${numId}`,
          `cps_quiz_attempt_${user?.id || "guest"}_${qSlug}`,
        ];

        for (const k of keysToCheck) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === "object") return parsed;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      return null;
    },
    [storedQuizAttempts, user?.id],
  );

  // Synchronize Active Item State (Restores submitted answers and score automatically)
  const syncItemState = useCallback(
    (item) => {
      if (!item) return;
      if (item.type === "quiz") {
        const savedAttempt = getSavedAttemptForQuiz(item.data);
        if (savedAttempt) {
          const answers =
            savedAttempt.submittedAnswers || savedAttempt.answers || {};
          setSelectedAnswers(answers);
          setQuizScore(
            savedAttempt.score !== undefined ? Number(savedAttempt.score) : 0,
          );
          setQuizSubmitted(true);
        } else {
          setSelectedAnswers({});
          setQuizSubmitted(false);
          setQuizScore(0);
        }
      } else {
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
      }
    },
    [getSavedAttemptForQuiz],
  );

  // 1. Fetch Course, Curriculum & Persisted Progress
  useEffect(() => {
    async function loadCoursePlayer() {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let foundCourse = null;
        const normalizedSlug = slug
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        // Direct fetch
        const directRes = await api
          .get(
            `/courses/${encodeURIComponent(slug)}?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[category]=*&populate[instructor]=*&populate[enrollments][populate]=student`,
            { token },
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
              { token },
            )
            .catch(() => null);

          const allCourses = Array.isArray(listRes?.data) ? listRes.data : [];
          foundCourse =
            allCourses.find((c) => {
              if (!c) return false;
              const cSlug = (c.slug || "").toLowerCase();
              const cTitleSlug = (c.title || "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
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
              timeline.push({
                type: "lesson",
                data: l,
                moduleIndex: mIdx,
                moduleId: m.id || m.documentId,
              });
            });
          });
          (foundCourse.quizzes || []).forEach((q) => {
            timeline.push({
              type: "quiz",
              data: q,
              moduleIndex: (foundCourse.modules || []).length,
              moduleId: "quizzes",
            });
          });

          // Expand all modules by default
          const allModuleIndices = new Set(
            (foundCourse.modules || []).map((_, idx) => idx),
          );
          setExpandedModules(allModuleIndices);

          // Load Persisted Progress from Backend & LocalStorage
          const initialCompleted = new Set();
          const attemptsMap = {};
          const targetCourseId = foundCourse.id || foundCourse.documentId;
          const storageKey = `cps_completed_items_${user?.id || "guest"}_${targetCourseId}`;

          if (typeof window !== "undefined") {
            try {
              const localSaved = JSON.parse(
                localStorage.getItem(storageKey) || "[]",
              );
              if (Array.isArray(localSaved)) {
                localSaved.forEach((id) => initialCompleted.add(id));
              }
            } catch (e) {
              console.error("Failed to parse local storage progress:", e);
            }
          }

          if (token && user?.id) {
            try {
              const [progressRes, attemptsRes, enrollsRes] = await Promise.all([
                api.get("/progresses", { token }).catch(() => ({ data: [] })),
                api
                  .get("/quiz-attempts", { token })
                  .catch(() => ({ data: [] })),
                api.get("/enrollments", { token }).catch(() => ({ data: [] })),
              ]);

              const progressList = Array.isArray(progressRes?.data)
                ? progressRes.data
                : [];
              progressList.forEach((p) => {
                if (p.isCompleted && p.lesson) {
                  initialCompleted.add(
                    `lesson-${p.lesson.documentId || p.lesson.id}`,
                  );
                }
              });

              const attemptsList = Array.isArray(attemptsRes?.data)
                ? attemptsRes.data
                : [];
              attemptsList.forEach((a) => {
                if (a.quiz) {
                  const qDocId = a.quiz.documentId;
                  const qNumId = String(a.quiz.id);
                  const qSlug = a.quiz.slug;

                  if (qDocId) attemptsMap[qDocId] = a;
                  if (qNumId) attemptsMap[qNumId] = a;
                  if (qSlug) attemptsMap[qSlug] = a;

                  if (a.passed) {
                    initialCompleted.add(`quiz-${qDocId || qNumId}`);
                  }
                }
              });

              // Same authoritative value the Student/Instructor/Manager/Admin dashboards read.
              const enrollsList = Array.isArray(enrollsRes?.data)
                ? enrollsRes.data
                : [];
              const matchingEnrollment = enrollsList.find((e) => {
                const eCourseId = e.course?.id;
                const eCourseDocId = e.course?.documentId;
                return (
                  (eCourseId !== undefined &&
                    String(eCourseId) === String(targetCourseId)) ||
                  (eCourseDocId &&
                    eCourseDocId ===
                      (foundCourse.documentId || String(targetCourseId)))
                );
              });
              if (matchingEnrollment) {
                setEnrollmentProgress(
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(matchingEnrollment.progressPercentage || 0),
                    ),
                  ),
                );
              }
            } catch (err) {
              console.warn("Backend progress loading error:", err);
            }
          }

          setCompletedItemIds(initialCompleted);
          setStoredQuizAttempts(attemptsMap);

          if (timeline.length > 0) {
            const firstItem = timeline[0];
            setActiveItem(firstItem);
            if (firstItem.type === "quiz") {
              const qKey = firstItem.data?.documentId || firstItem.data?.id;
              const prevAttempt =
                attemptsMap[qKey] ||
                attemptsMap[String(firstItem.data?.id)] ||
                attemptsMap[firstItem.data?.slug];
              if (prevAttempt) {
                setSelectedAnswers(
                  prevAttempt.submittedAnswers || prevAttempt.answers || {},
                );
                setQuizScore(
                  prevAttempt.score !== undefined ? prevAttempt.score : 0,
                );
                setQuizSubmitted(true);
              }
            }
          }

          // Check Access Authorization
          const isStaff = [
            "Admin",
            "admin",
            "Content Manager",
            "content_manager",
            "Instructor",
            "instructor",
          ].includes(role);
          if (!isStaff) {
            let isEnrolled = false;
            if (token) {
              const enrollsRes = await api
                .get("/enrollments", { token })
                .catch(() => ({ data: [] }));
              const myEnrolls = Array.isArray(enrollsRes?.data)
                ? enrollsRes.data
                : [];
              isEnrolled = myEnrolls.some((e) => {
                const c = e.course;
                if (!c) return false;
                const cSlug = (c.slug || "").toLowerCase();
                const cDocId = (c.documentId || "").toLowerCase();
                const cId = String(c.id || "").toLowerCase();
                const targetSlug = (foundCourse.slug || slug).toLowerCase();
                const targetDocId = (
                  foundCourse.documentId || ""
                ).toLowerCase();
                const targetId = String(foundCourse.id || "").toLowerCase();
                return (
                  cSlug === targetSlug ||
                  cDocId === targetDocId ||
                  cId === targetId
                );
              });
            }
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
      (item.data?.documentId || item.data?.id) ===
        (activeItem?.data?.documentId || activeItem?.data?.id),
  );

  const prevItem =
    currentTimelineIndex > 0
      ? curriculumTimeline[currentTimelineIndex - 1]
      : null;
  const nextItem =
    currentTimelineIndex >= 0 &&
    currentTimelineIndex < curriculumTimeline.length - 1
      ? curriculumTimeline[currentTimelineIndex + 1]
      : null;

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

  // Switch Active Item and Restore Its State
  const handleSelectActiveItem = (item) => {
    setActiveItem(item);
    syncItemState(item);
  };

  // Re-fetch the same authoritative percentage the dashboards read, right after it changes.
  const refreshEnrollmentProgress = useCallback(async () => {
    if (!token || !user?.id || !course) return;
    const targetCourseId = course?.id || course?.documentId;
    try {
      const enrollsRes = await api
        .get("/enrollments", { token })
        .catch(() => ({ data: [] }));
      const enrollsList = Array.isArray(enrollsRes?.data)
        ? enrollsRes.data
        : [];
      const matchingEnrollment = enrollsList.find((e) => {
        const eCourseId = e.course?.id;
        const eCourseDocId = e.course?.documentId;
        return (
          (eCourseId !== undefined &&
            String(eCourseId) === String(targetCourseId)) ||
          (eCourseDocId &&
            eCourseDocId === (course.documentId || String(targetCourseId)))
        );
      });
      if (matchingEnrollment) {
        setEnrollmentProgress(
          Math.min(
            100,
            Math.max(0, Number(matchingEnrollment.progressPercentage || 0)),
          ),
        );
      }
    } catch (err) {
      console.warn("Enrollment progress refresh error:", err);
    }
  }, [token, user?.id, course]);

  // Persist Item Completion
  const markCurrentItemComplete = async (itemId, itemObject = activeItem) => {
    const nextSet = new Set(completedItemIds);
    nextSet.add(itemId);
    setCompletedItemIds(nextSet);

    // Save to LocalStorage
    const targetCourseId = course?.id || course?.documentId;
    const storageKey = `cps_completed_items_${user?.id || "guest"}_${targetCourseId}`;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(nextSet)));
      } catch (e) {
        console.error("Local progress save error:", e);
      }
    }

    // Save Lesson Progress to Backend
    if (token && user?.id && itemObject?.type === "lesson") {
      api
        .post(
          "/progresses",
          {
            lessonId: itemObject.data?.documentId || itemObject.data?.id,
            courseId: course?.documentId || course?.id,
            isCompleted: true,
          },
          { token },
        )
        .then(() => refreshEnrollmentProgress())
        .catch((err) => console.warn("Backend progress save error:", err));
    }

    // Advance to next sequential item if available
    if (nextItem) {
      handleSelectActiveItem(nextItem);
      if (nextItem.moduleIndex !== undefined) {
        setExpandedModules((prev) => new Set([...prev, nextItem.moduleIndex]));
      }
    }
  };

  // Handle Quiz Submission with Server Auto-Grading & Storage
  const handleQuizSubmit = async () => {
    if (!activeItem || activeItem.type !== "quiz") return;
    const questions = activeItem.data?.questions || [];
    setIsSubmittingQuiz(true);

    // Total Score is split evenly across however many questions the quiz currently has.
    const totalScore = Number(activeItem.data?.totalScore) || 100;
    const perQuestionScore =
      questions.length > 0 ? totalScore / questions.length : 0;

    let earnedScore = 0;
    let answeredCount = 0;
    if (questions.length > 0) {
      questions.forEach((q) => {
        const qId = q.id !== undefined ? q.id : q.documentId;
        const selected =
          selectedAnswers[qId] !== undefined
            ? selectedAnswers[qId]
            : selectedAnswers[q.documentId];
        if (selected !== undefined) {
          answeredCount += 1;
          if (Number(selected) === Number(q.correctAnswer)) {
            earnedScore += perQuestionScore;
          }
        }
      });
    }
    const calculatedScore = Math.round(earnedScore);

    setQuizScore(calculatedScore);
    setQuizSubmitted(true);

    // Quiz is only "Completed" once every question has been answered.
    const isCompleted =
      questions.length > 0 && answeredCount === questions.length;
    const qDocId = activeItem.data?.documentId;
    const qNumId = String(activeItem.data?.id);
    const qSlug = activeItem.data?.slug;

    // Cache Attempt Record in state and localStorage
    const attemptRecord = {
      score: calculatedScore,
      totalScore,
      passed: isCompleted,
      submittedAnswers: selectedAnswers,
      answers: selectedAnswers,
      submittedAt: new Date().toISOString(),
      quiz: activeItem.data,
      course: course,
    };

    setStoredQuizAttempts((prev) => {
      const updated = { ...prev };
      if (qDocId) updated[qDocId] = attemptRecord;
      if (qNumId) updated[qNumId] = attemptRecord;
      if (qSlug) updated[qSlug] = attemptRecord;
      return updated;
    });

    if (typeof window !== "undefined") {
      const baseKey = `cps_quiz_attempt_${user?.id || "guest"}_`;
      if (qDocId)
        localStorage.setItem(
          `${baseKey}${qDocId}`,
          JSON.stringify(attemptRecord),
        );
      if (qNumId)
        localStorage.setItem(
          `${baseKey}${qNumId}`,
          JSON.stringify(attemptRecord),
        );
      if (qSlug)
        localStorage.setItem(
          `${baseKey}${qSlug}`,
          JSON.stringify(attemptRecord),
        );
    }

    // Persist Quiz Attempt to Backend
    if (token && user?.id) {
      try {
        await api.post(
          "/quiz-attempts",
          {
            quizId: activeItem.data?.documentId || activeItem.data?.id,
            courseId: course?.documentId || course?.id,
            score: calculatedScore,
            passed: isCompleted,
            answers: selectedAnswers,
            submittedAnswers: selectedAnswers,
          },
          { token },
        );
        await refreshEnrollmentProgress();
      } catch (err) {
        console.warn("Quiz attempt persistence warning:", err);
      }
    }

    if (isCompleted) {
      markCurrentItemComplete(
        `quiz-${activeItem.data.documentId || activeItem.data.id}`,
        activeItem,
      );
    }
    setIsSubmittingQuiz(false);
  };

  const totalItemsCount = curriculumTimeline.length;
  // Use the same authoritative enrollment percentage shown on every dashboard;
  // only fall back to the local checklist estimate if it hasn't loaded yet.
  const overallProgress =
    enrollmentProgress !== null
      ? enrollmentProgress
      : totalItemsCount > 0
        ? Math.min(
            100,
            Math.round((completedItemIds.size / totalItemsCount) * 100),
          )
        : 0;
  const completedItemsCount =
    enrollmentProgress !== null
      ? Math.min(
          totalItemsCount,
          Math.round((overallProgress / 100) * totalItemsCount),
        )
      : completedItemIds.size;

  if (isLoading || isAuthLoading) {
    return <CoursePlayerSkeleton />;
  }

  if (!course) {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Course Not Found</h2>
        <p className="text-sm text-muted">
          The curriculum you are trying to view does not exist or has been
          removed.
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
        <h2 className="text-2xl font-bold text-foreground">
          Enrollment Required
        </h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          You must be enrolled in <strong>{course.title}</strong> to access
          video lessons and learning checkpoints.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button
            href={`/courses/${encodeURIComponent(course.slug || slug)}`}
            variant="primary"
            size="md"
          >
            Go to Course Enrollment Page
          </Button>
        </div>
      </div>
    );
  }

  const isVideoLesson = activeItem?.type === "lesson";
  const isQuizItem = activeItem?.type === "quiz";
  const rawVideoUrl =
    activeItem?.data?.youtubeUrl ||
    activeItem?.data?.videoUrl ||
    activeItem?.data?.youtube_url ||
    activeItem?.data?.url ||
    "";
  const youtubeVideoId = isVideoLesson ? extractYouTubeId(rawVideoUrl) : null;
  const currentActiveId = activeItem
    ? `${activeItem.type}-${activeItem.data?.documentId || activeItem.data?.id}`
    : "";
  const isCurrentComplete = completedItemIds.has(currentActiveId);
  const activeSavedAttempt = isQuizItem
    ? getSavedAttemptForQuiz(activeItem?.data)
    : null;

  // Quiz Scoring Context: Total Score split evenly across the quiz's current question count.
  const quizQuestions = isQuizItem ? activeItem?.data?.questions || [] : [];
  const quizTotalScore = Number(activeItem?.data?.totalScore) || 100;
  const quizPerQuestionScore =
    quizQuestions.length > 0
      ? Math.round(quizTotalScore / quizQuestions.length)
      : 0;
  const answeredQuestionsCount = quizQuestions.filter((q) => {
    const qId = q.id !== undefined ? q.id : q.documentId;
    return (
      selectedAnswers[qId] !== undefined ||
      selectedAnswers[q.documentId] !== undefined
    );
  }).length;
  const isQuizFullyCompleted =
    activeSavedAttempt?.passed !== undefined
      ? Boolean(activeSavedAttempt.passed)
      : quizQuestions.length > 0 &&
        answeredQuestionsCount === quizQuestions.length;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Navigation & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            href="/dashboard/student/courses"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>My Courses</span>
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground line-clamp-1">
              {course.title}
            </h1>
            <p className="text-xs text-muted">
              {course.category?.name || "Track"} • {course.modules?.length || 0}{" "}
              Modules • {totalItemsCount} Total Units
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {completedItemsCount} / {totalItemsCount} Completed
              </span>
              <span className="font-extrabold text-secondary">
                ({overallProgress}%)
              </span>
            </div>
            <div className="w-40">
              <ProgressBar progress={overallProgress} />
            </div>
          </div>
          <Button
            href={`/courses/${encodeURIComponent(course.slug || slug)}`}
            variant="secondary"
            size="sm"
            className="text-xs"
          >
            Course Overview
          </Button>
        </div>
      </div>

      {/* Decorated Course Completion Banner */}
      {overallProgress === 100 && (
        <div className="p-5 rounded-2xl bg-secondary/15 border-2 border-secondary/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0">
              <HiOutlineTrophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  Course Completed
                </Badge>
                <span className="text-xs text-secondary font-bold">
                  100% Verified Mastery
                </span>
              </div>
              <h4 className="font-extrabold text-base text-foreground mt-0.5">
                Congratulations, {user?.username || "Student"}! You&apos;ve
                Finished {course.title}!
              </h4>
              <p className="text-xs text-muted">
                All video lessons and checkpoint quizzes have been successfully
                completed and recorded.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCertificateModal(true)}
            variant="primary"
            size="md"
            className="font-bold shrink-0"
          >
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
            youtubeVideoId ? (
              /* 16:9 Video Player */
              <div
                key={`video-${youtubeVideoId}`}
                className="w-full aspect-video rounded-3xl overflow-hidden bg-black border-2 border-border shadow-md"
              >
                <iframe
                  key={youtubeVideoId}
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&enablejsapi=1&autoplay=1`}
                  title={activeItem?.data?.title || "Lesson Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              /* Text / Article Lesson Reader Stage when no video is attached */
              <Card
                key={`article-${currentActiveId}`}
                className="bg-card border-2 border-border overflow-hidden shadow-sm rounded-3xl"
              >
                <CardHeader className="bg-surface/80 border-b border-border py-4 px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm">
                          📖 Article / Text Lesson
                        </Badge>
                        {activeItem?.data?.isFreePreview && (
                          <Badge variant="secondary" size="sm">
                            Free Preview
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground mt-1">
                        {activeItem?.data?.title || "Lesson Content"}
                      </CardTitle>
                    </div>
                    {activeItem?.data?.duration && (
                      <div className="text-right text-xs text-muted shrink-0 flex items-center gap-1">
                        <HiOutlineClock className="w-3.5 h-3.5 text-secondary" />
                        <span>Est. Reading Time: </span>
                        <strong className="text-foreground">
                          {activeItem?.data?.duration}
                        </strong>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                    {activeItem?.data?.content ||
                      activeItem?.data?.notes ||
                      "Welcome to this reading lesson. Study the contents and concepts below, then mark as complete to advance."}
                  </div>
                </CardContent>
              </Card>
            )
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
                    <span>Total Score: </span>
                    <strong className="text-foreground">
                      {quizTotalScore} pts
                    </strong>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Result Overview Header Banner (Matching Reference Design) */}
                {quizSubmitted && (
                  <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isQuizFullyCompleted
                            ? "bg-secondary text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {quizScore}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              isQuizFullyCompleted ? "highlight" : "secondary"
                            }
                            size="sm"
                            className="font-bold"
                          >
                            {isQuizFullyCompleted
                              ? "Quiz Completed ✓"
                              : "Incomplete"}
                          </Badge>
                          <span className="text-[11px] text-muted font-bold">
                            {quizScore} / {quizTotalScore} pts
                          </span>
                          <span className="text-[11px] text-muted">
                            {activeSavedAttempt?.submittedAt
                              ? `Submitted on ${new Date(activeSavedAttempt.submittedAt).toLocaleDateString()}`
                              : "Verified Evaluation"}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-1">
                          Review your submitted answers below. Correct solutions
                          are highlighted in green, and incorrect choices in
                          red.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setQuizSubmitted(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0 gap-1.5"
                    >
                      <HiOutlineArrowPath className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </Button>
                  </div>
                )}

                {(activeItem?.data?.questions || []).length === 0 ? (
                  <div className="py-12 text-center space-y-2 text-muted">
                    <HiOutlineQuestionMarkCircle className="w-10 h-10 mx-auto text-muted" />
                    <p className="text-sm font-semibold text-foreground">
                      No questions attached to this quiz checkpoint.
                    </p>
                    <p className="text-xs">
                      You may mark this checkpoint complete to advance.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeItem.data.questions.map((q, qIdx) => {
                      const qId =
                        q.id !== undefined ? q.id : q.documentId || qIdx;
                      const studentAnswer =
                        selectedAnswers[q.id] !== undefined
                          ? selectedAnswers[q.id]
                          : selectedAnswers[q.documentId] !== undefined
                            ? selectedAnswers[q.documentId]
                            : selectedAnswers[qId];

                      const isQuestionCorrect =
                        studentAnswer !== undefined &&
                        Number(studentAnswer) === Number(q.correctAnswer);

                      return (
                        <div
                          key={qId}
                          className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-3.5"
                        >
                          {/* Question Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="font-mono font-extrabold text-xs text-secondary mt-0.5 px-2 py-0.5 rounded bg-card border border-border shrink-0">
                                Q{qIdx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-foreground leading-snug">
                                {q.prompt || q.title || `Question ${qIdx + 1}`}
                              </h4>
                            </div>

                            {quizSubmitted && (
                              <Badge
                                variant={
                                  isQuestionCorrect ? "highlight" : "danger"
                                }
                                size="sm"
                                className="shrink-0 font-bold"
                              >
                                {isQuestionCorrect
                                  ? `✓ Correct (+${quizPerQuestionScore})`
                                  : "✕ Incorrect (0)"}
                              </Badge>
                            )}
                          </div>

                          {/* Options List with Exact Color Coding (Matching Reference 3) */}
                          <div className="space-y-2 pt-1">
                            {(Array.isArray(q.options)
                              ? q.options
                              : ["Option A", "Option B", "Option C", "Option D"]
                            ).map((opt, optIdx) => {
                              const isStudentChoice =
                                studentAnswer !== undefined &&
                                Number(studentAnswer) === optIdx;
                              const isActualCorrect =
                                Number(q.correctAnswer) === optIdx;

                              let optionStyles =
                                "bg-card border-border hover:bg-surface/80 text-foreground";
                              let statusIcon = null;
                              let badgeText = null;

                              if (quizSubmitted) {
                                if (isStudentChoice && isActualCorrect) {
                                  // Case A: Student selected correct answer
                                  optionStyles =
                                    "bg-green-500/10 border-2 border-green-600 text-green-900 dark:text-green-200 font-bold";
                                  statusIcon = (
                                    <HiOutlineCheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                  );
                                  badgeText = (
                                    <Badge variant="highlight" size="sm">
                                      Your Answer (Correct)
                                    </Badge>
                                  );
                                } else if (
                                  isStudentChoice &&
                                  !isActualCorrect
                                ) {
                                  // Case B: Student selected wrong answer
                                  optionStyles =
                                    "bg-red-500/10 border-2 border-red-500 text-red-900 dark:text-red-300 font-bold";
                                  statusIcon = (
                                    <HiOutlineXCircle className="w-5 h-5 text-red-500 shrink-0" />
                                  );
                                  badgeText = (
                                    <Badge variant="danger" size="sm">
                                      Your Answer (Wrong)
                                    </Badge>
                                  );
                                } else if (
                                  !isStudentChoice &&
                                  isActualCorrect
                                ) {
                                  // Case C: The correct answer that student missed
                                  optionStyles =
                                    "bg-green-500/10 border-2 border-green-600/80 text-green-900 dark:text-green-200 font-semibold";
                                  statusIcon = (
                                    <HiOutlineCheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                  );
                                  badgeText = (
                                    <Badge variant="highlight" size="sm">
                                      Correct Solution
                                    </Badge>
                                  );
                                } else {
                                  // Case D: Other options
                                  optionStyles =
                                    "bg-card border-border/60 text-muted opacity-60";
                                }
                              } else if (isStudentChoice) {
                                optionStyles =
                                  "bg-secondary/15 border-2 border-secondary text-foreground font-bold ring-1 ring-secondary";
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() =>
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [qId]: optIdx,
                                      ...(q.id !== undefined
                                        ? { [q.id]: optIdx }
                                        : {}),
                                      ...(q.documentId
                                        ? { [q.documentId]: optIdx }
                                        : {}),
                                    }))
                                  }
                                  className={`w-full p-3.5 rounded-xl text-left text-xs transition-all border flex items-center justify-between gap-3 ${optionStyles}`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="font-mono font-bold text-muted shrink-0 w-5">
                                      {String.fromCharCode(65 + optIdx)}.
                                    </span>
                                    <span className="truncate">
                                      {typeof opt === "string"
                                        ? opt
                                        : opt.text || `Option ${optIdx + 1}`}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {badgeText}
                                    {statusIcon}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation Card */}
                          {quizSubmitted && q.explanation && (
                            <div className="p-3.5 rounded-xl bg-card border border-border text-xs text-muted space-y-1 mt-2">
                              <strong className="text-foreground flex items-center gap-1.5">
                                <span>💡 Explanation:</span>
                              </strong>
                              <p className="leading-relaxed pl-5">
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  onClick={() => handleSelectActiveItem(prevItem)}
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
                  <span>
                    {isCurrentComplete
                      ? "Completed ✓"
                      : "Mark Complete & Next →"}
                  </span>
                </Button>
              ) : isQuizItem ? (
                !quizSubmitted ? (
                  <Button
                    onClick={handleQuizSubmit}
                    disabled={isSubmittingQuiz}
                    variant="primary"
                    size="sm"
                    className="text-xs font-bold"
                  >
                    {isSubmittingQuiz
                      ? "Auto-Grading..."
                      : "Submit Quiz Attempt →"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => markCurrentItemComplete(currentActiveId)}
                    variant="primary"
                    size="sm"
                    className="text-xs font-bold"
                  >
                    {isCurrentComplete
                      ? "Continue to Next Unit →"
                      : "Save & Continue →"}
                  </Button>
                )
              ) : null}

              {nextItem && isCurrentComplete && (
                <Button
                  onClick={() => handleSelectActiveItem(nextItem)}
                  variant="outline"
                  size="sm"
                  className="p-2.5"
                >
                  <HiOutlineChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Lesson Details & Multi-Tab Resources */}
          {isVideoLesson && (
            <Card className="bg-card border-border overflow-hidden shadow-xs">
              <CardHeader className="py-3 px-5 border-b border-border bg-surface/60">
                <div className="flex gap-4 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`pb-1.5 border-b-2 transition-colors cursor-pointer ${
                      activeTab === "overview"
                        ? "border-secondary text-secondary font-bold"
                        : "border-transparent text-muted hover:text-foreground"
                    }`}
                  >
                    Lesson Notes & Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("resources")}
                    className={`pb-1.5 border-b-2 transition-colors cursor-pointer ${
                      activeTab === "resources"
                        ? "border-secondary text-secondary font-bold"
                        : "border-transparent text-muted hover:text-foreground"
                    }`}
                  >
                    Resources & Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("qna")}
                    className={`pb-1.5 border-b-2 transition-colors cursor-pointer ${
                      activeTab === "qna"
                        ? "border-secondary text-secondary font-bold"
                        : "border-transparent text-muted hover:text-foreground"
                    }`}
                  >
                    Instructor Q&A
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm leading-relaxed space-y-4">
                {activeTab === "overview" && (
                  <div className="space-y-3">
                    <div className="text-foreground text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {activeItem?.data?.content ||
                        activeItem?.data?.notes ||
                        "Review the foundational topics covered in this lesson. Practice with the problem sets to build mastery."}
                    </div>
                    {activeItem?.data?.duration && (
                      <div className="text-xs text-muted pt-2 border-t border-border/60 flex items-center gap-1.5">
                        <HiOutlineClock className="w-3.5 h-3.5 text-secondary" />
                        <span>
                          Estimated Duration:{" "}
                          <strong className="text-foreground">
                            {activeItem.data.duration}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "resources" && (
                  <div className="space-y-3 text-xs text-muted">
                    <p className="text-foreground font-semibold">
                      Supplementary Code & Downloadable Materials
                    </p>
                    <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-foreground font-bold">
                          {course.title} - Starter Code
                        </span>
                        <span className="text-[10px] font-bold text-secondary">
                          Verified Template
                        </span>
                      </div>
                      <p className="text-[11px]">
                        Download starter files, algorithm templates, and
                        practice test cases for this unit.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "qna" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-foreground font-semibold">
                      Discussion with Instructor & Classmates
                    </p>
                    <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-muted">
                      <p>
                        Have a question regarding this video lesson or test case
                        failure? Reach out through your instructor portal or
                        class discussion group.
                      </p>
                      <div className="pt-2 text-[11px] font-bold text-secondary">
                        Instructor:{" "}
                        {course.instructor?.username || "CPS Faculty"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: Course Syllabus Accordion (Connected Tree Timeline) */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card border-border overflow-hidden shadow-sm">
            <CardHeader className="py-4 px-5 bg-surface border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle
                  as="h3"
                  className="text-sm font-bold text-foreground flex items-center gap-2"
                >
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
                  <div
                    key={mod.documentId || mod.id || mIdx}
                    className="bg-card"
                  >
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

                    {/* Connected Tree Timeline */}
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1">
                        <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/80">
                          {lessons.map((lesson, lIdx) => {
                            const itemId = `lesson-${lesson.documentId || lesson.id}`;
                            const isSelected =
                              activeItem?.type === "lesson" &&
                              (activeItem.data?.documentId ||
                                activeItem.data?.id) ===
                                (lesson.documentId || lesson.id);
                            const isComplete = completedItemIds.has(itemId);

                            return (
                              <div
                                key={lesson.documentId || lesson.id || lIdx}
                                className="relative flex items-center"
                              >
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
                                  ) : lesson.youtubeUrl ? (
                                    <HiOutlinePlay className="w-2.5 h-2.5" />
                                  ) : (
                                    <HiOutlineDocumentText className="w-3 h-3" />
                                  )}
                                </div>

                                {/* Step Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSelectActiveItem({
                                      type: "lesson",
                                      data: lesson,
                                      moduleIndex: mIdx,
                                    })
                                  }
                                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                    isSelected
                                      ? "bg-secondary text-white font-semibold shadow-xs"
                                      : "hover:bg-surface text-foreground"
                                  }`}
                                >
                                  <span className="truncate">
                                    {lesson.title}
                                  </span>
                                  {lesson.duration && (
                                    <span
                                      className={`text-[10px] shrink-0 ${isSelected ? "text-white/80" : "text-muted"}`}
                                    >
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
                          (activeItem.data?.documentId ||
                            activeItem.data?.id) ===
                            (quiz.documentId || quiz.id);
                        const isComplete = completedItemIds.has(itemId);

                        return (
                          <div
                            key={quiz.id || qIdx}
                            className="relative flex items-center"
                          >
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
                              onClick={() =>
                                handleSelectActiveItem({
                                  type: "quiz",
                                  data: quiz,
                                  moduleIndex: (course.modules || []).length,
                                })
                              }
                              className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? "bg-secondary text-white font-semibold shadow-xs"
                                  : "hover:bg-surface text-foreground"
                              }`}
                            >
                              <span className="truncate">
                                Checkpoint: {quiz.title}
                              </span>
                              <span
                                className={`text-[10px] shrink-0 ${isSelected ? "text-white/80" : "text-muted"}`}
                              >
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

      {/* Decorated Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <HiOutlineTrophy className="w-5 h-5 text-secondary" />
                <h3 className="font-extrabold text-base text-foreground">
                  Course Completion Certificate
                </h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground cursor-pointer"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border text-center space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-secondary font-extrabold">
                CPS Academy Verified Achievement
              </span>
              <h2 className="text-xl font-black text-foreground">
                Certificate of Completion
              </h2>
              <p className="text-xs text-muted">
                This certifies that{" "}
                <strong>{user?.username || user?.name || "Student"}</strong> has
                successfully completed all coursework, video lectures, and
                evaluations for:
              </p>
              <div className="py-2 px-4 rounded-lg bg-card border border-border font-extrabold text-sm text-foreground">
                {course.title}
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-muted pt-1">
                <span>
                  Verified Curriculum Units: <strong>{totalItemsCount}</strong>
                </span>
                <span>•</span>
                <span>
                  Final Mastery: <strong>100%</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={() => setShowCertificateModal(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
              <Button
                href="/dashboard/student/courses"
                variant="primary"
                size="sm"
              >
                Return to My Courses
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
