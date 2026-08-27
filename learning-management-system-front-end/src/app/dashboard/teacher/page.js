"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const INITIAL_INSTRUCTOR_COURSES = [
  {
    id: "c-1",
    title: "Data Structures & Competitive Algorithms",
    slug: "data-structures-competitive-algorithms",
    category: "Computer Science",
    level: "Intermediate",
    price: 49.99,
    status: "Published",
    enrolledCount: 142,
    modules: [
      {
        id: "m-1",
        title: "Module 1: Segment Trees & Fenwick Trees",
        lessons: [
          { id: "l-1", title: "Introduction to Range Queries", duration: "18:45", isPreview: true, youtubeUrl: "https://youtube.com/watch?v=demo1" },
          { id: "l-2", title: "Building a Segment Tree from Scratch", duration: "24:10", isPreview: false, youtubeUrl: "https://youtube.com/watch?v=demo2" },
          { id: "l-3", title: "Lazy Propagation and Range Updates", duration: "31:05", isPreview: false, youtubeUrl: "https://youtube.com/watch?v=demo3" },
        ],
      },
      {
        id: "m-2",
        title: "Module 2: Graph Theory & Shortest Path",
        lessons: [
          { id: "l-4", title: "Dijkstra and 0-1 BFS Implementation", duration: "22:15", isPreview: false, youtubeUrl: "https://youtube.com/watch?v=demo4" },
          { id: "l-5", title: "Floyd-Warshall and Negative Cycle Detection", duration: "19:40", isPreview: false, youtubeUrl: "https://youtube.com/watch?v=demo5" },
        ],
      },
    ],
  },
  {
    id: "c-2",
    title: "Graph Theory Mastery for ICPC Contenders",
    slug: "graph-theory-mastery-icpc",
    category: "Algorithms",
    level: "Advanced",
    price: 69.99,
    status: "Published",
    enrolledCount: 88,
    modules: [
      {
        id: "m-3",
        title: "Module 1: Network Flows & Matching",
        lessons: [
          { id: "l-6", title: "Ford-Fulkerson and Edmonds-Karp Algorithm", duration: "28:30", isPreview: true, youtubeUrl: "https://youtube.com/watch?v=demo6" },
          { id: "l-7", title: "Dinic's Maximum Flow Algorithm", duration: "34:50", isPreview: false, youtubeUrl: "https://youtube.com/watch?v=demo7" },
        ],
      },
    ],
  },
];

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [courses] = useState(INITIAL_INSTRUCTOR_COURSES);
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState("c-1");
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={["Instructor", "Admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-background text-foreground">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="highlight" size="sm">
                Instructor Workspace
              </Badge>
              <span className="text-xs text-muted">Course, Lesson & Quiz Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Instructor Dashboard
            </h1>
            <p className="text-sm text-muted mt-1">
              Logged in as <strong className="text-foreground">{user?.username || "Instructor"}</strong>. Manage your assigned courses, video lessons, and student progress.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="surface"
              size="sm"
              onClick={() => setIsLessonModalOpen(true)}
              className="border border-border"
            >
              + Add Lesson
            </Button>
            <Button
              type="button"
              variant="surface"
              size="sm"
              onClick={() => setIsQuizModalOpen(true)}
              className="border border-border"
            >
              + Create Quiz
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCourseModalOpen(true)}
            >
              + New Course
            </Button>
          </div>
        </div>

        {/* 4 Instructor KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">My Courses</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1 text-foreground">
                {courses.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Authored & published by you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Enrolled Students</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1 text-foreground">
                230
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Active learners across your courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Lessons</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1 text-foreground">
                7
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Video sessions & modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Quizzes Published</span>
              <CardTitle as="h3" className="text-2xl font-bold mt-1 text-foreground">
                2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">Assessments across your curriculum</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-border gap-4 flex-wrap pb-2">
          <nav className="flex space-x-2" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "courses"
                  ? "bg-primary text-white dark:bg-secondary dark:text-white"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              My Courses & Lessons ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quizzes")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "quizzes"
                  ? "bg-primary text-white dark:bg-secondary dark:text-white"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              Course Quizzes (2)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "students"
                  ? "bg-primary text-white dark:bg-secondary dark:text-white"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              Enrolled Student Progress (4)
            </button>
          </nav>

          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>
        </div>

        {/* TAB 1: My Courses & Curriculum */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Your Authored Courses</h2>
              <Badge variant="surface" size="sm">
                Own Courses Scope Only
              </Badge>
            </div>

            <div className="space-y-4">
              {filteredCourses.map((course) => {
                const isExpanded = expandedCourseId === course.id;
                const courseLessonCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

                return (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-foreground">{course.title}</span>
                          <Badge variant="highlight" size="sm">
                            {course.category}
                          </Badge>
                          <Badge variant="surface" size="sm">
                            {course.level}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted">
                          Price: <span className="font-semibold text-foreground">${course.price.toFixed(2)}</span> • {course.enrolledCount} Enrolled Students • {courseLessonCount} Lessons
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="surface"
                          size="sm"
                          onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                          className="border border-border"
                        >
                          {isExpanded ? "Hide Curriculum ▲" : "View Curriculum ▼"}
                        </Button>
                      </div>
                    </div>

                    {/* Curriculum Accordion */}
                    {isExpanded && (
                      <div className="p-5 bg-surface/40 space-y-4">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Curriculum & Video Lessons
                        </h4>

                        {course.modules.length === 0 || courseLessonCount === 0 ? (
                          <p className="text-xs text-muted italic">No lessons added to this course yet.</p>
                        ) : (
                          course.modules.map((mod) => (
                            <div key={mod.id} className="space-y-2">
                              <div className="text-xs font-semibold text-foreground flex items-center justify-between bg-card p-2.5 rounded-lg border border-border">
                                <span>{mod.title}</span>
                                <span className="text-muted text-[11px]">{mod.lessons.length} lessons</span>
                              </div>

                              <div className="pl-3 space-y-1.5">
                                {mod.lessons.map((lesson, idx) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-5 h-5 rounded-full bg-surface flex items-center justify-center font-bold text-[10px] text-muted">
                                        {idx + 1}
                                      </span>
                                      <span className="font-medium text-foreground">{lesson.title}</span>
                                      {lesson.isPreview && (
                                        <Badge variant="highlight" size="sm">
                                          Free Preview
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-muted text-[11px]">{lesson.duration}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
