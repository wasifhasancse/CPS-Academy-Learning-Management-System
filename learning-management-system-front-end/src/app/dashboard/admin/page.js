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
import { ImageUpload } from "@/components/ui/ImageUpload";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { GrowthLineChart } from "@/components/dashboard/GrowthLineChart";
import { DistributionDonutChart } from "@/components/dashboard/DistributionDonutChart";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Competitive Programming", slug: "competitive-programming" },
  { id: 2, name: "Software Engineering", slug: "software-engineering" },
  { id: 3, name: "Data Structures & Algorithms", slug: "dsa" },
  { id: 4, name: "System Design & Architecture", slug: "system-design" },
  { id: 5, name: "Web Development", slug: "web-development" },
];

export default function AdminDashboardPage() {
  const { user: currentAdmin, token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Core Data States
  const [usersList, setUsersList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [enrollments, setEnrollments] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Search & Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseCategoryFilter, setCourseCategoryFilter] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [progressCourseFilter, setProgressCourseFilter] = useState("all");
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState("all");

  // User Management Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // Course Modals
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

  // Blog Modals
  const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);
  const [isEditBlogModalOpen, setIsEditBlogModalOpen] = useState(false);
  const [isDeleteBlogModalOpen, setIsDeleteBlogModalOpen] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);
  const [blogToDelete, setBlogToDelete] = useState(null);

  // Course Form States
  const [courseTitle, setCourseTitle] = useState("");
  const [courseThumbnailUrl, setCourseThumbnailUrl] = useState("");
  const [courseCategory, setCourseCategory] = useState("1");
  const [coursePrice, setCoursePrice] = useState("4500");
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

  // Blog Form States
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCoverImageUrl, setBlogCoverImageUrl] = useState("");
  const [blogCategorySelect, setBlogCategorySelect] = useState("1");
  const [blogIsPublished, setBlogIsPublished] = useState(true);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all platform data
  const loadAdminData = useCallback(async () => {
    if (!token) {
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    try {
      // 1. Fetch Users
      try {
        const usersRes = await api.get("/users", { token });
        setUsersList(Array.isArray(usersRes) ? usersRes : Array.isArray(usersRes?.data) ? usersRes.data : []);
      } catch (err) {
        console.warn("Could not fetch users list:", err);
      }

      // 2. Fetch Roles
      try {
        const rolesRes = await api.get("/users-permissions/roles", { token });
        const fetchedRoles = rolesRes?.roles || (Array.isArray(rolesRes) ? rolesRes : []);
        setRolesList(fetchedRoles);
      } catch {
        setRolesList([]);
      }

      // 3. Fetch Courses
      try {
        const coursesRes = await api.get(
          "/courses?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[enrollments][populate]=student&populate[category]=*&populate[instructor]=*",
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
        console.warn("Could not fetch courses:", err);
      }

      // 4. Fetch Categories
      try {
        const catRes = await api.get("/categories", { token });
        if (Array.isArray(catRes?.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      } catch {
        setCategories(DEFAULT_CATEGORIES);
      }

      // 5. Fetch Enrollments
      try {
        const enrollRes = await api.get("/enrollments?populate=student&populate=course", { token });
        setEnrollments(Array.isArray(enrollRes?.data) ? enrollRes.data : []);
      } catch {
        setEnrollments([]);
      }

      // 6. Fetch Blogs
      try {
        const blogRes = await api.get("/blog-posts?populate=author&populate=category", { token });
        setBlogs(Array.isArray(blogRes?.data) ? blogRes.data : []);
      } catch {
        setBlogs([]);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Active selected course for curriculum & lesson/quiz authoring
  const currentCourse =
    courses.find((c) => (c.documentId || String(c.id)) === selectedCourseId) || courses[0] || null;

  // Flatten lessons for current course
  const currentCourseLessons =
    currentCourse?.modules?.flatMap((m) => m.lessons || []) || [];

  // Quizzes for current course
  const currentCourseQuizzes = currentCourse?.quizzes || [];

  // KPI Metrics
  const totalUsers = usersList.length;
  const adminCount = usersList.filter(
    (u) => (u.role?.type || u.role?.name || "").toLowerCase() === "admin"
  ).length;
  const managerCount = usersList.filter((u) => {
    const roleStr = (u.role?.type || u.role?.name || "").toLowerCase();
    return roleStr === "content_manager" || roleStr === "content manager";
  }).length;
  const instructorCount = usersList.filter((u) => {
    const roleStr = (u.role?.type || u.role?.name || "").toLowerCase();
    return roleStr === "instructor";
  }).length;
  const studentCount = usersList.filter((u) => {
    const roleStr = (u.role?.type || u.role?.name || "").toLowerCase();
    return roleStr === "student" || roleStr === "authenticated";
  }).length;

  const totalCourses = courses.length;
  const totalLessons = courses.reduce(
    (acc, c) => acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0),
    0
  );
  const totalQuizzes = courses.reduce((acc, c) => acc + (c.quizzes?.length || 0), 0);
  const totalEnrollments = enrollments.length;
  const totalBlogs = blogs.length;
  const publishedBlogsCount = blogs.filter((b) => Boolean(b.publishedAt)).length;
  const draftBlogsCount = blogs.filter((b) => !b.publishedAt).length;

  // --- User Management Handlers ---
  const handleOpenRoleModal = (userItem) => {
    setTargetUser(userItem);
    setSelectedRoleId(userItem.role?.id || userItem.role?.documentId || "");
    setFormError("");
    setIsRoleModalOpen(true);
  };

  const handleUpdateUserRole = async (e) => {
    e.preventDefault();
    if (!targetUser || !selectedRoleId) return;
    setFormError("");
    setIsSubmitting(true);
    try {
      await api.put(`/users/${targetUser.id}`, { role: selectedRoleId }, { token });
      await loadAdminData();
      setIsRoleModalOpen(false);
    } catch (err) {
      setFormError(err?.message || "Failed to update user role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBlockUser = async (userItem) => {
    try {
      const isCurrentlyBlocked = Boolean(userItem.blocked);
      await api.put(`/users/${userItem.id}`, { blocked: !isCurrentlyBlocked }, { token });
      await loadAdminData();
    } catch (err) {
      alert(err?.message || "Failed to update user status.");
    }
  };

  const handleDeleteUser = async () => {
    if (!targetUser) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/users/${targetUser.id}`, { token });
      await loadAdminData();
      setIsDeleteUserModalOpen(false);
    } catch (err) {
      alert(err?.message || "Failed to delete user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Course CRUD Handlers ---
  const handleOpenAddCourse = () => {
    setCourseTitle("");
    setCourseThumbnailUrl("");
    setCourseCategory(categories[0]?.documentId || categories[0]?.id || "1");
    setCoursePrice("4500");
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
          thumbnailUrl: courseThumbnailUrl.trim() || undefined,
          price: Number(coursePrice) || 0,
          difficulty: courseDifficulty,
          description: courseDescription,
          category: courseCategory || undefined,
          instructor: user?.id || undefined,
        },
      };
      await api.post("/courses", payload, { token });
      await loadAdminData();
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
    setCourseThumbnailUrl(course.thumbnailUrl || "");
    setCourseCategory(course.category?.documentId || course.category?.id || "");
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
          thumbnailUrl: courseThumbnailUrl.trim() || null,
          price: Number(coursePrice) || 0,
          difficulty: courseDifficulty,
          description: courseDescription,
          category: courseCategory || null,
        },
      };
      await api.put(`/courses/${targetId}`, payload, { token });
      await loadAdminData();
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
      await loadAdminData();
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
      await loadAdminData();
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
      await loadAdminData();
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
      await loadAdminData();
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
      await loadAdminData();
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
      await loadAdminData();
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
      await loadAdminData();
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
      await loadAdminData();

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
      await loadAdminData();
    } catch (err) {
      alert(err?.message || "Failed to delete question.");
    }
  };

  // --- Blog CRUD Handlers ---
  const handleOpenAddBlog = () => {
    setBlogTitle("");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogCoverImageUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200");
    setBlogCategorySelect(categories[0]?.documentId || categories[0]?.id || "1");
    setBlogIsPublished(true);
    setFormError("");
    setIsAddBlogModalOpen(true);
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    if (!blogTitle.trim()) {
      setFormError("Blog title is required.");
      return;
    }
    if (!blogContent.trim()) {
      setFormError("Blog content is required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const payload = {
        data: {
          title: blogTitle.trim(),
          slug: blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
          excerpt: blogExcerpt.trim(),
          content: blogContent,
          coverImageUrl: blogCoverImageUrl.trim(),
          category: blogCategorySelect || undefined,
          isPublished: blogIsPublished,
        },
      };
      await api.post("/blog-posts", payload, { token });
      await loadAdminData();
      setIsAddBlogModalOpen(false);
    } catch (err) {
      setFormError(err?.message || "Failed to create blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditBlog = (blog) => {
    setBlogToEdit(blog);
    setBlogTitle(blog.title || "");
    setBlogExcerpt(blog.excerpt || "");
    setBlogContent(blog.content || "");
    setBlogCoverImageUrl(blog.coverImageUrl || "");
    setBlogCategorySelect(blog.category?.documentId || blog.category?.id || "1");
    setBlogIsPublished(Boolean(blog.publishedAt));
    setFormError("");
    setIsEditBlogModalOpen(true);
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!blogToEdit || !blogTitle.trim()) return;
    setFormError("");
    setIsSubmitting(true);
    try {
      const targetId = blogToEdit.documentId || blogToEdit.id;
      const payload = {
        data: {
          title: blogTitle.trim(),
          excerpt: blogExcerpt.trim(),
          content: blogContent,
          coverImageUrl: blogCoverImageUrl.trim(),
          category: blogCategorySelect || null,
          isPublished: blogIsPublished,
        },
      };
      await api.put(`/blog-posts/${targetId}`, payload, { token });
      await loadAdminData();
      setIsEditBlogModalOpen(false);
    } catch (err) {
      setFormError(err?.message || "Failed to update blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBlogStatus = async (blog) => {
    try {
      const targetId = blog.documentId || blog.id;
      const isCurrentlyPublished = Boolean(blog.publishedAt);
      await api.put(
        `/blog-posts/${targetId}`,
        {
          data: {
            isPublished: !isCurrentlyPublished,
          },
        },
        { token }
      );
      await loadAdminData();
    } catch (err) {
      alert(err?.message || "Failed to toggle blog status.");
    }
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    setIsSubmitting(true);
    try {
      const targetId = blogToDelete.documentId || blogToDelete.id;
      await api.delete(`/blog-posts/${targetId}`, { token });
      await loadAdminData();
      setIsDeleteBlogModalOpen(false);
    } catch (err) {
      alert(err?.message || "Failed to delete blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered lists
  const filteredUsers = usersList.filter((u) => {
    const nameMatch =
      !userSearch ||
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const roleType = (u.role?.type || u.role?.name || "").toLowerCase();
    const roleMatch =
      userRoleFilter === "all" ||
      roleType === userRoleFilter ||
      (userRoleFilter === "student" && roleType === "authenticated");
    return nameMatch && roleMatch;
  });

  const filteredCourses = courses.filter((c) => {
    const titleMatch = !courseSearch || c.title?.toLowerCase().includes(courseSearch.toLowerCase());
    const catMatch =
      courseCategoryFilter === "all" ||
      (c.category?.documentId || String(c.category?.id)) === courseCategoryFilter;
    return titleMatch && catMatch;
  });

  const filteredStudents = enrollments.filter((enrollment) => {
    const student = enrollment.student;
    const course = enrollment.course;
    const nameMatch =
      !studentSearch ||
      student?.username?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student?.email?.toLowerCase().includes(studentSearch.toLowerCase());
    const courseMatch =
      progressCourseFilter === "all" ||
      (course?.documentId || String(course?.id)) === progressCourseFilter;
    return nameMatch && courseMatch;
  });

  const filteredBlogs = blogs.filter((b) => {
    const titleMatch = !blogSearch || b.title?.toLowerCase().includes(blogSearch.toLowerCase());
    const statusMatch =
      blogStatusFilter === "all" ||
      (blogStatusFilter === "published" && Boolean(b.publishedAt)) ||
      (blogStatusFilter === "draft" && !b.publishedAt);
    return titleMatch && statusMatch;
  });

  const studentUsersCount = usersList.filter((u) => u.role?.type === "student" || u.role?.name === "Student").length;
  const instructorUsersCount = usersList.filter((u) => u.role?.type === "instructor" || u.role?.name === "Instructor").length;
  const managerUsersCount = usersList.filter((u) => u.role?.type === "content_manager" || u.role?.name === "Content Manager").length;
  const adminUsersCount = usersList.filter((u) => u.role?.type === "admin" || u.role?.name === "Admin").length;

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "users",
      label: "User & Roles",
      badge: usersList.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: "courses",
      label: "Platform Courses",
      badge: courses.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "curriculum",
      label: "Curriculum Hub",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: "blogs",
      label: "Blog Control",
      badge: blogs.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      id: "progress",
      label: "Student Progress",
      badge: enrollments.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "My Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <DashboardLayout
        roleTitle="System Admin Hub"
        subtitle="Overview"
        breadcrumb="Admin"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="space-y-6">
          {isLoadingData ? (
            <div className="p-12 text-center text-muted text-sm">
              Loading platform data from Neon PostgreSQL...
            </div>
          ) : (
            <>
              {/* ========================================================================= */}
              {/* TAB 1: OVERVIEW */}
              {/* ========================================================================= */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* 1. 5-Card Metric Stat Grid */}
                  <DashboardStatsGrid
                    stats={[
                      {
                        title: "TOTAL USERS",
                        value: totalUsers,
                        subtitle: `${studentUsersCount} Students • ${instructorUsersCount} Instructors`,
                        icon: (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        ),
                      },
                      {
                        title: "TOTAL COURSES",
                        value: totalCourses,
                        subtitle: "Platform Learning Tracks",
                        icon: (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        ),
                      },
                      {
                        title: "ASSESSMENTS",
                        value: totalQuizzes,
                        subtitle: "MCQ Evaluations",
                        icon: (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ),
                      },
                      {
                        title: "ACTIVE ALERTS",
                        value: usersList.filter((u) => u.blocked).length || 0,
                        isAlert: usersList.some((u) => u.blocked),
                        badge: usersList.some((u) => u.blocked) ? "Action Needed" : "All Clear",
                        subtitle: "Blocked / Restricted Accounts",
                        icon: (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        ),
                      },
                      {
                        title: "STUDENT SEATS",
                        value: totalEnrollments,
                        subtitle: "Platform Enrollments",
                        icon: (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                      },
                    ]}
                  />

                  {/* 2. Charts Row: Real Growth vs User Role Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <GrowthLineChart
                        title="Platform Scale & Adoption"
                        subtitle="User registrations and course enrollments"
                        seriesA={{
                          name: "Registered Users",
                          data: [0, Math.floor(totalUsers * 0.2), Math.floor(totalUsers * 0.4), Math.floor(totalUsers * 0.6), Math.floor(totalUsers * 0.8), totalUsers, totalUsers],
                          color: "#3B82F6",
                        }}
                        seriesB={{
                          name: "Enrollments",
                          data: [0, Math.floor(totalEnrollments * 0.2), Math.floor(totalEnrollments * 0.4), Math.floor(totalEnrollments * 0.6), Math.floor(totalEnrollments * 0.8), totalEnrollments, totalEnrollments],
                          color: "#10B981",
                        }}
                        months={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <DistributionDonutChart
                        title="Platform User Roles"
                        subtitle="Community distribution by role"
                        items={[
                          { label: "Students", value: studentUsersCount, color: "#285A48" },
                          { label: "Instructors", value: instructorUsersCount, color: "#408A71" },
                          { label: "Staff & Admins", value: managerUsersCount + adminUsersCount, color: "#B0E4CC" },
                        ]}
                      />
                    </div>
                  </div>

                  {/* 3. Recent Activity Data Table */}
                  <ActivityTable
                    title="Recent Platform User Management"
                    subtitle="Latest registrations and role assignments needing oversight"
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    columns={["USER / STUDENT", "EMAIL", "ASSIGNED ROLE", "STATUS", "ACTION"]}
                    onViewAll={() => setActiveTab("users")}
                    viewAllLabel="View All Users"
                    data={usersList.slice(0, 6).map((u) => ({
                      id: u.id,
                      item: u.username,
                      user: u.email,
                      category: u.role?.name || "Student",
                      status: u.blocked ? "PENDING" : "ACTIVE",
                      actionLabel: "Manage",
                      onAction: () => handleOpenRoleModal(u),
                    }))}
                  />
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: USER & ROLE MANAGEMENT */}
              {/* ========================================================================= */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        User & Role Management ({filteredUsers.length})
                      </h3>
                      <p className="text-xs text-muted">
                        Assign roles, modify permissions, or block/remove accounts across CPS Academy.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Search user by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-64 text-xs"
                      />
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="content_manager">Content Managers</option>
                        <option value="instructor">Instructors</option>
                        <option value="student">Students</option>
                      </select>
                    </div>
                  </div>

                  {/* Users Table */}
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User Account</TableHead>
                            <TableHead>Email Address</TableHead>
                            <TableHead>Current Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="p-0">
                                <EmptyState
                                  size="sm"
                                  icon={
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                  }
                                  title="No Users Found"
                                  description={userSearch || userRoleFilter !== "all" ? "No platform accounts match your active search or role filter." : "No platform user accounts found."}
                                />
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredUsers.map((u) => {
                              const roleName = u.role?.name || "Student";
                              const isBlocked = Boolean(u.blocked);
                              const isCurrentUser = String(u.id) === String(currentAdmin?.id);

                              return (
                                <TableRow key={u.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-xs">
                                        {u.username?.[0]?.toUpperCase() || "U"}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-foreground text-xs">
                                          {u.username} {isCurrentUser && "(You)"}
                                        </div>
                                        <div className="text-[10px] text-muted">ID: {u.id}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted font-mono">
                                    {u.email}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        roleName.toLowerCase() === "admin"
                                          ? "primary"
                                          : roleName.toLowerCase() === "instructor"
                                          ? "highlight"
                                          : "secondary"
                                      }
                                    >
                                      {roleName}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {isBlocked ? (
                                      <Badge variant="danger">Blocked</Badge>
                                    ) : (
                                      <Badge variant="secondary">Active</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs py-1"
                                        onClick={() => handleOpenRoleModal(u)}
                                      >
                                        Change Role
                                      </Button>
                                      <Button
                                        variant={isBlocked ? "secondary" : "surface"}
                                        size="sm"
                                        className="text-xs py-1"
                                        disabled={isCurrentUser}
                                        onClick={() => handleToggleBlockUser(u)}
                                      >
                                        {isBlocked ? "Unblock" : "Block"}
                                      </Button>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        className="text-xs py-1"
                                        disabled={isCurrentUser}
                                        onClick={() => {
                                          setTargetUser(u);
                                          setIsDeleteUserModalOpen(true);
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </div>
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

              {/* ========================================================================= */}
              {/* TAB 3: PLATFORM COURSES */}
              {/* ========================================================================= */}
              {activeTab === "courses" && (
                <div className="space-y-6">
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Search courses..."
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        className="w-64 text-xs"
                      />
                      <select
                        value={courseCategoryFilter}
                        onChange={(e) => setCourseCategoryFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.documentId || cat.id} value={cat.documentId || String(cat.id)}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
                      + Add New Course
                    </Button>
                  </div>

                  {/* Course Cards Grid */}
                  {filteredCourses.length === 0 ? (
                    <EmptyState
                      icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      }
                      title="No Course Tracks Found"
                      description={courseSearch || courseCategoryFilter !== "all" ? "No courses match your active search or category filter." : "No platform course tracks have been created yet."}
                      action={
                        <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
                          + Create New Course
                        </Button>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredCourses.map((course) => {
                        const lessonsCount =
                          course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
                        const quizzesCount = course.quizzes?.length || 0;
                        const enrolledCount = course.enrollments?.length || 0;

                        return (
                          <Card key={course.documentId || course.id} className="flex flex-col justify-between">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <Badge variant="outline">{course.category?.name || "General"}</Badge>
                                <Badge variant="primary">৳{course.price || 0}</Badge>
                              </div>
                              <CardTitle className="text-base mt-2 line-clamp-2">
                                {course.title}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 text-xs">
                                {course.description || "Platform course track and evaluation curriculum."}
                              </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-0 space-y-4">
                              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface border border-border text-center text-xs">
                                <div>
                                  <span className="block font-bold text-foreground">{lessonsCount}</span>
                                  <span className="text-[10px] text-muted">Lessons</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-foreground">{quizzesCount}</span>
                                  <span className="text-[10px] text-muted">Quizzes</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-foreground">{enrolledCount}</span>
                                  <span className="text-[10px] text-muted">Students</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs"
                                  onClick={() => {
                                    setSelectedCourseId(course.documentId || String(course.id));
                                    setActiveTab("curriculum");
                                  }}
                                >
                                  Manage Content
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleOpenEditCourse(course)}
                                >
                                  Edit
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
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: CURRICULUM HUB (LESSONS & QUIZZES) */}
              {/* ========================================================================= */}
              {activeTab === "curriculum" && (
                <div className="space-y-6">
                  {/* Select Course Selector Bar */}
                  <Card className="bg-surface border-border p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider shrink-0">
                          Active Course:
                        </label>
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          disabled={courses.length === 0}
                          className="h-10 px-3 py-2 rounded-lg bg-card border border-border text-xs sm:text-sm font-semibold text-foreground focus:outline-none min-w-[220px] sm:min-w-[280px] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {courses.length === 0 ? (
                            <option value="">No courses available</option>
                          ) : (
                            courses.map((c) => (
                              <option key={c.documentId || c.id} value={c.documentId || String(c.id)}>
                                {c.title} (৳{c.price || 0})
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!currentCourse}
                          onClick={handleOpenAddLesson}
                          className="h-10"
                        >
                          + Add Lesson
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!currentCourse}
                          onClick={handleOpenAddQuiz}
                          className="h-10"
                        >
                          + Add Quiz
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {courses.length === 0 ? (
                    <EmptyState
                      icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      }
                      title="No Course Tracks Available"
                      description="You must create a course before you can manage its video lessons and quizzes."
                      action={
                        <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
                          + Create New Course
                        </Button>
                      }
                    />
                  ) : currentCourse ? (
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
                            <EmptyState
                              size="sm"
                              icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              }
                              title="No Lessons in this Track"
                              description={`Add video lessons to establish the learning syllabus for "${currentCourse.title}".`}
                              action={
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={handleOpenAddLesson}
                                >
                                  + Add First Lesson
                                </Button>
                              }
                            />
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
                                          <Badge variant="highlight" className="text-[10px] py-0">
                                            Free Preview
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-muted truncate mt-0.5">
                                        ⏱ {lesson.duration || "10:00"} • {lesson.youtubeUrl}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleOpenEditLesson(lesson)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
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
                              MCQ Quizzes ({currentCourseQuizzes.length})
                            </CardTitle>
                            <CardDescription>
                              Graded assessments and questions for {currentCourse.title}
                            </CardDescription>
                          </div>
                          <Button variant="secondary" size="sm" onClick={handleOpenAddQuiz}>
                            + Add Quiz
                          </Button>
                        </CardHeader>

                        <CardContent>
                          {currentCourseQuizzes.length === 0 ? (
                            <EmptyState
                              size="sm"
                              icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              }
                              title="No Quizzes in this Track"
                              description={`Add multiple choice assessments to grade students enrolled in "${currentCourse.title}".`}
                              action={
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleOpenAddQuiz}
                                >
                                  + Add First Quiz
                                </Button>
                              }
                            />
                          ) : (
                            <div className="space-y-3">
                              {currentCourseQuizzes.map((quiz) => (
                                <div
                                  key={quiz.documentId || quiz.id}
                                  className="p-3.5 rounded-lg border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                  <div>
                                    <h4 className="font-semibold text-xs text-foreground">
                                      {quiz.title}
                                    </h4>
                                    <p className="text-[11px] text-muted mt-0.5">
                                      Passing: {quiz.passingScore || 80}% • Time: {quiz.timeLimitMinutes || 20}m • Questions: {quiz.questions?.length || 0}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleOpenManageQuestions(quiz)}
                                    >
                                      Manage Questions ({quiz.questions?.length || 0})
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleOpenEditQuiz(quiz)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => {
                                        setQuizToDelete(quiz);
                                        setIsDeleteQuizModalOpen(true);
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
                    </div>
                  ) : (
                    <EmptyState
                      icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      }
                      title="Select a Course Track"
                      description="Choose a course track from the selector above to manage its video curriculum and quizzes."
                    />
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: BLOG CONTROL */}
              {/* ========================================================================= */}
              {activeTab === "blogs" && (
                <div className="space-y-6">
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Search blog posts..."
                        value={blogSearch}
                        onChange={(e) => setBlogSearch(e.target.value)}
                        className="w-64 text-xs"
                      />
                      <select
                        value={blogStatusFilter}
                        onChange={(e) => setBlogStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
                      >
                        <option value="all">All Posts ({totalBlogs})</option>
                        <option value="published">Published ({publishedBlogsCount})</option>
                        <option value="draft">Drafts ({draftBlogsCount})</option>
                      </select>
                    </div>

                    <Button variant="primary" size="sm" onClick={handleOpenAddBlog}>
                      + Write New Blog Post
                    </Button>
                  </div>

                  {/* Blog Posts Table */}
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Blog Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Published Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBlogs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="p-0">
                                <EmptyState
                                  size="sm"
                                  icon={
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                  }
                                  title="No Blog Posts Found"
                                  description={blogSearch || blogStatusFilter !== "all" ? "No blog articles match your current search or status filter." : "No platform blog posts written yet."}
                                  action={
                                    <Button variant="primary" size="sm" onClick={handleOpenAddBlog}>
                                      + Write First Post
                                    </Button>
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredBlogs.map((blog) => {
                              const isPublished = Boolean(blog.publishedAt);

                              return (
                                <TableRow key={blog.documentId || blog.id}>
                                  <TableCell className="font-semibold text-foreground text-xs max-w-xs truncate">
                                    {blog.title}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted">
                                    {blog.category?.name || "General"}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted">
                                    {blog.author?.username || currentAdmin?.username || "Admin"}
                                  </TableCell>
                                  <TableCell>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleBlogStatus(blog)}
                                      className="cursor-pointer"
                                    >
                                      {isPublished ? (
                                        <Badge variant="primary">Published</Badge>
                                      ) : (
                                        <Badge variant="secondary">Draft</Badge>
                                      )}
                                    </button>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted">
                                    {blog.publishedAt
                                      ? new Date(blog.publishedAt).toLocaleDateString()
                                      : "—"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleOpenEditBlog(blog)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                          setBlogToDelete(blog);
                                          setIsDeleteBlogModalOpen(true);
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </div>
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

              {/* ========================================================================= */}
              {/* TAB 6: STUDENT PROGRESS */}
              {/* ========================================================================= */}
              {activeTab === "progress" && (
                <div className="space-y-6">
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Platform Student Progress ({filteredStudents.length})
                      </h3>
                      <p className="text-xs text-muted">
                        Live monitoring of students enrolled across all course tracks
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={progressCourseFilter}
                        onChange={(e) => setProgressCourseFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
                      >
                        <option value="all">All Platform Courses</option>
                        {courses.map((c) => (
                          <option key={c.documentId || c.id} value={c.documentId || String(c.id)}>
                            {c.title}
                          </option>
                        ))}
                      </select>

                      <Input
                        placeholder="Search student..."
                        value={studentSearch}
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
                              <TableCell colSpan={5} className="p-0">
                                <EmptyState
                                  size="sm"
                                  icon={
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                  }
                                  title="No Enrolled Students Found"
                                  description={studentSearch || progressCourseFilter !== "all" ? "No student matches your current search or course filter." : "No student enrollments found on the platform."}
                                />
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
                                    {progressPct === 100 ? (
                                      <Badge variant="primary">Completed</Badge>
                                    ) : (
                                      <Badge variant="secondary">In Progress</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted">
                                    {enrollment.createdAt
                                      ? new Date(enrollment.createdAt).toLocaleDateString()
                                      : "Recent"}
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

              {/* TAB 7: PROFILE SETTINGS */}
              {activeTab === "profile" && <ProfileTab />}
            </>
          )}

          {/* ========================================================================= */}
          {/* MODALS SECTION */}
          {/* ========================================================================= */}

          {/* 1. Change User Role Modal */}
          <Modal
            isOpen={isRoleModalOpen}
            onClose={() => setIsRoleModalOpen(false)}
            title="Modify User Role"
            description={`Change the platform access role for ${targetUser?.username} (${targetUser?.email}).`}
          >
            <form onSubmit={handleUpdateUserRole} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Select Role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                  required
                >
                  <option value="">-- Choose Role --</option>
                  {rolesList.map((r) => (
                    <option key={r.id || r.documentId} value={r.id || r.documentId}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                  {rolesList.length === 0 && (
                    <>
                      <option value="admin">Admin</option>
                      <option value="content_manager">Content Manager</option>
                      <option value="instructor">Instructor</option>
                      <option value="student">Student</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsRoleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Save Role Change"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 2. Delete User Modal */}
          <Modal
            isOpen={isDeleteUserModalOpen}
            onClose={() => setIsDeleteUserModalOpen(false)}
            title="Delete User Account"
            description={`Are you sure you want to delete ${targetUser?.username}?`}
          >
            <div className="space-y-4">
              <p className="text-xs text-foreground">
                This will permanently delete the user account for <strong>{targetUser?.email}</strong>.
              </p>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteUserModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="danger" size="sm" disabled={isSubmitting} onClick={handleDeleteUser}>
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </Modal>

          {/* 3. Add Course Modal */}
          <Modal
            isOpen={isAddCourseModalOpen}
            onClose={() => setIsAddCourseModalOpen(false)}
            title="Create New Course Track"
            description="Author a new platform-wide learning track."
          >
            <form onSubmit={handleCreateCourse} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
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
              <ImageUpload
                value={courseThumbnailUrl}
                onChange={setCourseThumbnailUrl}
                label="Course Thumbnail Image"
                description="Upload an image to ImgBB or enter direct image URL"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
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
                  <label className="text-xs font-semibold text-foreground mb-1 block">Difficulty</label>
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
                <label className="text-xs font-semibold text-foreground mb-1 block">Description & Overview</label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                  placeholder="Summary of skills and outcomes..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddCourseModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 4. Edit Course Modal */}
          <Modal
            isOpen={isEditCourseModalOpen}
            onClose={() => setIsEditCourseModalOpen(false)}
            title="Edit Course Details"
            description="Update course metadata, pricing, or description."
          >
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
                  {formError}
                </div>
              )}
              <Input
                label="Course Title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                required
              />
              <ImageUpload
                value={courseThumbnailUrl}
                onChange={setCourseThumbnailUrl}
                label="Course Thumbnail Image"
                description="Upload an image to ImgBB or enter direct image URL"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
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
                  <label className="text-xs font-semibold text-foreground mb-1 block">Difficulty</label>
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
                <label className="text-xs font-semibold text-foreground mb-1 block">Description & Overview</label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditCourseModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 5. Delete Course Modal */}
          <Modal
            isOpen={isDeleteCourseModalOpen}
            onClose={() => setIsDeleteCourseModalOpen(false)}
            title="Delete Course Track"
            description="Are you sure you want to delete this course and its curriculum?"
          >
            <div className="space-y-4">
              <p className="text-xs text-foreground">
                This will permanently delete <strong>{courseToDelete?.title}</strong> and all associated lessons and quizzes.
              </p>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteCourseModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="danger" size="sm" disabled={isSubmitting} onClick={handleDeleteCourse}>
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </Modal>

          {/* 6. Add Lesson Modal */}
          <Modal
            isOpen={isAddLessonModalOpen}
            onClose={() => setIsAddLessonModalOpen(false)}
            title="Add Video Lesson"
            description={`Add a new lesson to ${currentCourse?.title || "selected course"}.`}
          >
            <form onSubmit={handleCreateLesson} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
                  {formError}
                </div>
              )}
              <Input
                label="Lesson Title"
                placeholder="e.g., Introduction to Segment Trees"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                required
              />
              <Input
                label="YouTube Video URL"
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={lessonYoutubeUrl}
                onChange={(e) => setLessonYoutubeUrl(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Estimated Duration"
                  placeholder="e.g., 18:30"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                />
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={lessonIsFreePreview}
                      onChange={(e) => setLessonIsFreePreview(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    Free Preview Lesson
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Lesson Notes / Content (Markdown)</label>
                <textarea
                  rows={4}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                  placeholder="Write problem links, code snippets, or notes..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddLessonModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Lesson"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 7. Edit Lesson Modal */}
          <Modal
            isOpen={isEditLessonModalOpen}
            onClose={() => setIsEditLessonModalOpen(false)}
            title="Edit Lesson Details"
            description="Update lesson title, video URL, or study notes."
          >
            <form onSubmit={handleUpdateLesson} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
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
                label="YouTube Video URL"
                value={lessonYoutubeUrl}
                onChange={(e) => setLessonYoutubeUrl(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Estimated Duration"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                />
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={lessonIsFreePreview}
                      onChange={(e) => setLessonIsFreePreview(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    Free Preview Lesson
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Lesson Notes / Content</label>
                <textarea
                  rows={4}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditLessonModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 8. Delete Lesson Modal */}
          <Modal
            isOpen={isDeleteLessonModalOpen}
            onClose={() => setIsDeleteLessonModalOpen(false)}
            title="Delete Lesson"
            description="Are you sure you want to delete this lesson?"
          >
            <div className="space-y-4">
              <p className="text-xs text-foreground">
                This will delete <strong>{lessonToDelete?.title}</strong> from this course.
              </p>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteLessonModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="danger" size="sm" disabled={isSubmitting} onClick={handleDeleteLesson}>
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </Modal>

          {/* 9. Add Quiz Modal */}
          <Modal
            isOpen={isAddQuizModalOpen}
            onClose={() => setIsAddQuizModalOpen(false)}
            title="Create MCQ Quiz"
            description={`Create an evaluation quiz for ${currentCourse?.title || "this course"}.`}
          >
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
                  {formError}
                </div>
              )}
              <Input
                label="Quiz Title"
                placeholder="e.g., Dynamic Programming Checkpoint Quiz"
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
                  label="Time Limit (Minutes)"
                  type="number"
                  value={quizTimeLimit}
                  onChange={(e) => setQuizTimeLimit(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddQuizModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Quiz"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 10. Edit Quiz Modal */}
          <Modal
            isOpen={isEditQuizModalOpen}
            onClose={() => setIsEditQuizModalOpen(false)}
            title="Edit Quiz Settings"
            description="Update quiz title, passing threshold, or time limit."
          >
            <form onSubmit={handleUpdateQuiz} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
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
                  label="Time Limit (Minutes)"
                  type="number"
                  value={quizTimeLimit}
                  onChange={(e) => setQuizTimeLimit(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditQuizModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 11. Delete Quiz Modal */}
          <Modal
            isOpen={isDeleteQuizModalOpen}
            onClose={() => setIsDeleteQuizModalOpen(false)}
            title="Delete Quiz"
            description="Are you sure you want to delete this evaluation quiz?"
          >
            <div className="space-y-4">
              <p className="text-xs text-foreground">
                This will delete <strong>{quizToDelete?.title}</strong> and all questions in it.
              </p>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteQuizModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="danger" size="sm" disabled={isSubmitting} onClick={handleDeleteQuiz}>
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </Modal>

          {/* 12. MCQ Question Builder Modal */}
          <Modal
            isOpen={isManageQuestionsModalOpen}
            onClose={() => setIsManageQuestionsModalOpen(false)}
            title={`MCQ Questions: ${quizForQuestions?.title || "Quiz"}`}
            description="Add multiple choice questions with server-side auto-graded answers."
          >
            <div className="space-y-6">
              {/* Existing Questions List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Current Questions ({quizForQuestions?.questions?.length || 0})
                </h4>
                {(!quizForQuestions?.questions || quizForQuestions.questions.length === 0) ? (
                  <p className="text-xs text-muted">No questions added yet. Use the form below to add questions.</p>
                ) : (
                  quizForQuestions.questions.map((q, idx) => (
                    <div
                      key={q.documentId || q.id || idx}
                      className="p-3 rounded-lg border border-border bg-surface flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="font-semibold text-foreground">
                          Q{idx + 1}: {q.prompt}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted">
                          {Array.isArray(q.options) && q.options.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className={oIdx === q.correctAnswer ? "text-primary dark:text-highlight font-semibold" : ""}
                            >
                              {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctAnswer ? "✓ (Correct)" : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="py-1 px-2 text-[10px]"
                        onClick={() => handleDeleteQuestion(q.documentId || q.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Question Form */}
              <form onSubmit={handleAddQuestion} className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  + Add New Question
                </h4>
                {formError && (
                  <div role="alert" className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs">
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
                  <Input label="Option A *" value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
                  <Input label="Option B *" value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
                  <Input label="Option C (Optional)" value={optionC} onChange={(e) => setOptionC(e.target.value)} />
                  <Input label="Option D (Optional)" value={optionD} onChange={(e) => setOptionD(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Correct Answer Key *</label>
                    <select
                      value={correctOptionIndex}
                      onChange={(e) => setCorrectOptionIndex(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
                    >
                      <option value={0}>Option A is Correct</option>
                      <option value={1}>Option B is Correct</option>
                      {optionC && <option value={2}>Option C is Correct</option>}
                      {optionD && <option value={3}>Option D is Correct</option>}
                    </select>
                  </div>
                  <Input
                    label="Points Value"
                    type="number"
                    value={questionPoints}
                    onChange={(e) => setQuestionPoints(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Explanation / Solution Notes</label>
                  <textarea
                    rows={2}
                    value={questionExplanation}
                    onChange={(e) => setQuestionExplanation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                    placeholder="Explanation revealed to students after quiz submission..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Adding Question..." : "+ Add Question to Quiz"}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>

          {/* 13. Add Blog Post Modal */}
          <Modal
            isOpen={isAddBlogModalOpen}
            onClose={() => setIsAddBlogModalOpen(false)}
            title="Write New Blog Post"
            description="Create an article for the CPS Academy student & engineering community."
          >
            <form onSubmit={handleCreateBlog} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
                  {formError}
                </div>
              )}
              <Input
                label="Article Title"
                placeholder="e.g., Dynamic Programming Patterns for FAANG Interviews"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
                  <select
                    value={blogCategorySelect}
                    onChange={(e) => setBlogCategorySelect(e.target.value)}
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
                  <label className="text-xs font-semibold text-foreground mb-1 block">Publish Status</label>
                  <select
                    value={blogIsPublished ? "published" : "draft"}
                    onChange={(e) => setBlogIsPublished(e.target.value === "published")}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
                  >
                    <option value="published">Published (Live to Students & Public)</option>
                    <option value="draft">Draft (Private to Managers/Admins)</option>
                  </select>
                </div>
              </div>
              <Input
                label="Cover Image URL"
                placeholder="https://images.unsplash.com/..."
                value={blogCoverImageUrl}
                onChange={(e) => setBlogCoverImageUrl(e.target.value)}
              />
              <Input
                label="Short Excerpt / Summary"
                placeholder="A brief 1-2 sentence overview shown in the blog cards..."
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
              />
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Article Body (Markdown)</label>
                <textarea
                  rows={6}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                  placeholder="Write your article content using standard markdown..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddBlogModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Publishing..." : blogIsPublished ? "Publish Post" : "Save as Draft"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 14. Edit Blog Post Modal */}
          <Modal
            isOpen={isEditBlogModalOpen}
            onClose={() => setIsEditBlogModalOpen(false)}
            title="Edit Blog Post"
            description="Update article content, metadata, or publishing status."
          >
            <form onSubmit={handleUpdateBlog} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-medium">
                  {formError}
                </div>
              )}
              <Input
                label="Article Title"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
                  <select
                    value={blogCategorySelect}
                    onChange={(e) => setBlogCategorySelect(e.target.value)}
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
                  <label className="text-xs font-semibold text-foreground mb-1 block">Publish Status</label>
                  <select
                    value={blogIsPublished ? "published" : "draft"}
                    onChange={(e) => setBlogIsPublished(e.target.value === "published")}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
                  >
                    <option value="published">Published (Live to Students & Public)</option>
                    <option value="draft">Draft (Private to Managers/Admins)</option>
                  </select>
                </div>
              </div>
              <Input
                label="Cover Image URL"
                value={blogCoverImageUrl}
                onChange={(e) => setBlogCoverImageUrl(e.target.value)}
              />
              <Input
                label="Short Excerpt / Summary"
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
              />
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Article Body (Markdown)</label>
                <textarea
                  rows={6}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditBlogModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* 15. Delete Blog Post Modal */}
          <Modal
            isOpen={isDeleteBlogModalOpen}
            onClose={() => setIsDeleteBlogModalOpen(false)}
            title="Delete Blog Post"
            description="Are you sure you want to delete this blog post?"
          >
            <div className="space-y-4">
              <p className="text-xs text-foreground">
                This will permanently delete <strong>{blogToDelete?.title}</strong>.
              </p>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteBlogModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="danger" size="sm" disabled={isSubmitting} onClick={handleDeleteBlog}>
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
