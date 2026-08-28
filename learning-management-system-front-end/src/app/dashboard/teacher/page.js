"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchStudent, setSearchStudent] = useState("");

  // Modals
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState(null);

  // Form States
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCoursePrice, setNewCoursePrice] = useState("4000");
  const [newCourseCategory, setNewCourseCategory] = useState("Competitive Programming");

  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonYoutube, setNewLessonYoutube] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState("15:00");

  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizPassScore, setNewQuizPassScore] = useState("80");
  const [newQuizTimeLimit, setNewQuizTimeLimit] = useState("20");

  // Mock State for Courses & Modules
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Competitive Programming Complete Track",
      category: "Competitive Programming",
      price: 4000,
      enrolledCount: 340,
      modules: [
        {
          id: 101,
          title: "Module 1: Time Complexity & Asymptotic Notation",
          lessons: [
            { id: 1001, title: "Big-O, Big-Omega, & Theta", duration: "18:24", isCompleted: true },
            { id: 1002, title: "Analyzing Nested Loops & Recursion", duration: "24:10", isCompleted: true },
          ],
        },
        {
          id: 102,
          title: "Module 2: Standard Template Library (STL)",
          lessons: [
            { id: 1003, title: "Vectors, Pairs, and Iterators", duration: "22:15", isCompleted: false },
            { id: 1004, title: "Sets, Maps, and Priority Queues", duration: "31:00", isCompleted: false },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Full-Stack ASP.NET 8 & Microservices",
      category: "Software Engineering",
      price: 5500,
      enrolledCount: 180,
      modules: [
        {
          id: 201,
          title: "Module 1: Clean Architecture Principles",
          lessons: [
            { id: 2001, title: "Domain Entities & CQRS with MediatR", duration: "29:40", isCompleted: true },
          ],
        },
      ],
    },
  ]);

  // Mock State for Quizzes
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: "Asymptotic Complexity & STL Diagnostic",
      courseTitle: "Competitive Programming Complete Track",
      questionCount: 10,
      passingScore: 80,
      timeLimitMinutes: 20,
    },
    {
      id: 2,
      title: "Clean Architecture & CQRS Assessment",
      courseTitle: "Full-Stack ASP.NET 8 & Microservices",
      questionCount: 8,
      passingScore: 75,
      timeLimitMinutes: 15,
    },
  ]);

  // Mock State for Student Progress
  const [studentProgress, setStudentProgress] = useState([
    { id: 1, name: "Aileen Anderson", email: "aileen@mailinator.com", course: "Competitive Programming Complete Track", completedLessons: 4, totalLessons: 4, score: "90%" },
    { id: 2, name: "Arin Sarkar", email: "arin@gmail.com", course: "Competitive Programming Complete Track", completedLessons: 2, totalLessons: 4, score: "80%" },
    { id: 3, name: "Tanvir Ahmed", email: "tanvir@gmail.com", course: "Full-Stack ASP.NET 8 & Microservices", completedLessons: 1, totalLessons: 1, score: "100%" },
  ]);

  // Actions
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    const newCourse = {
      id: Date.now(),
      title: newCourseTitle,
      category: newCourseCategory,
      price: Number(newCoursePrice) || 0,
      enrolledCount: 0,
      modules: [],
    };
    setCourses([...courses, newCourse]);
    setNewCourseTitle("");
    setIsAddCourseModalOpen(false);
  };

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!newLessonTitle || !selectedCourseForLesson) return;
    const updated = courses.map((c) => {
      if (c.id === selectedCourseForLesson.id) {
        const modules = [...c.modules];
        if (modules.length === 0) {
          modules.push({ id: Date.now(), title: "Module 1: Getting Started", lessons: [] });
        }
        modules[0].lessons.push({
          id: Date.now(),
          title: newLessonTitle,
          duration: newLessonDuration || "10:00",
          isCompleted: false,
        });
        return { ...c, modules };
      }
      return c;
    });
    setCourses(updated);
    setNewLessonTitle("");
    setNewLessonYoutube("");
    setIsAddLessonModalOpen(false);
  };

  const handleCreateQuiz = (e) => {
    e.preventDefault();
    if (!newQuizTitle) return;
    const newQ = {
      id: Date.now(),
      title: newQuizTitle,
      courseTitle: courses[0]?.title || "Assigned Course",
      questionCount: 5,
      passingScore: Number(newQuizPassScore) || 80,
      timeLimitMinutes: Number(newQuizTimeLimit) || 20,
    };
    setQuizzes([...quizzes, newQ]);
    setNewQuizTitle("");
    setIsAddQuizModalOpen(false);
  };

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "courses",
      label: "My Courses",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "quizzes",
      label: "Course Quizzes",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: "progress",
      label: "Student Progress",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const totalLessons = courses.reduce(
    (acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0),
    0
  );

  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledCount, 0);

  const filteredProgress = studentProgress.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.course.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={["Instructor", "Admin"]}>
      <DashboardLayout
        roleTitle="Instructor Dashboard"
        subtitle="Welcome back"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">Teaching Overview</h2>
              <div className="flex items-center gap-3">
                <Button onClick={() => setIsAddCourseModalOpen(true)} variant="primary" size="sm">
                  + Create Course
                </Button>
                <Button onClick={() => setIsAddQuizModalOpen(true)} variant="outline" size="sm">
                  + Add Quiz
                </Button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#285A48]/15 text-[#285A48] dark:bg-[#B0E4CC]/15 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{courses.length}</span>
                  <span className="text-xs font-semibold text-muted block">Assigned Courses</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#408A71]/15 text-[#408A71] dark:bg-[#408A71]/25 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{totalStudents}</span>
                  <span className="text-xs font-semibold text-muted block">Enrolled Students</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#285A48]/15 text-[#285A48] dark:bg-[#B0E4CC]/15 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{totalLessons}</span>
                  <span className="text-xs font-semibold text-muted block">Video Lessons</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#408A71]/15 text-[#408A71] dark:bg-[#408A71]/25 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{quizzes.length}</span>
                  <span className="text-xs font-semibold text-muted block">Active Quizzes</span>
                </div>
              </Card>
            </div>

            {/* My Courses Preview List */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">Assigned Courses & Curricula</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {courses.map((c) => (
                  <Card key={c.id} className="p-5 bg-card border-border flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="highlight" size="sm">
                          {c.category}
                        </Badge>
                        <span className="font-extrabold text-sm text-[#285A48] dark:text-[#B0E4CC]">
                          {c.price} BDT
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-foreground">{c.title}</h4>
                      <p className="text-xs text-muted mt-1">
                        {c.modules.length} Modules • {c.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons • {c.enrolledCount} Students Enrolled
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        onClick={() => {
                          setSelectedCourseForLesson(c);
                          setIsAddLessonModalOpen(true);
                        }}
                        variant="primary"
                        size="sm"
                        className="text-xs"
                      >
                        + Add Video Lesson
                      </Button>
                      <Button
                        onClick={() => setActiveTab("courses")}
                        variant="surface"
                        size="sm"
                        className="text-xs"
                      >
                        Manage Modules
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY COURSES */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">My Courses & Curriculum Builder</h2>
              <Button onClick={() => setIsAddCourseModalOpen(true)} variant="primary" size="sm">
                + Create Course
              </Button>
            </div>

            <div className="space-y-6">
              {courses.map((c) => (
                <Card key={c.id} className="p-6 bg-card border-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-foreground">{c.title}</h3>
                        <Badge variant="surface" size="sm">
                          {c.category}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted">{c.enrolledCount} Enrolled Learners</span>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedCourseForLesson(c);
                        setIsAddLessonModalOpen(true);
                      }}
                      variant="primary"
                      size="sm"
                    >
                      + Add Lesson
                    </Button>
                  </div>

                  {/* Modules Accordion */}
                  <div className="space-y-3">
                    {c.modules.map((m) => (
                      <div key={m.id} className="p-4 rounded-xl bg-surface border border-border space-y-3">
                        <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">
                          {m.title}
                        </h4>
                        <div className="space-y-2">
                          {m.lessons.map((l) => (
                            <div
                              key={l.id}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-[#285A48]/15 text-[#285A48] dark:text-[#B0E4CC] flex items-center justify-center font-bold text-[10px]">
                                  ▶
                                </span>
                                <span className="font-bold text-foreground">{l.title}</span>
                              </div>
                              <span className="text-muted font-mono">{l.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUIZZES */}
        {activeTab === "quizzes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Course Quizzes & Assessments</h2>
              <Button onClick={() => setIsAddQuizModalOpen(true)} variant="primary" size="sm">
                + Create Quiz
              </Button>
            </div>

            <Card className="overflow-hidden border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Passing Score</TableHead>
                    <TableHead>Time Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-bold text-xs text-foreground">{q.title}</TableCell>
                      <TableCell className="text-xs text-muted">{q.courseTitle}</TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">{q.questionCount} MCQs</TableCell>
                      <TableCell>
                        <Badge variant="highlight" size="sm">
                          {q.passingScore}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted">{q.timeLimitMinutes} mins</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 4: STUDENT PROGRESS */}
        {activeTab === "progress" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">Enrolled Students Learning Progress</h2>
              <div className="w-full sm:w-80">
                <Input
                  type="text"
                  placeholder="Search student or course..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <Card className="overflow-hidden border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Lessons Completed</TableHead>
                    <TableHead>Course Progress</TableHead>
                    <TableHead className="text-right">Quiz Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProgress.map((s) => {
                    const percent = Math.round((s.completedLessons / s.totalLessons) * 100);
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div>
                            <span className="font-bold text-xs text-foreground block">{s.name}</span>
                            <span className="text-[11px] text-muted block">{s.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted">{s.course}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          {s.completedLessons} / {s.totalLessons}
                        </TableCell>
                        <TableCell>
                          <div className="w-36">
                            <ProgressBar value={percent} size="sm" showLabel={true} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-extrabold text-xs text-[#285A48] dark:text-[#B0E4CC]">
                          {s.score}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* MODAL: ADD COURSE */}
        {isAddCourseModalOpen && (
          <Modal
            isOpen={isAddCourseModalOpen}
            onClose={() => setIsAddCourseModalOpen(false)}
            title="Create New Course"
          >
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <Input
                label="Course Title"
                placeholder="e.g. Dynamic Programming Masterclass"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                required
              />
              <Input
                label="Price (BDT)"
                type="number"
                value={newCoursePrice}
                onChange={(e) => setNewCoursePrice(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={newCourseCategory}
                  onChange={(e) => setNewCourseCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                >
                  <option value="Competitive Programming">Competitive Programming</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Job Interview Prep">Job Interview Prep</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="submit" variant="primary" size="md">
                  Create Course
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* MODAL: ADD VIDEO LESSON */}
        {isAddLessonModalOpen && (
          <Modal
            isOpen={isAddLessonModalOpen}
            onClose={() => setIsAddLessonModalOpen(false)}
            title={`Add Lesson to ${selectedCourseForLesson?.title}`}
          >
            <form onSubmit={handleAddLesson} className="space-y-4">
              <Input
                label="Lesson Title"
                placeholder="e.g. Graph Traversal: BFS and DFS"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                required
              />
              <Input
                label="YouTube Embed URL"
                placeholder="https://www.youtube.com/watch?v=..."
                value={newLessonYoutube}
                onChange={(e) => setNewLessonYoutube(e.target.value)}
                required
              />
              <Input
                label="Duration (e.g. 15:30)"
                value={newLessonDuration}
                onChange={(e) => setNewLessonDuration(e.target.value)}
              />
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="submit" variant="primary" size="md">
                  Save Lesson
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* MODAL: ADD QUIZ */}
        {isAddQuizModalOpen && (
          <Modal
            isOpen={isAddQuizModalOpen}
            onClose={() => setIsAddQuizModalOpen(false)}
            title="Create Assessment Quiz"
          >
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <Input
                label="Quiz Title"
                placeholder="e.g. Segment Tree Quiz"
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Passing Score (%)"
                  type="number"
                  value={newQuizPassScore}
                  onChange={(e) => setNewQuizPassScore(e.target.value)}
                  required
                />
                <Input
                  label="Time Limit (Minutes)"
                  type="number"
                  value={newQuizTimeLimit}
                  onChange={(e) => setNewQuizTimeLimit(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="submit" variant="primary" size="md">
                  Publish Quiz
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
