"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { CourseModal } from "@/components/dashboard/modals/CourseModal";
import { LessonModal } from "@/components/dashboard/modals/LessonModal";
import { QuizModal } from "@/components/dashboard/modals/QuizModal";
import { ManageQuestionsModal } from "@/components/dashboard/modals/ManageQuestionsModal";
import { ConfirmDeleteModal } from "@/components/dashboard/modals/ConfirmDeleteModal";


const InstructorContext = createContext(null);

export function InstructorProvider({ children }) {
  const { user: currentInstructor, token } = useAuth();

  // Core Data States
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Curriculum Hub Selection
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
    passingScore: "80",
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

  // Progress Roster Filters
  const [progressCourseFilter, setProgressCourseFilter] = useState("all");
  const [searchStudent, setSearchStudent] = useState("");

  // 1. Data Loader
  const loadInstructorData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [coursesRes, catsRes, enrollsRes] = await Promise.all([
        api.get("/courses?populate[modules][populate]=lessons&populate[quizzes][populate]=questions&populate[category]=*&populate[instructor]=*&populate[enrollments]=*", { token }).catch(() => ({ data: [] })),
        api.get("/categories", { token }).catch(() => ({ data: [] })),
        api.get("/enrollments?populate[student]=*&populate[course]=*", { token }).catch(() => ({ data: [] })),
      ]);

      const allCourses = Array.isArray(coursesRes?.data) ? coursesRes.data : [];
      const resolvedCats = Array.isArray(catsRes?.data) ? catsRes.data : [];
      const allEnrolls = Array.isArray(enrollsRes?.data) ? enrollsRes.data : [];

      // Scoped only to instructor's own courses
      const instructorId = currentInstructor?.id;
      const instructorDocumentId = currentInstructor?.documentId;

      const myCourses = allCourses.filter((c) => {
        if (!c.instructor) return true;
        return (
          c.instructor.id === instructorId ||
          c.instructor.documentId === instructorDocumentId ||
          c.instructor.username === currentInstructor?.username
        );
      });

      const myCourseIds = new Set(
        myCourses.map((c) => c.documentId || String(c.id))
      );
      const myStudents = allEnrolls.filter((e) => {
        const cId = e.course?.documentId || String(e.course?.id);
        return myCourseIds.has(cId);
      });

      setCourses(myCourses);
      setCategories(resolvedCats);
      setStudentsProgress(myStudents);

      if (myCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(myCourses[0].documentId || String(myCourses[0].id));
      }
    } catch (err) {
      console.error("Failed to load instructor data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentInstructor, selectedCourseId]);

  useEffect(() => {
    loadInstructorData();
  }, [loadInstructorData]);

  // Derived Metrics
  const totalCourses = courses.length;
  const totalLessons = courses.reduce(
    (acc, c) => acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0),
    0
  );
  const totalQuizzes = courses.reduce((acc, c) => acc + (c.quizzes?.length || 0), 0);
  const totalStudents = studentsProgress.length;

  const stats = [
    { title: "Authored Tracks", value: totalCourses, subtitle: "Active Curriculum Tracks" },
    { title: "Video Lessons", value: totalLessons, subtitle: "Published Syllabus Units" },
    { title: "MCQ Assessments", value: totalQuizzes, subtitle: "Checkpoint Evaluations" },
    { title: "Students Enrolled", value: totalStudents, subtitle: "Learners in Your Tracks" },
  ];

  const instructorActivities = [
    ...studentsProgress.map((e) => ({
      id: `en-${e.id}`,
      action: "STUDENT_ENROLLED",
      title: `${e.student?.username || "Student"} enrolled in ${e.course?.title || "Course"}`,
      timestamp: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "Recent",
      dateObj: e.createdAt ? new Date(e.createdAt) : new Date(0),
      badgeText: "ENROLLED",
      badgeVariant: "primary",
    })),
    ...courses.map((c) => ({
      id: `c-${c.id}`,
      action: "COURSE_UPDATED",
      title: `Curriculum updated for "${c.title}"`,
      timestamp: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "Recent",
      dateObj: c.updatedAt ? new Date(c.updatedAt) : new Date(0),
      badgeText: "CURRICULUM",
      badgeVariant: "highlight",
    })),
  ].sort((a, b) => b.dateObj - a.dateObj).slice(0, 10);

  const currentCourse =
    courses.find((c) => (c.documentId || String(c.id)) === selectedCourseId) || courses[0] || null;

  const currentCourseLessons =
    currentCourse?.modules?.flatMap((m) => m.lessons || []) || [];
  const currentCourseQuizzes = currentCourse?.quizzes || [];

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
      category: course.category?.documentId || String(course.category?.id) || "",
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
          instructor: currentInstructor?.id,
        },
      };

      if (isEditingCourse && editingCourseId) {
        await api.put(`/courses/${editingCourseId}`, payload, { token });
      } else {
        await api.post("/courses", payload, { token });
      }

      setIsCourseModalOpen(false);
      await loadInstructorData();
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
      await loadInstructorData();
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
              title: "Module 1: Core Syllabus",
              course: currentCourse.documentId || currentCourse.id,
            },
          },
          { token }
        );
        targetModule = modRes.data;
      }

      const moduleId = targetModule.documentId || targetModule.id;
      const payload = {
        data: {
          title: lessonForm.title,
          youtubeUrl: lessonForm.youtubeUrl,
          duration: lessonForm.duration,
          isFreePreview: lessonForm.isFreePreview,
          notes: lessonForm.notes,
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
      await loadInstructorData();
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
      await loadInstructorData();
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
      passingScore: "80",
      timeLimitMinutes: "20",
    });
    setIsQuizModalOpen(true);
  };

  const handleOpenEditQuiz = (quiz) => {
    setIsEditingQuiz(true);
    setEditingQuizId(quiz.documentId || quiz.id);
    setQuizForm({
      title: quiz.title || "",
      passingScore: String(quiz.passingScore || 80),
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
          passingScore: Number(quizForm.passingScore) || 80,
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
      await loadInstructorData();
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
      await loadInstructorData();
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
        { token }
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
        { token }
      );
      if (updatedQuizRes?.data) {
        setQuizForQuestions(updatedQuizRes.data);
      }
      await loadInstructorData();
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
        { token }
      );
      if (updatedQuizRes?.data) {
        setQuizForQuestions(updatedQuizRes.data);
      }
      await loadInstructorData();
    } catch (err) {
      console.error("Failed to delete question:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const value = {
    currentInstructor,
    courses,
    categories,
    studentsProgress,
    isLoading,
    actionLoading,
    stats,
    instructorActivities,
    totalCourses,
    totalStudents,
    currentCourse,
    selectedCourseId,
    setSelectedCourseId,
    currentCourseLessons,
    currentCourseQuizzes,
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
  };

  return (
    <InstructorContext.Provider value={value}>
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
        description="Are you sure you want to delete this course? All associated lessons and quizzes will be removed."
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
        description="Are you sure you want to remove this video lesson from your curriculum?"
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
        description="Are you sure you want to delete this quiz assessment and its questions?"
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
    </InstructorContext.Provider>
  );
}

export function useInstructor() {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error("useInstructor must be used within an InstructorProvider");
  }
  return context;
}
