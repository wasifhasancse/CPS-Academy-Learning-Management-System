"use client";

import { useStudent } from "@/context/StudentContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { CourseGridSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function StudentCoursesPage() {
  const { enrolledCourses, isLoading } = useStudent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Enrolled Courses {isLoading ? "" : `(${enrolledCourses.length})`}</h2>
          <p className="text-xs text-muted">Courses you are currently learning on CPS Academy</p>
        </div>
        <Link href="/dashboard/student/catalog">
          <Button variant="outline" size="sm">
            Browse More Courses
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <CourseGridSkeleton count={3} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
      ) : enrolledCourses.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          title="No Enrolled Courses"
          description="You are not currently enrolled in any course track. Explore the catalog to start learning."
          action={
            <Link href="/dashboard/student/catalog">
              <Button variant="primary" size="sm">
                Explore Course Catalog
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrolledCourses.map((course) => {
            const lessonsCount =
              course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
            const progress = Number(course.progressPercentage) || 0;
            const isFinished = progress === 100;

            return (
              <Card key={course.documentId || course.id} className="flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline">{course.category?.name || "Track"}</Badge>
                    <Badge variant={isFinished ? "primary" : "highlight"}>
                      {isFinished ? "✓ Completed" : "In Progress"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {course.description || "Comprehensive syllabus and practice problems."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted">{lessonsCount} Lessons</span>
                      <span className={`font-bold ${isFinished ? "text-primary dark:text-highlight" : "text-foreground"}`}>
                        {progress}%
                      </span>
                    </div>
                    <ProgressBar progress={progress} />
                  </div>

                  <Link href={`/learn/${course.slug || course.documentId || course.id}`} className="block">
                    <Button variant={isFinished ? "outline" : "primary"} size="sm" className="w-full font-bold">
                      {isFinished
                        ? "✓ Completed (Review Course)"
                        : progress === 0
                        ? "▶ Start Learning Now"
                        : "▶ Continue Learning"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
