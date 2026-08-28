"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";


const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const { token } = useAuth();

  // Core States
  const [enrollments, setEnrollments] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Data Loader
  const loadStudentData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [enrollsRes, coursesRes, catsRes, quizzesRes] = await Promise.all([
        api.get("/enrollments?populate[course][populate]=modules.lessons&populate[course][populate]=category", { token }).catch(() => ({ data: [] })),
        api.get("/courses?populate=modules.lessons&populate=category", { token }).catch(() => ({ data: [] })),
        api.get("/categories", { token }).catch(() => ({ data: [] })),
        api.get("/quiz-attempts?populate=quiz&populate=course", { token }).catch(() => ({ data: [] })),
      ]);

      const resolvedEnrolls = Array.isArray(enrollsRes?.data) ? enrollsRes.data : [];
      const resolvedCourses = Array.isArray(coursesRes?.data) ? coursesRes.data : [];
      const resolvedCats = Array.isArray(catsRes?.data) ? catsRes.data : [];
      const resolvedQuizzes = Array.isArray(quizzesRes?.data) ? quizzesRes.data : [];

      setEnrollments(resolvedEnrolls);
      setCatalogCourses(resolvedCourses);
      setCategories(resolvedCats);
      setQuizAttempts(resolvedQuizzes);
    } catch (err) {
      console.error("Failed to load student data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  // Derived Enrolled Courses
  const enrolledCourses = enrollments
    .map((e) => {
      if (!e.course) return null;
      return {
        ...e.course,
        progressPercentage: e.progressPercentage || 0,
        enrolledAt: e.createdAt,
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
