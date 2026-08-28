"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Modals
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false);

  // Form States
  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState("4500");
  const [courseCategory, setCourseCategory] = useState("Competitive Programming");

  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogCategory, setBlogCategory] = useState("Engineering");

  // Mock State
  const [courses, setCourses] = useState([
    { id: 1, title: "Competitive Programming Complete Track", instructor: "Mohaimin", category: "CP", price: 4000, lessonsCount: 14, status: "Published" },
    { id: 2, title: "Job Interview Preparation & FAANG Cracking", instructor: "Arafat", category: "Interview", price: 6000, lessonsCount: 10, status: "Published" },
    { id: 3, title: "Full-Stack ASP.NET 8 & Microservices", instructor: "Mohaimin", category: ".NET", price: 5500, lessonsCount: 12, status: "Published" },
    { id: 4, title: "Advanced Graph Algorithms & Dynamic Programming", instructor: "Arafat", category: "Algorithms", price: 3500, lessonsCount: 8, status: "Draft" },
  ]);

  const [blogs, setBlogs] = useState([
    { id: 1, title: "How to reach Candidate Master on Codeforces in 6 Months", author: "Mohaimin", category: "Competitive Programming", status: "Published", date: "2026-08-20" },
    { id: 2, title: "Building Resilient Microservices with .NET 8 and Clean Architecture", author: "Arafat", category: "Software Engineering", status: "Published", date: "2026-08-24" },
    { id: 3, title: "Top 50 Dynamic Programming Patterns for FAANG Interviews", author: "Editorial Team", category: "Interview Prep", status: "Draft", date: "2026-08-27" },
  ]);

  const handleToggleCourseStatus = (id) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "Published" ? "Draft" : "Published" } : c))
    );
  };

  const handleToggleBlogStatus = (id) => {
    setBlogs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: b.status === "Published" ? "Draft" : "Published" } : b))
    );
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!courseTitle) return;
    setCourses([
      ...courses,
      {
        id: Date.now(),
        title: courseTitle,
        instructor: "Assigned Staff",
        category: courseCategory,
        price: Number(coursePrice) || 0,
        lessonsCount: 0,
        status: "Draft",
      },
    ]);
    setCourseTitle("");
    setIsAddCourseOpen(false);
  };

  const handleCreateBlog = (e) => {
    e.preventDefault();
    if (!blogTitle) return;
    setBlogs([
      ...blogs,
      {
        id: Date.now(),
        title: blogTitle,
        author: user?.username || "Content Manager",
        category: blogCategory,
        status: "Draft",
        date: new Date().toISOString().split("T")[0],
      },
    ]);
    setBlogTitle("");
    setBlogExcerpt("");
    setIsAddBlogOpen(false);
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
      label: "Content Library",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "blogs",
      label: "Blog Publisher",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
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

  const totalLessons = courses.reduce((acc, c) => acc + c.lessonsCount, 0);

  return (
    <RoleGuard allowedRoles={["Content Manager", "Admin"]}>
      <DashboardLayout
        roleTitle="Content Manager Portal"
        subtitle="Welcome back"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">Content Library Overview</h2>
              <div className="flex items-center gap-3">
                <Button onClick={() => setIsAddCourseOpen(true)} variant="primary" size="sm">
                  + Add Course
                </Button>
                <Button onClick={() => setIsAddBlogOpen(true)} variant="outline" size="sm">
                  + Write Blog Post
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
                  <span className="text-xs font-semibold text-muted block">Catalog Courses</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#408A71]/15 text-[#408A71] dark:bg-[#408A71]/25 dark:text-[#B0E4CC] flex items-center justify-center">
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
                <div className="w-11 h-11 rounded-xl bg-[#285A48]/15 text-[#285A48] dark:bg-[#B0E4CC]/15 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">{blogs.length}</span>
                  <span className="text-xs font-semibold text-muted block">Blog Articles</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-11 h-11 rounded-xl bg-[#408A71]/15 text-[#408A71] dark:bg-[#408A71]/25 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">4</span>
                  <span className="text-xs font-semibold text-muted block">Taxonomies</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: CONTENT LIBRARY */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">All Platform Courses</h2>
              <Button onClick={() => setIsAddCourseOpen(true)} variant="primary" size="sm">
                + Create Course
              </Button>
            </div>

            <Card className="overflow-hidden border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-bold text-xs text-foreground">{c.title}</TableCell>
                      <TableCell className="text-xs text-muted">{c.instructor}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{c.price} BDT</TableCell>
                      <TableCell className="text-xs text-muted">{c.lessonsCount} lessons</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "Published" ? "success" : "surface"} size="sm">
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleToggleCourseStatus(c.id)}
                          variant="ghost"
                          size="sm"
                          className="text-xs py-1"
                        >
                          {c.status === "Published" ? "Unpublish" : "Publish"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 3: BLOG PUBLISHER */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Blog Articles & Editorial Posts</h2>
              <Button onClick={() => setIsAddBlogOpen(true)} variant="primary" size="sm">
                + Write Blog Post
              </Button>
            </div>

            <Card className="overflow-hidden border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-bold text-xs text-foreground">{b.title}</TableCell>
                      <TableCell className="text-xs text-muted">{b.author}</TableCell>
                      <TableCell className="text-xs text-foreground">{b.category}</TableCell>
                      <TableCell className="text-xs text-muted">{b.date}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === "Published" ? "success" : "surface"} size="sm">
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleToggleBlogStatus(b.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs py-1"
                        >
                          {b.status === "Published" ? "Unpublish" : "Publish"}
                        </Button>
                      </TableCell>
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
            <h2 className="text-xl font-bold text-foreground">Global Student Learning Progress</h2>
            <Card className="p-6 bg-card border-border space-y-4">
              <p className="text-xs text-muted">
                As a Content Manager, you have visibility over student completion metrics across all courses in the platform library.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <span className="text-xs font-bold text-foreground">Competitive Programming Complete Track</span>
                  <ProgressBar value={75} size="sm" showLabel={true} />
                  <span className="text-[11px] text-muted block">340 active students • 75% average completion</span>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <span className="text-xs font-bold text-foreground">Full-Stack ASP.NET 8 & Microservices</span>
                  <ProgressBar value={60} size="sm" showLabel={true} />
                  <span className="text-[11px] text-muted block">180 active students • 60% average completion</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* MODAL: ADD COURSE */}
        {isAddCourseOpen && (
          <Modal
            isOpen={isAddCourseOpen}
            onClose={() => setIsAddCourseOpen(false)}
            title="Add Platform Course"
          >
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <Input
                label="Course Title"
                placeholder="e.g. Graph Theory & Shortest Paths"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                required
              />
              <Input
                label="Price (BDT)"
                type="number"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                >
                  <option value="Competitive Programming">Competitive Programming</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Interview Prep">Interview Prep</option>
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

        {/* MODAL: ADD BLOG */}
        {isAddBlogOpen && (
          <Modal
            isOpen={isAddBlogOpen}
            onClose={() => setIsAddBlogOpen(false)}
            title="Write Blog Post"
          >
            <form onSubmit={handleCreateBlog} className="space-y-4">
              <Input
                label="Article Title"
                placeholder="e.g. Mastering Segment Trees with Lazy Propagation"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                required
              />
              <Input
                label="Excerpt"
                placeholder="Brief 1-2 sentence preview..."
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
              />
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                >
                  <option value="Competitive Programming">Competitive Programming</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Interview Prep">Interview Prep</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="submit" variant="primary" size="md">
                  Save Draft
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
