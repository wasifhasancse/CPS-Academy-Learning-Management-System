"use client";

import { useState, useEffect, useCallback } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { api } from "@/lib/api";

const DEFAULT_LMS_CATEGORIES = [
  { id: 1, name: "Competitive Programming", slug: "competitive-programming" },
  { id: 2, name: "Software Engineering", slug: "software-engineering" },
  { id: 3, name: "Data Structures & Algorithms", slug: "dsa" },
  { id: 4, name: "System Design & Architecture", slug: "system-design" },
  { id: 5, name: "Web Development", slug: "web-development" },
];

export default function TeacherDashboardPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Core Data
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_LMS_CATEGORIES);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Search & Filter
  const [searchStudent, setSearchStudent] = useState("");
  const [progressCourseFilter, setProgressCourseFilter] = useState("all");

  // Modals
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Lesson Modals
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [isDeleteLessonModalOpen, setIsDeleteLessonModalOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState(null);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  // Quiz Modals
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);
  const [isDeleteQuizModalOpen, setIsDeleteQuizModalOpen] = useState(false);
  const [isManageQuestionsModalOpen, setIsManageQuestionsModalOpen] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState(null);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [quizForQuestions, setQuizForQuestions] = useState(null);

  // Course Form States
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCategory, setCourseCategory] = useState("1");
  const [coursePrice, setCoursePrice] = useState("4000");
  const [courseDifficulty, setCourseDifficulty] = useState("Beginner");
  const [courseDescription, setCourseDescription] = useState("");

  // Lesson Form States
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState("15:00");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonIsFreePreview, setLessonIsFreePreview] = useState(false);

  // Quiz Form States
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPassScore, setQuizPassScore] = useState("80");
  const [quizTimeLimit, setQuizTimeLimit] = useState("20");

  // Question Form States (MCQ)
  const [questionPrompt, setQuestionPrompt] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [questionExplanation, setQuestionExplanation] = useState("");
  const [questionPoints, setQuestionPoints] = useState("1");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all Instructor courses, lessons, quizzes, and enrolled students
  const loadDashboardData = useCallback(async () => {
    if (!token) {
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    try {
      // 1. Fetch instructor's courses with nested modules, lessons, quizzes, and enrollments
      try {
        const coursesRes = await api.get(
          "/courses?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[enrollments][populate]=student&populate[category]=*",
          { token }
        );
        const fetchedCourses = Array.isArray(coursesRes?.data)
          ? coursesRes.data
          : coursesRes?.data
          ? [coursesRes.data]
          : [];
        setCourses(fetchedCourses);

        if (fetchedCourses.length > 0) {
          setSelectedCourseId((prev) => prev || fetchedCourses[0].documentId || String(fetchedCourses[0].id));
        }
      } catch (err) {
        console.warn("Could not fetch courses from backend API:", err);
      }

      // 2. Fetch categories
      try {
        const catRes = await api.get("/categories", { token });
        if (Array.isArray(catRes?.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      } catch {
        setCategories(DEFAULT_LMS_CATEGORIES);
      }

      // 3. Fetch enrollments for enrolled students
      try {
        const enrollRes = await api.get("/enrollments?populate=student&populate=course", { token });
        setEnrollments(Array.isArray(enrollRes?.data) ? enrollRes.data : []);
      } catch {
        setEnrollments([]);
      }
    } catch (err) {
      console.error("Failed to load teacher dashboard data:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Active selected course for curriculum & lesson/quiz authoring
  const currentCourse =
    courses.find((c) => (c.documentId || String(c.id)) === selectedCourseId) || courses[0] || null;

  // Flatten lessons for current course
  const currentCourseLessons =
    currentCourse?.modules?.flatMap((m) => m.lessons || []) || [];

  // Quizzes for current course
  const currentCourseQuizzes = currentCourse?.quizzes || [];

  // Total metrics
  const totalCourses = courses.length;
  const totalLessons = courses.reduce(
    (acc, c) => acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0),
    0
  );
  const totalQuizzes = courses.reduce((acc, c) => acc + (c.quizzes?.length || 0), 0);
  const totalEnrolledStudents = courses.reduce(
    (acc, c) => acc + (c.enrollments?.length || 0),
    0
  );

  // --- Course CRUD Handlers ---
  const handleOpenAddCourse = () => {
    setCourseTitle("");
    setCourseCategory(categories[0]?.id || "");
    setCoursePrice("4000");
    setCourseDifficulty("Beginner");
    setCourseDescription("");
    setFormError("");
    setIsAddCourseModalOpen(true);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      setFormError("Course title is required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const payload = {
        data: {
          title: courseTitle.trim(),
          slug: courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
          price: Number(coursePrice) || 0,
          difficulty: courseDifficulty,
          description: courseDescription,
          category: courseCategory || undefined,
        },
      };
      await api.post("/courses", payload, { token });
      await loadDashboardData();
      setIsAddCourseModalOpen(false);
    } catch (err) {
      setFormError(err?.message || "Failed to create course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditCourse = (course) => {
    setCourseToEdit(course);
    setCourseTitle(course.title || "");
    setCourseCategory(course.category?.id || "");
    setCoursePrice(String(course.price || 0));
    setCourseDifficulty(course.difficulty || "Beginner");
    setCourseDescription(course.description || "");
    setFormError("");
    setIsEditCourseModalOpen(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!courseToEdit || !courseTitle.trim()) return;
    setFormError("");
    setIsSubmitting(true);
    try {
      const targetId = courseToEdit.documentId || courseToEdit.id;
      const payload = {
        data: {
          title: courseTitle.trim(),
          price: Number(coursePrice) || 0,
          difficulty: courseDifficulty,
          description: courseDescription,
          category: courseCategory || undefined,
        },
      };
      await api.put(`/courses/${targetId}`, payload, { token });
      await loadDashboardData();
      setIsEditCourseModalOpen(false);
    } catch (err) {
      setFormError(err?.message || "Failed to update course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsSubmitting(true);
    try {
      const targetId = courseToDelete.documentId || courseToDelete.id;
      await api.delete(`/courses/${targetId}`, { token });
      await loadDashboardData();
      setIsDeleteCourseModalOpen(false);
    } catch (err) {
      alert(err?.message || "Failed to delete course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Lesson CRUD Handlers ---
  const handleOpenAddLesson = () => {
    setLessonTitle("");
    setLessonYoutubeUrl("");
    setLessonDuration("15:00");
    setLessonContent("");
    setLessonIsFreePreview(false);
    setFormError("");
    setIsAddLessonModalOpen(true);
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!currentCourse) return;
    if (!lessonTitle.trim()) {
      setFormError("Lesson title is required.");
      return;
    }
    if (!lessonYoutubeUrl.trim()) {
      setFormError("Video URL is required.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);
    try {
      const courseTargetId = currentCourse.documentId || currentCourse.id;

      const lessonPayload = {
        data: {
          title: lessonTitle.trim(),
          slug: lessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
          youtubeUrl: lessonYoutubeUrl.trim(),
          duration: lessonDuration.trim() || "10:00",
          content: lessonContent,
          order: currentCourseLessons.length + 1,
          isFreePreview: lessonIsFreePreview,
          course: courseTargetId,
        },
      };

      await api.post("/lessons", lessonPayload, { token });
      await loadDashboardData();
      setIsAddLessonModalOpen(false);
    } catch (err) {
      setFormError(err?.message || "Failed to create lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditLesson = (lesson) => {
    setLessonToEdit(lesson);
    setLessonTitle(lesson.title || "");
    setLessonYoutubeUrl(lesson.youtubeUrl || "");
    setLessonDuration(lesson.duration || "15:00");
    setLessonContent(lesson.content || "");
    setLessonIsFreePreview(Boolean(lesson.isFreePreview));
    setFormError("");
    setIsEditLessonModalOpen(true);
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!lessonToEdit || !lessonTitle.trim()) return;
    setFormError("");
    setIsSubmitting(true);
    try {
      const targetId = lessonToEdit.documentId || lessonToEdit.id;
      const payload = {
        data: {
          title: lessonTitle.trim(),
          youtubeUrl: lessonYoutubeUrl.trim(),
          duration: lessonDuration.trim() || "10:00",
          content: lessonContent,
          isFreePreview: lessonIsFreePreview,
        },
      };
      await api.put(`/lessons/${targetId}`, payload, { token });
      await loadDashboardData();
      setIsEditLessonModalOpen(false);
    } catch (err) {
      setFormError(err?.message || "Failed to update lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setIsSubmitting(true);
    try {
      const targetId = lessonToDelete.documentId || lessonToDelete.id;
      await api.delete(`/lessons/${targetId}`, { token });
      await loadDashboardData();
      setIsDeleteLessonModalOpen(false);
    } catch (err) {
      alert(err?.message || "Failed to delete lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Quiz CRUD Handlers ---
  const handleOpenAddQuiz = () => {
    setQuizTitle("");
    setQuizPassScore("80");
    setQuizTimeLimit("20");
    setFormError("");
    setIsAddQuizModalOpen(true);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!currentCourse) return;
    if (!quizTitle.trim()) {
      setFormError("Quiz title is required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const courseTargetId = currentCourse.documentId || currentCourse.id;
      const payload = {
        data: {
          title: quizTitle.trim(),
          slug: quizTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
          passingScore: Number(quizPassScore) || 80,
          timeLimitMinutes: Number(quizTimeLimit) || 20,
          course: courseTargetId,
        },
      };
      await api.post("/quizzes", payload, { token });
      await loadDashboardData();
      setIsAddQuizModalOpen(false);
    } catch (err) {
      setFormError(err?.message || "Failed to create quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditQuiz = (quiz) => {
    setQuizToEdit(quiz);
    setQuizTitle(quiz.title || "");
    setQuizPassScore(String(quiz.passingScore || 80));
    setQuizTimeLimit(String(quiz.timeLimitMinutes || 20));
    setFormError("");
    setIsEditQuizModalOpen(true);
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!quizToEdit || !quizTitle.trim()) return;
    setFormError("");
    setIsSubmitting(true);
    try {
      const targetId = quizToEdit.documentId || quizToEdit.id;
      const payload = {
        data: {
          title: quizTitle.trim(),
          passingScore: Number(quizPassScore) || 80,
          timeLimitMinutes: Number(quizTimeLimit) || 20,
        },
      };
      await api.put(`/quizzes/${targetId}`, payload, { token });
      await loadDashboardData();
      setIsEditQuizModalOpen(false);
    } catch (err) {
      setFormError(err?.message || "Failed to update quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    setIsSubmitting(true);
    try {
      const targetId = quizToDelete.documentId || quizToDelete.id;
      await api.delete(`/quizzes/${targetId}`, { token });
      await loadDashboardData();
      setIsDeleteQuizModalOpen(false);
    } catch (err) {
      alert(err?.message || "Failed to delete quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MCQ Question Builder Handlers ---
  const handleOpenManageQuestions = (quiz) => {
    setQuizForQuestions(quiz);
    setQuestionPrompt("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOptionIndex(0);
    setQuestionExplanation("");
    setQuestionPoints("1");
    setFormError("");
    setIsManageQuestionsModalOpen(true);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!quizForQuestions) return;
    if (!questionPrompt.trim() || !optionA.trim() || !optionB.trim()) {
      setFormError("Question prompt and at least Options A and B are required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const optionsArray = [optionA.trim(), optionB.trim()];
      if (optionC.trim()) optionsArray.push(optionC.trim());
      if (optionD.trim()) optionsArray.push(optionD.trim());

      const quizTargetId = quizForQuestions.documentId || quizForQuestions.id;
      const payload = {
        data: {
          prompt: questionPrompt.trim(),
          options: optionsArray,
          correctAnswer: correctOptionIndex,
          explanation: questionExplanation.trim(),
          points: Number(questionPoints) || 1,
          quiz: quizTargetId,
        },
      };

      const res = await api.post("/questions", payload, { token });
      if (res?.data) {
        setQuizForQuestions((prev) =>
          prev
            ? {
                ...prev,
                questions: [...(prev.questions || []), res.data],
              }
            : prev
        );
      }

      await loadDashboardData();

      setQuestionPrompt("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setQuestionExplanation("");
    } catch (err) {
      setFormError(err?.message || "Failed to add question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/questions/${questionId}`, { token });
      setQuizForQuestions((prev) =>
        prev
          ? {
              ...prev,
              questions: (prev.questions || []).filter(
                (q) => (q.documentId || q.id) !== questionId
              ),
            }
          : prev
      );
      await loadDashboardData();
    } catch (err) {
      alert(err?.message || "Failed to delete question.");
    }
  };

  // Filtered Students
  const filteredStudents = enrollments.filter((enrollment) => {
    const student = enrollment.student;
    const course = enrollment.course;
    const nameMatch =
      !searchStudent ||
      student?.username?.toLowerCase().includes(searchStudent.toLowerCase()) ||
      student?.email?.toLowerCase().includes(searchStudent.toLowerCase());
    const courseMatch =
      progressCourseFilter === "all" ||
      (course?.documentId || String(course?.id)) === progressCourseFilter;
    return nameMatch && courseMatch;
  });

  return (
    <RoleGuard allowedRoles={["Instructor", "Admin", "Content Manager"]}>
      <DashboardLayout
        roleName="Instructor"
        roleLabel="Instructor Workspace"
        subtitle="Manage your courses, lessons, quizzes, and track enrolled student progress."
      >
        <div className="space-y-6">
          {/* Top Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-primary text-white dark:bg-secondary dark:text-white"
                    : "bg-surface text-muted hover:text-foreground"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === "courses"
                    ? "bg-primary text-white dark:bg-secondary dark:text-white"
                    : "bg-surface text-muted hover:text-foreground"
                }`}
              >
                My Courses ({courses.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("curriculum")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === "curriculum"
                    ? "bg-primary text-white dark:bg-secondary dark:text-white"
                    : "bg-surface text-muted hover:text-foreground"
                }`}
              >
                Lessons & Quizzes Hub
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("progress")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === "progress"
                    ? "bg-primary text-white dark:bg-secondary dark:text-white"
                    : "bg-surface text-muted hover:text-foreground"
                }`}
              >
                Enrolled Students Progress
              </button>
            </div>

            <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
              + Create New Course
            </Button>
          </div>

          {isLoadingData ? (
            <div className="p-12 text-center text-muted">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              Loading instructor courses and curriculum...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-surface border-border">
                      <CardContent className="p-5">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                          Own Courses
                        </span>
                        <div className="text-3xl font-extrabold text-foreground mt-2">
                          {totalCourses}
                        </div>
                        <p className="text-xs text-muted mt-1">Assigned / authored</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-surface border-border">
                      <CardContent className="p-5">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                          Total Lessons
                        </span>
                        <div className="text-3xl font-extrabold text-foreground mt-2">
                          {totalLessons}
                        </div>
                        <p className="text-xs text-muted mt-1">Across all own tracks</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-surface border-border">
                      <CardContent className="p-5">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                          Active Quizzes
                        </span>
                        <div className="text-3xl font-extrabold text-foreground mt-2">
                          {totalQuizzes}
                        </div>
                        <p className="text-xs text-muted mt-1">MCQ evaluations</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-surface border-border">
                      <CardContent className="p-5">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                          Enrolled Learners
                        </span>
                        <div className="text-3xl font-extrabold text-foreground mt-2">
                          {totalEnrolledStudents}
                        </div>
                        <p className="text-xs text-muted mt-1">In your course tracks</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Course Cards Quick Overview */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Your Active Course Tracks</CardTitle>
                        <CardDescription>
                          Quick overview of courses you instruct and manage.
                        </CardDescription>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => setActiveTab("courses")}>
                        View All Courses →
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {courses.length === 0 ? (
                        <div className="text-center py-8 text-muted">
                          <p className="text-sm">You haven&apos;t created any courses yet.</p>
                          <Button
                            variant="primary"
                            size="sm"
                            className="mt-3"
                            onClick={handleOpenAddCourse}
                          >
                            Create Your First Course
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {courses.slice(0, 4).map((c) => {
                            const lessonCount =
                              c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
                            const quizCount = c.quizzes?.length || 0;
                            const enrollCount = c.enrollments?.length || 0;
                            return (
                              <div
                                key={c.documentId || c.id}
                                className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="highlight" size="sm">
                                      {c.category?.name || "Programming"}
                                    </Badge>
                                    <span className="text-xs font-bold text-foreground">
                                      ৳{Number(c.price || 0).toLocaleString()}
                                    </span>
                                  </div>
                                  <h3 className="font-bold text-foreground text-base mb-1">
                                    {c.title}
                                  </h3>
                                  <p className="text-xs text-muted line-clamp-2 mb-3">
                                    {c.description || "No description provided."}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted">
                                  <span>
                                    {lessonCount} Lessons • {quizCount} Quizzes
                                  </span>
                                  <span>{enrollCount} Enrolled</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 2: COURSES MANAGEMENT */}
              {activeTab === "courses" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">My Courses Library</h2>
                      <p className="text-xs text-muted">
                        Create, edit, and organize all courses authored by you.
                      </p>
                    </div>
                    <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
                      + New Course
                    </Button>
                  </div>

                  {courses.length === 0 ? (
                    <Card className="text-center py-12 text-muted">
                      <p className="text-base font-semibold">No courses created yet.</p>
                      <p className="text-xs text-muted mt-1">
                        Click &quot;New Course&quot; to begin building your curriculum.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-4 mx-auto"
                        onClick={handleOpenAddCourse}
                      >
                        + Create Course
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course) => {
                        const lessonCount =
                          course.modules?.reduce(
                            (acc, m) => acc + (m.lessons?.length || 0),
                            0
                          ) || 0;
                        const quizCount = course.quizzes?.length || 0;
                        const enrollCount = course.enrollments?.length || 0;

                        return (
                          <Card
                            key={course.documentId || course.id}
                            className="flex flex-col justify-between"
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" size="sm">
                                  {course.category?.name || "Track"}
                                </Badge>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-foreground">
                                  {course.difficulty || "Beginner"}
                                </span>
                              </div>
                              <CardTitle className="text-base line-clamp-1">{course.title}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {course.description || "No description provided."}
                              </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-surface text-center">
                                <div>
                                  <div className="text-base font-bold text-foreground">
                                    {lessonCount}
                                  </div>
                                  <div className="text-[10px] text-muted uppercase">Lessons</div>
                                </div>
                                <div>
                                  <div className="text-base font-bold text-foreground">
                                    {quizCount}
                                  </div>
                                  <div className="text-[10px] text-muted uppercase">Quizzes</div>
                                </div>
                                <div>
                                  <div className="text-base font-bold text-foreground">
                                    {enrollCount}
                                  </div>
                                  <div className="text-[10px] text-muted uppercase">Learners</div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs font-bold text-foreground pt-1">
                                <span>Enrollment Price:</span>
                                <span>৳{Number(course.price || 0).toLocaleString()}</span>
                              </div>

                              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedCourseId(course.documentId || String(course.id));
                                    setActiveTab("curriculum");
                                  }}
                                >
                                  Manage Lessons & Quizzes →
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    variant="surface"
                                    size="sm"
                                    onClick={() => handleOpenEditCourse(course)}
                                  >
                                    Edit Course
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                      setCourseToDelete(course);
                                      setIsDeleteCourseModalOpen(true);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PER-COURSE LESSONS & QUIZZES HUB */}
              {activeTab === "curriculum" && (
                <div className="space-y-6">
                  {/* Course Selector */}
                  <Card className="bg-surface border-border">
                    <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                          Select Course:
                        </label>
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm font-semibold text-foreground focus:outline-none"
                        >
                          {courses.map((c) => (
                            <option key={c.documentId || c.id} value={c.documentId || String(c.id)}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm" onClick={handleOpenAddLesson}>
                          + Add Lesson
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleOpenAddQuiz}>
                          + Add Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {currentCourse ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Lessons List */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              Course Lessons ({currentCourseLessons.length})
                            </CardTitle>
                            <CardDescription>
                              Video lessons and resources for {currentCourse.title}
                            </CardDescription>
                          </div>
                          <Button variant="primary" size="sm" onClick={handleOpenAddLesson}>
                            + Add Lesson
                          </Button>
                        </CardHeader>

                        <CardContent>
                          {currentCourseLessons.length === 0 ? (
                            <div className="text-center py-8 text-muted">
                              <p className="text-xs">No lessons added to this course yet.</p>
                              <Button
                                variant="primary"
                                size="sm"
                                className="mt-3"
                                onClick={handleOpenAddLesson}
                              >
                                + Add First Lesson
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {currentCourseLessons.map((lesson, idx) => (
                                <div
                                  key={lesson.documentId || lesson.id}
                                  className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-muted flex-shrink-0">
                                      {idx + 1}
                                    </span>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-xs text-foreground truncate">
                                          {lesson.title}
                                        </h4>
                                        {lesson.isFreePreview && (
                                          <Badge variant="highlight" size="sm">
                                            Preview
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-muted truncate">
                                        {lesson.duration || "10:00"} • {lesson.youtubeUrl}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <Button
                                      variant="surface"
                                      size="sm"
                                      className="px-2 py-1 text-xs"
                                      onClick={() => handleOpenEditLesson(lesson)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="px-2 py-1 text-xs"
                                      onClick={() => {
                                        setLessonToDelete(lesson);
                                        setIsDeleteLessonModalOpen(true);
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Right: Quizzes List */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              Course Quizzes ({currentCourseQuizzes.length})
                            </CardTitle>
                            <CardDescription>
                              MCQ assessments attached to {currentCourse.title}
                            </CardDescription>
                          </div>
                          <Button variant="secondary" size="sm" onClick={handleOpenAddQuiz}>
                            + Add Quiz
                          </Button>
                        </CardHeader>

                        <CardContent>
                          {currentCourseQuizzes.length === 0 ? (
                            <div className="text-center py-8 text-muted">
                              <p className="text-xs">No quizzes created for this course yet.</p>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="mt-3"
                                onClick={handleOpenAddQuiz}
                              >
                                + Add First Quiz
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {currentCourseQuizzes.map((quiz) => {
                                const questionCount = quiz.questions?.length || 0;
                                return (
                                  <div
                                    key={quiz.documentId || quiz.id}
                                    className="p-3.5 rounded-lg border border-border bg-surface space-y-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-bold text-sm text-foreground">
                                          {quiz.title}
                                        </h4>
                                        <p className="text-[11px] text-muted mt-0.5">
                                          Pass: {quiz.passingScore || 80}% • Time:{" "}
                                          {quiz.timeLimitMinutes || 20} mins • {questionCount}{" "}
                                          Questions
                                        </p>
                                      </div>
                                      <Badge variant="secondary" size="sm">
                                        {questionCount} Questions
                                      </Badge>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => handleOpenManageQuestions(quiz)}
                                      >
                                        Manage MCQ Questions ({questionCount})
                                      </Button>
                                      <Button
                                        variant="surface"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => handleOpenEditQuiz(quiz)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => {
                                          setQuizToDelete(quiz);
                                          setIsDeleteQuizModalOpen(true);
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted">
                      Please select or create a course to manage lessons and quizzes.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ENROLLED STUDENTS PROGRESS */}
              {activeTab === "progress" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        Enrolled Student Progress
                      </h2>
                      <p className="text-xs text-muted">
                        Monitor completion rates and scores of students enrolled strictly in your
                        courses.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={progressCourseFilter}
                        onChange={(e) => setProgressCourseFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-foreground"
                      >
                        <option value="all">All My Courses</option>
                        {courses.map((c) => (
                          <option key={c.documentId || c.id} value={c.documentId || String(c.id)}>
                            {c.title}
                          </option>
                        ))}
                      </select>

                      <Input
                        placeholder="Search student..."
                        value={searchStudent}
                        onChange={(e) => setSearchStudent(e.target.value)}
                        className="w-48 text-xs"
                      />
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Course Track</TableHead>
                            <TableHead>Progress %</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Enrolled At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-muted text-xs">
                                No enrolled students matching your criteria.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredStudents.map((enrollment) => {
                              const student = enrollment.student;
                              const course = enrollment.course;
                              const progressPct = Number(enrollment.progressPercentage || 0);

                              return (
                                <TableRow key={enrollment.documentId || enrollment.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-xs">
                                        {student?.username?.[0]?.toUpperCase() || "S"}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-foreground text-xs">
                                          {student?.username || "Student"}
                                        </div>
                                        <div className="text-[11px] text-muted">
                                          {student?.email || "student@cpsacademy.io"}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs font-medium text-foreground">
                                    {course?.title || "CPS Course Track"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="w-36 space-y-1">
                                      <ProgressBar value={progressPct} max={100} size="sm" />
                                      <div className="text-[10px] text-muted text-right">
                                        {progressPct}% Completed
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        progressPct >= 100
                                          ? "highlight"
                                          : progressPct > 0
                                          ? "secondary"
                                          : "default"
                                      }
                                      size="sm"
                                    >
                                      {progressPct >= 100
                                        ? "Completed"
                                        : progressPct > 0
                                        ? "In Progress"
                                        : "Enrolled"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted">
                                    {enrollment.createdAt
                                      ? new Date(enrollment.createdAt).toLocaleDateString()
                                      : "Recently"}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* MODALS SECTION */}
          {/* ========================================================================= */}

          {/* 1. Add Course Modal */}
          <Modal
            isOpen={isAddCourseModalOpen}
            onClose={() => setIsAddCourseModalOpen(false)}
            title="Create New Course Track"
            description="Author a new course assigned directly to your instructor profile."
          >
            <form onSubmit={handleCreateCourse} className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium"
                >
                  {formError}
                </div>
              )}

              <Input
                label="Course Title"
                placeholder="e.g., Dynamic Programming & Tree Algorithms"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Category
                  </label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.documentId || cat.id} value={cat.documentId || cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Difficulty
                  </label>
                  <select
                    value={courseDifficulty}
                    onChange={(e) => setCourseDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <Input
                label="Course Price (BDT ৳)"
                type="number"
                placeholder="4000"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                required
              />

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Description & Overview
                </label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Comprehensive syllabus overview, prerequisites, and learning objectives..."
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="surface"
                  size="sm"
                  onClick={() => setIsAddCourseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 2. Edit Course Modal */}
          <Modal
            isOpen={isEditCourseModalOpen}
            onClose={() => setIsEditCourseModalOpen(false)}
            title="Edit Course Details"
            description="Update course metadata, pricing, or description."
          >
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium"
                >
                  {formError}
                </div>
              )}

              <Input
                label="Course Title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Category
                  </label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.documentId || cat.id} value={cat.documentId || cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Difficulty
                  </label>
                  <select
                    value={courseDifficulty}
                    onChange={(e) => setCourseDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <Input
                label="Course Price (BDT ৳)"
                type="number"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                required
              />

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="surface"
                  size="sm"
                  onClick={() => setIsEditCourseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 3. Delete Course Modal */}
          <Modal
            isOpen={isDeleteCourseModalOpen}
            onClose={() => setIsDeleteCourseModalOpen(false)}
            title="Delete Course Track"
            description={`Are you sure you want to delete "${courseToDelete?.title}"? This will permanently remove all related lessons and quizzes.`}
          >
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="surface"
                size="sm"
                onClick={() => setIsDeleteCourseModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteCourse}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </Modal>

          {/* 4. Add Lesson Modal */}
          <Modal
            isOpen={isAddLessonModalOpen}
            onClose={() => setIsAddLessonModalOpen(false)}
            title={`Add Lesson to ${currentCourse?.title || "Course"}`}
            description="Add a new video lesson or learning resource to this course."
          >
            <form onSubmit={handleCreateLesson} className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium"
                >
                  {formError}
                </div>
              )}

              <Input
                label="Lesson Title"
                placeholder="e.g., Introduction to Segment Trees & Range Queries"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                required
              />

              <Input
                label="Video URL (YouTube or Streaming Embed)"
                placeholder="https://www.youtube.com/watch?v=..."
                value={lessonYoutubeUrl}
                onChange={(e) => setLessonYoutubeUrl(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Estimated Duration"
                  placeholder="15:00"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                />

                <div className="flex flex-col justify-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={lessonIsFreePreview}
                      onChange={(e) => setLessonIsFreePreview(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Allow as Free Preview</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Lesson Content / Notes (Text & Markdown)
                </label>
                <textarea
                  rows={3}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Summary notes, formulas, code snippets, or reference links..."
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="surface"
                  size="sm"
                  onClick={() => setIsAddLessonModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Lesson"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 5. Edit Lesson Modal */}
          <Modal
            isOpen={isEditLessonModalOpen}
            onClose={() => setIsEditLessonModalOpen(false)}
            title="Edit Lesson"
            description="Modify lesson title, video URL, duration, or notes."
          >
            <form onSubmit={handleUpdateLesson} className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium"
                >
                  {formError}
                </div>
              )}

              <Input
                label="Lesson Title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                required
              />

              <Input
                label="Video URL"
                value={lessonYoutubeUrl}
                onChange={(e) => setLessonYoutubeUrl(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Duration"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                />

                <div className="flex flex-col justify-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={lessonIsFreePreview}
                      onChange={(e) => setLessonIsFreePreview(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Allow as Free Preview</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Lesson Content / Notes
                </label>
                <textarea
                  rows={3}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="surface"
                  size="sm"
                  onClick={() => setIsEditLessonModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Lesson"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 6. Delete Lesson Modal */}
          <Modal
            isOpen={isDeleteLessonModalOpen}
            onClose={() => setIsDeleteLessonModalOpen(false)}
            title="Delete Lesson"
            description={`Are you sure you want to delete "${lessonToDelete?.title}"?`}
          >
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="surface"
                size="sm"
                onClick={() => setIsDeleteLessonModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteLesson}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </Modal>

          {/* 7. Add Quiz Modal */}
          <Modal
            isOpen={isAddQuizModalOpen}
            onClose={() => setIsAddQuizModalOpen(false)}
            title={`Add Quiz to ${currentCourse?.title || "Course"}`}
            description="Create an MCQ quiz for your course track."
          >
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium"
                >
                  {formError}
                </div>
              )}

              <Input
                label="Quiz Title"
                placeholder="e.g., Dynamic Programming Diagnostic Quiz"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Passing Score Threshold (%)"
                  type="number"
                  placeholder="80"
                  value={quizPassScore}
                  onChange={(e) => setQuizPassScore(e.target.value)}
                  required
                />

                <Input
                  label="Time Limit (Minutes)"
                  type="number"
                  placeholder="20"
                  value={quizTimeLimit}
                  onChange={(e) => setQuizTimeLimit(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="surface"
                  size="sm"
                  onClick={() => setIsAddQuizModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Quiz"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 8. Edit Quiz Modal */}
          <Modal
            isOpen={isEditQuizModalOpen}
            onClose={() => setIsEditQuizModalOpen(false)}
            title="Edit Quiz"
            description="Update quiz title, threshold score, or time limit."
          >
            <form onSubmit={handleUpdateQuiz} className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium"
                >
                  {formError}
                </div>
              )}

              <Input
                label="Quiz Title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Passing Score (%)"
                  type="number"
                  value={quizPassScore}
                  onChange={(e) => setQuizPassScore(e.target.value)}
                  required
                />

                <Input
                  label="Time Limit (Mins)"
                  type="number"
                  value={quizTimeLimit}
                  onChange={(e) => setQuizTimeLimit(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="surface"
                  size="sm"
                  onClick={() => setIsEditQuizModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Quiz"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 9. Delete Quiz Modal */}
          <Modal
            isOpen={isDeleteQuizModalOpen}
            onClose={() => setIsDeleteQuizModalOpen(false)}
            title="Delete Quiz"
            description={`Are you sure you want to delete "${quizToDelete?.title}"?`}
          >
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="surface"
                size="sm"
                onClick={() => setIsDeleteQuizModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteQuiz}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </Modal>

          {/* 10. Manage MCQ Questions Builder Modal */}
          <Modal
            isOpen={isManageQuestionsModalOpen}
            onClose={() => setIsManageQuestionsModalOpen(false)}
            title={`MCQ Questions for "${quizForQuestions?.title}"`}
            description="Add and manage multiple choice questions with correct answer options and explanations."
          >
            <div className="space-y-6">
              {/* Existing Questions List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {(quizForQuestions?.questions || []).length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">
                    No questions added yet. Use the builder below to add questions.
                  </p>
                ) : (
                  quizForQuestions.questions.map((q, idx) => (
                    <div
                      key={q.documentId || q.id}
                      className="p-3 rounded-lg border border-border bg-surface flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-foreground">
                          Q{idx + 1}. {q.prompt}
                        </span>
                        <div className="text-[11px] text-muted">
                          Options: {Array.isArray(q.options) ? q.options.join(", ") : "Options"} •
                          Correct: Option {String.fromCharCode(65 + (Number(q.correctAnswer) || 0))}
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="px-2 py-0.5 text-[11px]"
                        onClick={() => handleDeleteQuestion(q.documentId || q.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New MCQ Question Form */}
              <form
                onSubmit={handleAddQuestion}
                className="space-y-3 pt-4 border-t border-border bg-card p-3 rounded-xl border"
              >
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">
                  + Add New Question
                </h4>

                {formError && (
                  <div
                    role="alert"
                    className="p-2 rounded bg-red-500/10 text-red-600 text-xs font-medium"
                  >
                    {formError}
                  </div>
                )}

                <Input
                  label="Question Prompt"
                  placeholder="e.g., What is the time complexity of building a Segment Tree?"
                  value={questionPrompt}
                  onChange={(e) => setQuestionPrompt(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Option A"
                    placeholder="O(N)"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    required
                  />
                  <Input
                    label="Option B"
                    placeholder="O(N log N)"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    required
                  />
                  <Input
                    label="Option C"
                    placeholder="O(log N)"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                  />
                  <Input
                    label="Option D"
                    placeholder="O(1)"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Correct Option
                    </label>
                    <select
                      value={correctOptionIndex}
                      onChange={(e) => setCorrectOptionIndex(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-foreground"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      {optionC && <option value={2}>Option C</option>}
                      {optionD && <option value={3}>Option D</option>}
                    </select>
                  </div>

                  <Input
                    label="Points"
                    type="number"
                    value={questionPoints}
                    onChange={(e) => setQuestionPoints(e.target.value)}
                  />
                </div>

                <Input
                  label="Explanation (Displayed after grading)"
                  placeholder="Building takes linear time because each element is visited once..."
                  value={questionExplanation}
                  onChange={(e) => setQuestionExplanation(e.target.value)}
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "+ Add Question to Quiz"}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
