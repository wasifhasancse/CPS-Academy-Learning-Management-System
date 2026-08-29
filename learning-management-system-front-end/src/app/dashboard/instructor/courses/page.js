"use client";

import { useInstructor } from "@/context/InstructorContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CourseGridSkeleton } from "@/components/ui/Skeleton";
import { useRouter } from "next/navigation";

export default function InstructorCoursesPage() {
  const router = useRouter();
  const {
    courses,
    isLoading,
    setSelectedCourseId,
    handleOpenAddCourse,
    handleOpenEditCourse,
    handleOpenDeleteCourseModal,
  } = useInstructor();

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Authored Courses ({courses.length})</h2>
          <p className="text-xs text-muted">Courses created by you on CPS Academy</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
          + Create New Course
        </Button>
      </div>

      {isLoading ? (
        <CourseGridSkeleton count={3} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          title="No Authored Courses Yet"
          description="Create your first course to begin publishing video lessons and evaluating enrolled students."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
              + Create Your First Course
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const lessonsCount =
              course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
            const quizzesCount = course.quizzes?.length || 0;
            const studentsCount = course.enrollments?.length || 0;

            return (
              <Card key={course.documentId || course.id} className="flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline">{course.category?.name || "Track"}</Badge>
                    <Badge variant="primary">৳{course.price || 0}</Badge>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {course.description || "Instructor syllabus curriculum."}
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
                      <span className="block font-bold text-foreground">{studentsCount}</span>
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
                        router.push("/dashboard/instructor/curriculum");
                      }}
                    >
                      Curriculum
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
                      onClick={() => handleOpenDeleteCourseModal(course)}
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
  );
}
