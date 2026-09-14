"use client";

import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function AdminProgressPage() {
  const {
    courses,
    filteredStudents,
    progressCourseFilter,
    setProgressCourseFilter,
    searchStudent,
    setSearchStudent,
    isLoading,
  } = useAdmin();

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
            <option value="all">All Platform Courses</option>
            {courses.map((c) => (
              <option key={c.documentId || c.id} value={c.documentId || String(c.id)}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-muted font-semibold">
          {isLoading ? (
            <Skeleton className="w-36 h-4 rounded inline-block" />
          ) : (
            `Tracking ${filteredStudents.length} course enrollments`
          )}
        </div>
      </div>

      {/* Progress Table */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          title="No Student Enrollments Found"
          description={
            searchStudent || progressCourseFilter !== "all"
              ? "No enrolled students match your active search or course filter."
              : "No students have enrolled in courses yet."
          }
        />
      ) : (
        <Card className="shadow-1 overflow-hidden">
          <CardContent className="p-0">
            <Table className="border-0 shadow-none rounded-none">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px] min-w-[220px]">Student</TableHead>
                  <TableHead className="min-w-[260px]">Enrolled Course</TableHead>
                  <TableHead className="w-[220px] min-w-[180px]">Progress</TableHead>
                  <TableHead className="w-[160px] min-w-[140px]">Status</TableHead>
                  <TableHead className="w-[140px] min-w-[120px] text-right">Enrolled Date</TableHead>
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] flex items-center justify-center font-bold text-xs border border-[#309255]/25 shrink-0 shadow-2xs">
                            {student?.username?.[0]?.toUpperCase() || "S"}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-xs leading-tight">
                              {student?.username || "Unknown Student"}
                            </div>
                            <div className="text-[10px] text-muted font-medium mt-0.5">
                              {student?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-xs sm:text-sm text-foreground">
                          {course?.title || "CPS Course Track"}
                        </span>
                      </TableCell>
                      <TableCell className="w-48">
                        <div className="flex items-center gap-3">
                          <ProgressBar progress={progressPct} className="flex-1" />
                          <span className="text-xs font-bold text-foreground w-10 text-right shrink-0">
                            {progressPct}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#309255] text-white font-bold text-xs shadow-2xs whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/15 dark:text-[#E7F8EE] border border-[#309255]/25 font-bold text-xs whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#309255] shrink-0"></span>
                            <span>In Progress</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted font-medium text-right whitespace-nowrap">
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
