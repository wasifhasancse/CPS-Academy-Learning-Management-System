"use client";

import { useInstructor } from "@/context/InstructorContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default function InstructorProgressPage() {
  const {
    courses,
    filteredStudents,
    progressCourseFilter,
    setProgressCourseFilter,
    searchStudent,
    setSearchStudent,
  } = useInstructor();

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search student name or email..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="w-64 text-xs"
          />
          <select
            value={progressCourseFilter}
            onChange={(e) => setProgressCourseFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
          >
            <option value="all">All My Courses</option>
            {courses.map((c) => (
              <option key={c.documentId || c.id} value={c.documentId || String(c.id)}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-muted font-semibold">
          Tracking {filteredStudents.length} enrolled students
        </div>
      </div>

      {/* Progress Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          title="No Enrolled Students"
          description={
            searchStudent || progressCourseFilter !== "all"
              ? "No students match your active search or course filter."
              : "No students have enrolled in your authored courses yet."
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course Track</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Enrolled Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((enrollment) => {
                  const student = enrollment.student;
                  const course = enrollment.course;
                  const progressPct = Number(enrollment.progressPercentage) || 0;
                  const isCompleted = progressPct === 100;

                  return (
                    <TableRow key={enrollment.documentId || enrollment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-xs">
                            {student?.username?.[0]?.toUpperCase() || "S"}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-xs">
                              {student?.username || "Unknown Student"}
                            </div>
                            <div className="text-[10px] text-muted">
                              {student?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-xs text-foreground">
                          {course?.title || "CPS Course Track"}
                        </span>
                      </TableCell>
                      <TableCell className="w-44">
                        <div className="flex items-center gap-3">
                          <ProgressBar progress={progressPct} className="flex-1" />
                          <span className="text-xs font-bold text-muted w-9 text-right">
                            {progressPct}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isCompleted ? "highlight" : "secondary"}>
                          {isCompleted ? "Completed" : "In Progress"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted text-right">
                        {enrollment.createdAt
                          ? new Date(enrollment.createdAt).toLocaleDateString()
                          : "Recent"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
