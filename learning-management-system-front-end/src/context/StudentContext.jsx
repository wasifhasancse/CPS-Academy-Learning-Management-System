"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    HiOutlineBookOpen,
    HiOutlineChartBar,
    HiOutlineCheckBadge,
    HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";

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
      const [enrollsRes, coursesRes, catsRes, quizzesRes, progressRes] =
        await Promise.all([
          api
            .get(
              "/enrollments?populate[course][populate]=modules.lessons&populate[course][populate]=quizzes&populate[course][populate]=category",
              { token },
            )
            .catch(() => ({ data: [] })),
          api
            .get(
              "/courses?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate=category",
              { token },
            )
            .catch(() => ({ data: [] })),
          api.get("/categories", { token }).catch(() => ({ data: [] })),
          api
            .get(
              "/quiz-attempts?populate=quiz.questions&populate=quiz.course",
              { token },
            )
            .catch(() => ({ data: [] })),
          api.get("/progresses", { token }).catch(() => ({ data: [] })),
        ]);

      const resolvedEnrolls = Array.isArray(enrollsRes?.data)
        ? enrollsRes.data
        : [];
      const resolvedCourses = Array.isArray(coursesRes?.data)
        ? coursesRes.data
        : [];
      const resolvedCats = Array.isArray(catsRes?.data) ? catsRes.data : [];
      const resolvedQuizzes = Array.isArray(quizzesRes?.data)
        ? quizzesRes.data
        : [];
      const resolvedProgress = Array.isArray(progressRes?.data)
        ? progressRes.data
        : [];

      // Merge local storage quiz attempts if any
      const mergedQuizzes = [...resolvedQuizzes];
      const seenQuizKeys = new Set(
        resolvedQuizzes.map((q) =>
          String(q.quiz?.documentId || q.quiz?.id || q.id),
        ),
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

  // Derived Enrolled Courses — trusts the backend-persisted progressPercentage
  // (single source of truth, recalculated server-side on every lesson/quiz completion)
  // so the value is identical to what Instructor/Manager/Admin dashboards see.
  const enrolledCourses = enrollments
    .map((e) => {
      if (!e.course) return null;
      const c = e.course;
      const finalPercentage = Math.min(
        100,
        Math.max(0, Number(e.progressPercentage || 0)),
      );

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
    enrolledCourses.map((c) => c.documentId || String(c.id)),
  );

  const completedCoursesCount = enrolledCourses.filter(
    (c) => Number(c.progressPercentage) === 100,
  ).length;
  const inProgressCoursesCount = enrolledCourses.length - completedCoursesCount;

  const overallProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce(
            (acc, c) => acc + Number(c.progressPercentage || 0),
            0,
          ) / enrolledCourses.length,
        )
      : 0;

  const passedQuizzesCount = quizAttempts.filter((q) => q.passed).length;

  const avgQuizScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((acc, q) => {
            const denom = Number(q.totalScore || q.quiz?.totalScore || 100);
            return (
              acc + (denom > 0 ? (Number(q.score || 0) / denom) * 100 : 0)
            );
          }, 0) / quizAttempts.length,
        )
      : 0;

  const stats = [
    {
      title: "Enrolled Courses",
      value: enrolledCourses.length,
      subtitle: `${completedCoursesCount} Completed • ${inProgressCoursesCount} In Progress`,
      icon: <HiOutlineBookOpen className="w-4 h-4" />,
    },
    {
      title: "Overall Progress",
      value: `${overallProgress}%`,
      subtitle: "Average Syllabus Completion",
      icon: <HiOutlineChartBar className="w-4 h-4" />,
    },
    {
      title: "Quiz Evaluations",
      value: quizAttempts.length,
      subtitle: `${passedQuizzesCount} Completed • ${quizAttempts.length - passedQuizzesCount} Pending`,
      icon: <HiOutlineClipboardDocumentCheck className="w-4 h-4" />,
    },
    {
      title: "Average Score",
      value: quizAttempts.length > 0 ? `${avgQuizScore}%` : "N/A",
      subtitle:
        quizAttempts.length > 0
          ? "Verified Assessment Average"
          : "Complete quizzes to get evaluated",
      icon: <HiOutlineCheckBadge className="w-4 h-4" />,
    },
  ];

  const studentActivities = [
    ...enrollments.map((e) => ({
      id: `en-${e.id || e.documentId}`,
      action: "COURSE_ENROLLED",
      title: `Enrolled in "${e.course?.title || "CPS Course Track"}"`,
      timestamp: e.createdAt
        ? new Date(e.createdAt).toLocaleDateString()
        : "Recent",
      dateObj: e.createdAt ? new Date(e.createdAt) : new Date(0),
      badgeText: "ENROLLED",
      badgeVariant: "primary",
    })),
    ...quizAttempts.map((q) => {
      const totalScore = Number(q.totalScore || q.quiz?.totalScore || 100);
      return {
        id: `q-${q.id || q.documentId}`,
        action: "QUIZ_EVALUATION",
        title: `${q.quiz?.title || "Quiz Checkpoint"} — ${q.score || 0}/${totalScore} pts`,
        timestamp: q.submittedAt || q.createdAt
          ? new Date(q.submittedAt || q.createdAt).toLocaleDateString()
          : "Recent",
        dateObj: q.submittedAt || q.createdAt
          ? new Date(q.submittedAt || q.createdAt)
          : new Date(0),
        badgeText: q.passed ? "COMPLETED" : "IN PROGRESS",
        badgeVariant: q.passed ? "highlight" : "danger",
      };
    }),
  ].sort((a, b) => b.dateObj - a.dateObj);

  const studentSeries = [
    {
      name: "Enrollments",
      color: "#309255",
      dataPoints: enrollments,
    },
    {
      name: "Quiz Checkpoints",
      color: "#212832",
      dataPoints: quizAttempts,
    },
  ];

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
    studentSeries,
    loadStudentData,
  };

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
}
