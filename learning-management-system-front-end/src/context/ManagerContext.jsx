"use client";

import { BlogModal } from "@/components/dashboard/modals/BlogModal";
import { ConfirmDeleteModal } from "@/components/dashboard/modals/ConfirmDeleteModal";
import { CourseModal } from "@/components/dashboard/modals/CourseModal";
import { LessonModal } from "@/components/dashboard/modals/LessonModal";
import { ManageQuestionsModal } from "@/components/dashboard/modals/ManageQuestionsModal";
import { QuizModal } from "@/components/dashboard/modals/QuizModal";
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
    HiOutlineClipboardDocumentCheck,
    HiOutlinePencilSquare,
} from "react-icons/hi2";

const ManagerContext = createContext(null);

export function ManagerProvider({ children }) {
  const { user: currentManager, token } = useAuth();

  // Core Data States
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Search
  const [courseSearch, setCourseSearch] = useState("");
  const [courseCategoryFilter, setCourseCategoryFilter] = useState("all");
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState("all");
  const [progressCourseFilter, setProgressCourseFilter] = useState("all");
  const [searchStudent, setSearchStudent] = useState("");

  // Curriculum Hub State
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Modals & Target Entities
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "",
    price: "0",
    difficulty: "Beginner",
    description: "",
    thumbnailUrl: "",
  });

  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    youtubeUrl: "",
    duration: "10:00",
    isFreePreview: false,
    notes: "",
  });

  const [isDeleteLessonModalOpen, setIsDeleteLessonModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: "",
    totalScore: "100",
    timeLimitMinutes: "20",
  });

  const [isDeleteQuizModalOpen, setIsDeleteQuizModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const [isManageQuestionsOpen, setIsManageQuestionsOpen] = useState(false);
  const [quizForQuestions, setQuizForQuestions] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    prompt: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: 0,
    explanation: "",
  });

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    category: "",
    status: "draft",
    excerpt: "",
    content: "",
    coverImageUrl: "",
  });

  const [isDeleteBlogModalOpen, setIsDeleteBlogModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  // 1. Data Loader
  const loadManagerData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [coursesRes, catsRes, blogsRes, enrollsRes] = await Promise.all([
        api
          .get(
            "/courses?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[category]=*&populate[instructor]=*&populate[enrollments]=*",
            { token },
          )
          .catch(() => ({ data: [] })),
        api.get("/categories", { token }).catch(() => ({ data: [] })),
        api
          .get("/blog-posts?populate=author&populate=category", { token })
          .catch(() => ({ data: [] })),
        api
          .get(
            "/enrollments?populate[student]=*&populate[course][populate]=modules.lessons&populate[course][populate]=quizzes",
            { token },
          )
          .catch(() => ({ data: [] })),
      ]);

      const resolvedCourses = Array.isArray(coursesRes?.data)
        ? coursesRes.data
        : [];
      const resolvedCats = Array.isArray(catsRes?.data) ? catsRes.data : [];
      const resolvedBlogs = Array.isArray(blogsRes?.data) ? blogsRes.data : [];
      const resolvedEnrolls = Array.isArray(enrollsRes?.data)
        ? enrollsRes.data
        : [];

      // Trust the backend-persisted progressPercentage (single source of truth,
      // recalculated server-side on every lesson/quiz completion) so this value
      // is identical to what the Student, Instructor, and Admin dashboards see.
      const enhancedEnrolls = resolvedEnrolls.map((e) => {
        if (!e.course || !e.student) return e;
        const finalPct = Math.min(
          100,
          Math.max(0, Number(e.progressPercentage || 0)),
        );

        return {
          ...e,
          progressPercentage: finalPct,
          status:
            finalPct === 100
              ? "Completed"
              : finalPct > 0
                ? "In Progress"
                : "Enrolled",
        };
      });

      setCourses(resolvedCourses);
      setCategories(resolvedCats);
      setBlogs(resolvedBlogs);
      setStudentsProgress(enhancedEnrolls);

      if (resolvedCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(
          resolvedCourses[0].documentId || String(resolvedCourses[0].id),
        );
      }
    } catch (err) {
      console.error("Failed to load content manager data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedCourseId]);

  useEffect(() => {
    loadManagerData();
  }, [loadManagerData]);

  // Derived Metrics & Filters
  const totalCourses = courses.length;
  const totalLessons = courses.reduce(
    (acc, c) =>
      acc +
      (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0),
    0,
  );
  const totalQuizzes = courses.reduce(
    (acc, c) => acc + (c.quizzes?.length || 0),
    0,
  );
  const totalEnrollments = studentsProgress.length;
  const completedEnrollments = studentsProgress.filter(
    (e) => Number(e.progressPercentage) === 100,
  ).length;
  const inProgressEnrollments = totalEnrollments - completedEnrollments;

  const totalBlogs = blogs.length;
  const publishedBlogsCount = blogs.filter(
    (b) => b.status === "published" || b.publishedAt,
  ).length;
  const draftBlogsCount = totalBlogs - publishedBlogsCount;

  const stats = [
    {
      title: "Published Tracks",
      value: totalCourses,
      subtitle: `${totalLessons} Lessons across ${categories.length} Categories`,
      icon: <HiOutlineBookOpen className="w-4 h-4" />,
    },
    {
      title: "Curriculum Units",
      value: `${totalLessons} / ${totalQuizzes}`,
      subtitle: "Video Lectures & Checkpoint Quizzes",
      icon: <HiOutlineClipboardDocumentCheck className="w-4 h-4" />,
    },
    {
      title: "Knowledge Hub",
      value: totalBlogs,
      subtitle: `${publishedBlogsCount} Published • ${draftBlogsCount} In Draft`,
      icon: <HiOutlinePencilSquare className="w-4 h-4" />,
    },
    {
      title: "Learners Monitored",
      value: totalEnrollments,
      subtitle: `${completedEnrollments} Completed • ${inProgressEnrollments} Active`,
      icon: <HiOutlineChartBar className="w-4 h-4" />,
    },
  ];

  const managerActivities = [
    ...courses.map((c) => ({
      id: `c-${c.id || c.documentId}`,
      action: "COURSE_UPDATED",
      title: `Course track "${c.title}" updated`,
      timestamp: c.updatedAt || c.createdAt
        ? new Date(c.updatedAt || c.createdAt).toLocaleDateString()
        : "Recent",
      dateObj: c.updatedAt || c.createdAt
        ? new Date(c.updatedAt || c.createdAt)
        : new Date(0),
      badgeText: "COURSE",
      badgeVariant: "primary",
    })),
    ...blogs.map((b) => ({
      id: `b-${b.id || b.documentId}`,
      action: "BLOG_SAVED",
      title: `Article "${b.title}" (${b.status === "published" || b.publishedAt ? "Published" : "Draft"})`,
      timestamp: b.updatedAt || b.createdAt
        ? new Date(b.updatedAt || b.createdAt).toLocaleDateString()
        : "Recent",
      dateObj: b.updatedAt || b.createdAt
        ? new Date(b.updatedAt || b.createdAt)
        : new Date(0),
      badgeText: b.status === "published" || b.publishedAt ? "PUBLISHED" : "DRAFT",
      badgeVariant: b.status === "published" || b.publishedAt ? "highlight" : "secondary",
    })),
    ...studentsProgress.map((e) => ({
      id: `e-${e.id || e.documentId}`,
      action: "STUDENT_ENROLLED",
      title: `${e.student?.username || "Student"} enrolled in "${e.course?.title || "Course Track"}"`,
      timestamp: e.createdAt
        ? new Date(e.createdAt).toLocaleDateString()
        : "Recent",
      dateObj: e.createdAt ? new Date(e.createdAt) : new Date(0),
      badgeText: "ENROLLMENT",
      badgeVariant: "primary",
    })),
  ].sort((a, b) => b.dateObj - a.dateObj);

  const managerSeries = [
    {
      name: "Courses",
      color: "#309255",
      dataPoints: courses,
    },
    {
      name: "Articles",
      color: "#212832",
      dataPoints: blogs,
    },
    {
      name: "Enrollments",
      color: "#48BB78",
      dataPoints: studentsProgress,
    },
  ];

  const filteredCourses = courses.filter((c) => {
    const query = courseSearch.toLowerCase();
    const matchSearch =
      !query ||
      c.title?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query);
    const matchCategory =
      courseCategoryFilter === "all" ||
      c.category?.documentId === courseCategoryFilter ||
      String(c.category?.id) === courseCategoryFilter ||
      c.category?.name === courseCategoryFilter;
    return matchSearch && matchCategory;
  });

  const currentCourse =
    courses.find((c) => (c.documentId || String(c.id)) === selectedCourseId) ||
    courses[0] ||
    null;

  const currentCourseLessons =
    currentCourse?.modules?.flatMap((m) => m.lessons || []) || [];
  const currentCourseQuizzes = currentCourse?.quizzes || [];

  const filteredBlogs = blogs.filter((b) => {
    const query = blogSearch.toLowerCase();
    const matchSearch =
      !query ||
      b.title?.toLowerCase().includes(query) ||
      b.excerpt?.toLowerCase().includes(query);
    const isPublished = b.status === "published";
    const matchStatus =
      blogStatusFilter === "all" ||
      (blogStatusFilter === "published" && isPublished) ||
      (blogStatusFilter === "draft" && !isPublished);
    return matchSearch && matchStatus;
  });

  const filteredStudents = studentsProgress.filter((enrollment) => {
    const studentName = enrollment.student?.username || "";
    const studentEmail = enrollment.student?.email || "";
    const query = searchStudent.toLowerCase();
    const matchSearch =
      !query ||
      studentName.toLowerCase().includes(query) ||
      studentEmail.toLowerCase().includes(query);
    const matchCourse =
      progressCourseFilter === "all" ||
      enrollment.course?.documentId === progressCourseFilter ||
      String(enrollment.course?.id) === progressCourseFilter ||
      enrollment.course?.title === progressCourseFilter;
    return matchSearch && matchCourse;
  });

  // Handlers: Courses
  const handleOpenAddCourse = () => {
    setIsEditingCourse(false);
    setEditingCourseId(null);
    setCourseForm({
      title: "",
      category: categories[0]?.documentId || String(categories[0]?.id) || "",
      price: "0",
      difficulty: "Beginner",
      description: "",
      thumbnailUrl: "",
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course) => {
    setIsEditingCourse(true);
    setEditingCourseId(course.documentId || course.id);
    setCourseForm({
      title: course.title || "",
      category:
        course.category?.documentId || String(course.category?.id) || "",
      price: String(course.price || 0),
      difficulty: course.difficulty || "Beginner",
      description: course.description || "",
      thumbnailUrl: course.thumbnailUrl || "",
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        data: {
          title: courseForm.title,
          category: courseForm.category,
          price: Number(courseForm.price) || 0,
          difficulty: courseForm.difficulty,
          description: courseForm.description,
          thumbnailUrl: courseForm.thumbnailUrl,
        },
      };

      if (isEditingCourse && editingCourseId) {
        await api.put(`/courses/${editingCourseId}`, payload, { token });
      } else {
        await api.post("/courses", payload, { token });
      }

      setIsCourseModalOpen(false);
      await loadManagerData();
    } catch (err) {
      console.error("Failed to save course:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setActionLoading(true);
    try {
      const courseId = courseToDelete.documentId || courseToDelete.id;
      await api.delete(`/courses/${courseId}`, { token });
      setIsDeleteCourseModalOpen(false);
      setCourseToDelete(null);
      await loadManagerData();
    } catch (err) {
      console.error("Failed to delete course:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers: Lessons
  const handleOpenAddLesson = () => {
    setIsEditingLesson(false);
    setEditingLessonId(null);
    setLessonForm({
      title: "",
      youtubeUrl: "",
      duration: "10:00",
      isFreePreview: false,
      notes: "",
    });
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson) => {
    setIsEditingLesson(true);
    setEditingLessonId(lesson.documentId || lesson.id);
    setLessonForm({
      title: lesson.title || "",
      youtubeUrl: lesson.youtubeUrl || "",
      duration: lesson.duration || "10:00",
      isFreePreview: Boolean(lesson.isFreePreview),
      notes: lesson.notes || "",
    });
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!currentCourse) return;
    setActionLoading(true);
    try {
      let targetModule = currentCourse.modules?.[0];
      if (!targetModule) {
        const modRes = await api.post(
          "/modules",
          {
            data: {
              title: "Module 1: Foundation",
              course: currentCourse.documentId || currentCourse.id,
            },
          },
          { token },
        );
        targetModule = modRes.data;
      }

      const moduleId = targetModule.documentId || targetModule.id;
      const payload = {
        data: {
          title: lessonForm.title,
          youtubeUrl: lessonForm.youtubeUrl?.trim() || null,
          duration: lessonForm.duration?.trim() || "10:00",
          isFreePreview: Boolean(lessonForm.isFreePreview),
          notes: lessonForm.notes || lessonForm.content || "",
          content: lessonForm.notes || lessonForm.content || "",
          module: moduleId,
          course: currentCourse.documentId || currentCourse.id,
        },
      };

      if (isEditingLesson && editingLessonId) {
        await api.put(`/lessons/${editingLessonId}`, payload, { token });
      } else {
        await api.post("/lessons", payload, { token });
      }

      setIsLessonModalOpen(false);
      await loadManagerData();
    } catch (err) {
      console.error("Failed to save lesson:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setActionLoading(true);
    try {
      const lessonId = lessonToDelete.documentId || lessonToDelete.id;
      await api.delete(`/lessons/${lessonId}`, { token });
      setIsDeleteLessonModalOpen(false);
      setLessonToDelete(null);
      await loadManagerData();
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers: Quizzes
  const handleOpenAddQuiz = () => {
    setIsEditingQuiz(false);
    setEditingQuizId(null);
    setQuizForm({
      title: "",
      totalScore: "100",
      timeLimitMinutes: "20",
    });
    setIsQuizModalOpen(true);
  };

  const handleOpenEditQuiz = (quiz) => {
    setIsEditingQuiz(true);
    setEditingQuizId(quiz.documentId || quiz.id);
    setQuizForm({
      title: quiz.title || "",
      totalScore: String(quiz.totalScore || 100),
      timeLimitMinutes: String(quiz.timeLimitMinutes || 20),
    });
    setIsQuizModalOpen(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!currentCourse) return;
    setActionLoading(true);
    try {
      const payload = {
        data: {
          title: quizForm.title,
          totalScore: Number(quizForm.totalScore) || 100,
          timeLimitMinutes: Number(quizForm.timeLimitMinutes) || 20,
          course: currentCourse.documentId || currentCourse.id,
        },
      };

      if (isEditingQuiz && editingQuizId) {
        await api.put(`/quizzes/${editingQuizId}`, payload, { token });
      } else {
        await api.post("/quizzes", payload, { token });
      }

      setIsQuizModalOpen(false);
      await loadManagerData();
    } catch (err) {
      console.error("Failed to save quiz:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    setActionLoading(true);
    try {
      const quizId = quizToDelete.documentId || quizToDelete.id;
      await api.delete(`/quizzes/${quizId}`, { token });
      setIsDeleteQuizModalOpen(false);
      setQuizToDelete(null);
      await loadManagerData();
    } catch (err) {
      console.error("Failed to delete quiz:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers: MCQ Questions
  const handleOpenManageQuestions = (quiz) => {
    setQuizForQuestions(quiz);
    setNewQuestion({
      prompt: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: 0,
      explanation: "",
    });
    setIsManageQuestionsOpen(true);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!quizForQuestions) return;
    setActionLoading(true);
    try {
      const quizId = quizForQuestions.documentId || quizForQuestions.id;
      const optionsArray = [
        newQuestion.optionA,
        newQuestion.optionB,
        newQuestion.optionC,
        newQuestion.optionD,
      ];

      await api.post(
        "/questions",
        {
          data: {
            prompt: newQuestion.prompt,
            options: optionsArray,
            correctAnswer: Number(newQuestion.correctAnswer) || 0,
            explanation: newQuestion.explanation,
            quiz: quizId,
          },
        },
        { token },
      );

      setNewQuestion({
        prompt: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: 0,
        explanation: "",
      });

      const updatedQuizRes = await api.get(
        `/quizzes/${quizId}?populate=questions`,
        { token },
      );
      if (updatedQuizRes?.data) {
        setQuizForQuestions(updatedQuizRes.data);
      }
      await loadManagerData();
    } catch (err) {
      console.error("Failed to add question:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!quizForQuestions) return;
    setActionLoading(true);
    try {
      const quizId = quizForQuestions.documentId || quizForQuestions.id;
      await api.delete(`/questions/${questionId}`, { token });
      const updatedQuizRes = await api.get(
        `/quizzes/${quizId}?populate=questions`,
        { token },
      );
      if (updatedQuizRes?.data) {
        setQuizForQuestions(updatedQuizRes.data);
      }
      await loadManagerData();
    } catch (err) {
      console.error("Failed to delete question:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers: Blogs
  const handleOpenAddBlog = () => {
    setIsEditingBlog(false);
    setEditingBlogId(null);
    setBlogForm({
      title: "",
      category: categories[0]?.documentId || String(categories[0]?.id) || "",
      status: "draft",
      excerpt: "",
      content: "",
      coverImageUrl: "",
    });
    setIsBlogModalOpen(true);
  };

  const handleOpenEditBlog = (blog) => {
    setIsEditingBlog(true);
    setEditingBlogId(blog.documentId || blog.id);
    setBlogForm({
      title: blog.title || "",
      category: blog.category?.documentId || String(blog.category?.id) || "",
      status: blog.status || (blog.publishedAt ? "published" : "draft"),
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      coverImageUrl: blog.coverImageUrl || "",
    });
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        data: {
          title: blogForm.title,
          category: blogForm.category,
          excerpt: blogForm.excerpt,
          content: blogForm.content,
          coverImageUrl: blogForm.coverImageUrl,
          status: blogForm.status,
          author: currentManager?.id,
        },
      };

      if (isEditingBlog && editingBlogId) {
        await api.put(`/blog-posts/${editingBlogId}`, payload, { token });
      } else {
        await api.post("/blog-posts", payload, { token });
      }

      setIsBlogModalOpen(false);
      await loadManagerData();
    } catch (err) {
      console.error("Failed to save blog post:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlogStatus = async (blog) => {
    setActionLoading(true);
    try {
      const isCurrentlyPublished = Boolean(blog.publishedAt);
      const blogId = blog.documentId || blog.id;
      await api.put(
        `/blog-posts/${blogId}`,
        {
          data: {
            status: isCurrentlyPublished ? "draft" : "published",
          },
        },
        { token },
      );
      await loadManagerData();
    } catch (err) {
      console.error("Failed to toggle blog status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    setActionLoading(true);
    try {
      const blogId = blogToDelete.documentId || blogToDelete.id;
      await api.delete(`/blog-posts/${blogId}`, { token });
      setIsDeleteBlogModalOpen(false);
      setBlogToDelete(null);
      await loadManagerData();
    } catch (err) {
      console.error("Failed to delete blog:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const value = {
    currentManager,
    courses,
    categories,
    blogs,
    studentsProgress,
    isLoading,
    actionLoading,
    stats,
    managerActivities,
    managerSeries,
    totalCourses,
    totalBlogs,
    publishedBlogsCount,
    draftBlogsCount,
    filteredCourses,
    courseSearch,
    setCourseSearch,
    courseCategoryFilter,
    setCourseCategoryFilter,
    currentCourse,
    selectedCourseId,
    setSelectedCourseId,
    currentCourseLessons,
    currentCourseQuizzes,
    filteredBlogs,
    blogSearch,
    setBlogSearch,
    blogStatusFilter,
    setBlogStatusFilter,
    filteredStudents,
    progressCourseFilter,
    setProgressCourseFilter,
    searchStudent,
    setSearchStudent,
    // Handlers
    handleOpenAddCourse,
    handleOpenEditCourse,
    handleOpenDeleteCourseModal: (c) => {
      setCourseToDelete(c);
      setIsDeleteCourseModalOpen(true);
    },
    handleOpenAddLesson,
    handleOpenEditLesson,
    handleOpenDeleteLessonModal: (l) => {
      setLessonToDelete(l);
      setIsDeleteLessonModalOpen(true);
    },
    handleOpenAddQuiz,
    handleOpenEditQuiz,
    handleOpenDeleteQuizModal: (q) => {
      setQuizToDelete(q);
      setIsDeleteQuizModalOpen(true);
    },
    handleOpenManageQuestions,
    handleOpenAddBlog,
    handleOpenEditBlog,
    handleToggleBlogStatus,
    handleOpenDeleteBlogModal: (b) => {
      setBlogToDelete(b);
      setIsDeleteBlogModalOpen(true);
    },
  };

  return (
    <ManagerContext.Provider value={value}>
      {children}

      {/* Course Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        isEditing={isEditingCourse}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        categories={categories}
        onSubmit={handleSaveCourse}
        isLoading={actionLoading}
      />

      {/* Delete Course Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteCourseModalOpen}
        onClose={() => setIsDeleteCourseModalOpen(false)}
        onConfirm={handleDeleteCourse}
        title="Delete Course Track"
        description="Are you sure you want to delete this course and all of its modules, lessons, and quizzes?"
        itemName={courseToDelete?.title || ""}
        isLoading={actionLoading}
      />

      {/* Lesson Modal */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        isEditing={isEditingLesson}
        lessonForm={lessonForm}
        setLessonForm={setLessonForm}
        currentCourseTitle={currentCourse?.title || ""}
        onSubmit={handleSaveLesson}
        isLoading={actionLoading}
      />

      {/* Delete Lesson Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteLessonModalOpen}
        onClose={() => setIsDeleteLessonModalOpen(false)}
        onConfirm={handleDeleteLesson}
        title="Delete Video Lesson"
        description="Are you sure you want to remove this video lesson from the curriculum?"
        itemName={lessonToDelete?.title || ""}
        isLoading={actionLoading}
      />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        isEditing={isEditingQuiz}
        quizForm={quizForm}
        setQuizForm={setQuizForm}
        currentCourseTitle={currentCourse?.title || ""}
        onSubmit={handleSaveQuiz}
        isLoading={actionLoading}
      />

      {/* Delete Quiz Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteQuizModalOpen}
        onClose={() => setIsDeleteQuizModalOpen(false)}
        onConfirm={handleDeleteQuiz}
        title="Delete MCQ Quiz"
        description="Are you sure you want to delete this assessment and its questions?"
        itemName={quizToDelete?.title || ""}
        isLoading={actionLoading}
      />

      {/* Manage Questions Modal */}
      <ManageQuestionsModal
        isOpen={isManageQuestionsOpen}
        onClose={() => setIsManageQuestionsOpen(false)}
        quiz={quizForQuestions}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        onAddQuestion={handleAddQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        isLoading={actionLoading}
      />

      {/* Blog Modal */}
      <BlogModal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        isEditing={isEditingBlog}
        blogForm={blogForm}
        setBlogForm={setBlogForm}
        categories={categories}
        onSubmit={handleSaveBlog}
        isLoading={actionLoading}
      />

      {/* Delete Blog Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteBlogModalOpen}
        onClose={() => setIsDeleteBlogModalOpen(false)}
        onConfirm={handleDeleteBlog}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? It will be permanently removed."
        itemName={blogToDelete?.title || ""}
        isLoading={actionLoading}
      />
    </ManagerContext.Provider>
  );
}

export function useManager() {
  const context = useContext(ManagerContext);
  if (!context) {
    throw new Error("useManager must be used within a ManagerProvider");
  }
  return context;
}
