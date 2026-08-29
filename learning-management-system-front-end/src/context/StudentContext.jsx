"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const { token, user } = useAuth();

  // Core States
  const [enrollments, setEnrollments] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Data Loader
  const loadStudentData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [enrollsRes, coursesRes, catsRes, quizzesRes, progressRes] = await Promise.all([
        api.get("/enrollments?populate[course][populate]=modules.lessons&populate[course][populate]=quizzes&populate[course][populate]=category", { token }).catch(() => ({ data: [] })),
        api.get("/courses?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate=category", { token }).catch(() => ({ data: [] })),
        api.get("/categories", { token }).catch(() => ({ data: [] })),
        api.get("/quiz-attempts?populate=quiz.questions&populate=quiz.course", { token }).catch(() => ({ data: [] })),
        api.get("/progresses", { token }).catch(() => ({ data: [] })),
      ]);

      const resolvedEnrolls = Array.isArray(enrollsRes?.data) ? enrollsRes.data : [];
      const resolvedCourses = Array.isArray(coursesRes?.data) ? coursesRes.data : [];
      const resolvedCats = Array.isArray(catsRes?.data) ? catsRes.data : [];
      const resolvedQuizzes = Array.isArray(quizzesRes?.data) ? quizzesRes.data : [];
      const resolvedProgress = Array.isArray(progressRes?.data) ? progressRes.data : [];

      // Merge local storage quiz attempts if any
      const mergedQuizzes = [...resolvedQuizzes];
      const seenQuizKeys = new Set(
        resolvedQuizzes.map((q) => String(q.quiz?.documentId || q.quiz?.id || q.id))
      );

      if (typeof window !== "undefined" && user?.id) {
        try {
          const prefix = `cps_quiz_attempt_${user.id}_`;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
              const quizSuffix = key.replace(prefix, "");
              if (!seenQuizKeys.has(quizSuffix)) {
                const raw = localStorage.getItem(key);
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed && typeof parsed === "object") {
                    mergedQuizzes.push({
                      ...parsed,
                      id: parsed.id || `local-${quizSuffix}`,
                      createdAt: parsed.submittedAt || new Date().toISOString(),
                    });
                    seenQuizKeys.add(quizSuffix);
                  }
                }
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }

      setEnrollments(resolvedEnrolls);
      setCatalogCourses(resolvedCourses);
      setCategories(resolvedCats);
      setQuizAttempts(mergedQuizzes);
      setProgressRecords(resolvedProgress);
    } catch (err) {
      console.error("Failed to load student data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  // Derived Enrolled Courses with Dynamic Live Progress Calculation
  const enrolledCourses = enrollments
    .map((e) => {
      if (!e.course) return null;
      const c = e.course;
      const cId = String(c.id);
      const cDocId = String(c.documentId || "");

      // 1. Total Units (Lessons + Quizzes)
      const lessons = (c.modules || []).flatMap((m) => m.lessons || []);
      const quizzes = c.quizzes || [];
      const totalUnits = Math.max(1, lessons.length + quizzes.length);

      // 2. Completed Lessons count
      const lessonIds = new Set(lessons.map((l) => String(l.id)));
      const lessonDocIds = new Set(lessons.map((l) => String(l.documentId || "")));
      const completedLessonsCount = progressRecords.filter((p) => {
        if (!p.isCompleted || !p.lesson) return false;
        const lId = String(p.lesson.id);
        const lDocId = String(p.lesson.documentId || "");
        return lessonIds.has(lId) || lessonDocIds.has(lDocId);
      }).length;

      // 3. Passed Quizzes count
      const quizIds = new Set(quizzes.map((q) => String(q.id)));
      const quizDocIds = new Set(quizzes.map((q) => String(q.documentId || "")));
      const passedQuizAttempts = quizAttempts.filter((a) => {
        if (!a.passed || !a.quiz) return false;
        const qId = String(a.quiz.id);
        const qDocId = String(a.quiz.documentId || "");
        return quizIds.has(qId) || quizDocIds.has(qDocId);
      });
      const passedQuizzesCount = new Set(passedQuizAttempts.map((a) => a.quiz.documentId || String(a.quiz.id))).size;

      // 4. Local storage fallback
      let localCompletedCount = 0;
      if (typeof window !== "undefined" && user?.id) {
        try {
          const keys = [`cps_completed_items_${user.id}_${cId}`, `cps_completed_items_${user.id}_${cDocId}`];
          for (const k of keys) {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                localCompletedCount = Math.max(localCompletedCount, parsed.length);
              }
            }
          }
        } catch (err) {
          // ignore
        }
      }

      const verifiedCompletedUnits = Math.max(completedLessonsCount + passedQuizzesCount, localCompletedCount);
      const computedPercentage = Math.min(100, Math.round((verifiedCompletedUnits / totalUnits) * 100));
      const backendPercentage = Number(e.progressPercentage || 0);
      const finalPercentage = Math.max(backendPercentage, computedPercentage);

      return {
        ...c,
        progressPercentage: finalPercentage,
        isCompleted: finalPercentage === 100,
        enrolledAt: e.createdAt,
        enrollmentId: e.id,
      };
    })
    .filter(Boolean);

  const enrolledCourseIds = new Set(
    enrolledCourses.map((c) => c.documentId || String(c.id))
  );

  const completedCoursesCount = enrolledCourses.filter(
    (c) => Number(c.progressPercentage) === 100
  ).length;

  const totalLessonsCount = enrolledCourses.reduce(
    (acc, c) => acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0),
    0
  );

  const passedQuizzesCount = quizAttempts.filter(
    (q) => q.score >= (q.quiz?.passingScore || 80)
  ).length;

  const stats = [
    { title: "Enrolled Tracks", value: enrolledCourses.length, subtitle: `${completedCoursesCount} Tracks Fully Completed` },
    { title: "Curriculum Units", value: totalLessonsCount, subtitle: "Video Lessons in Active Syllabus" },
    { title: "Quiz Evaluations", value: quizAttempts.length, subtitle: `${passedQuizzesCount} Checkpoints Passed` },
    { title: "Learning Score", value: quizAttempts.length > 0 ? `${Math.round(quizAttempts.reduce((acc, q) => acc + (q.score || 0), 0) / quizAttempts.length)}%` : "N/A", subtitle: quizAttempts.length > 0 ? "Average Verified Score" : "Complete a quiz to see your score" },
  ];

  const studentActivities = [
    ...enrollments.map((e) => ({
      id: `en-${e.id}`,
      action: "COURSE_ENROLLED",
      title: `Enrolled in "${e.course?.title || "CPS Course Track"}"`,
      timestamp: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "Recent",
      dateObj: e.createdAt ? new Date(e.createdAt) : new Date(0),
      badgeText: "ENROLLED",
      badgeVariant: "primary",
    })),
    ...quizAttempts.map((q) => {
      const isPassed = q.score >= (q.quiz?.passingScore || 80);
      return {
        id: `q-${q.id}`,
        action: "QUIZ_EVALUATION",
        title: `Completed ${q.quiz?.title || "Quiz Checkpoint"} (${q.score}%)`,
        timestamp: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "Recent",
        dateObj: q.createdAt ? new Date(q.createdAt) : new Date(0),
        badgeText: isPassed ? "PASSED" : "FAILED",
        badgeVariant: isPassed ? "highlight" : "danger",
      };
    }),
  ].sort((a, b) => b.dateObj - a.dateObj).slice(0, 10);

  const value = {
    enrollments,
    catalogCourses,
    categories,
    quizAttempts,
    progressRecords,
    isLoading,
    enrolledCourses,
    enrolledCourseIds,
    stats,
    studentActivities,
    loadStudentData,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
}
