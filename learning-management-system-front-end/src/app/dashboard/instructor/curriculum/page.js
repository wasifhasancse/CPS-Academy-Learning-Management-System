"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInstructor } from "@/context/InstructorContext";

function CurriculumSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      {[0, 1].map((col) => (
        <div key={col} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-surface" />
              <div className="h-3 w-56 rounded bg-surface" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-surface" />
          </div>
          <div className="space-y-3 pt-2">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-card" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-36 rounded bg-card" />
                    <div className="h-2.5 w-24 rounded bg-card" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-14 rounded-lg bg-card" />
                  <div className="h-7 w-14 rounded-lg bg-card" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InstructorCurriculumPage() {
  const {
    courses,
    selectedCourseId,
    setSelectedCourseId,
    currentCourse,
    currentCourseLessons,
    currentCourseQuizzes,
    handleOpenAddCourse,
    handleOpenAddLesson,
    handleOpenEditLesson,
    handleOpenDeleteLessonModal,
    handleOpenAddQuiz,
    handleOpenEditQuiz,
    handleOpenDeleteQuizModal,
    handleOpenManageQuestions,
    isLoading,
    actionLoading,
  } = useInstructor();

  return (
    <div className="space-y-6">
      {/* Select Course Card */}
      <Card className="bg-surface border-border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider shrink-0">
              SELECT COURSE:
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
                  <option
                    key={c.documentId || c.id}
                    value={c.documentId || String(c.id)}
                  >
                    {c.title}
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

      {isLoading || actionLoading ? (
        <CurriculumSkeleton />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          title="No Assigned Courses Yet"
          description="Create your first course to begin building video lessons and quizzes."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
              + Create Course
            </Button>
          }
        />
      ) : currentCourse ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lessons Box */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="min-w-0">
                <CardTitle className="text-base font-extrabold tracking-tight">
                  Video Lessons ({currentCourseLessons.length})
                </CardTitle>
                <CardDescription className="text-xs text-muted mt-0.5 truncate">
                  Curriculum videos for {currentCourse.title}
                </CardDescription>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="shrink-0 text-xs font-bold px-3 py-1.5 whitespace-nowrap shadow-1"
                onClick={handleOpenAddLesson}
              >
                + Add Lesson
              </Button>
            </CardHeader>

            <CardContent>
              {currentCourseLessons.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  title="No Lessons in this Track"
                  description={`Add video lessons to establish the syllabus for "${currentCourse.title}".`}
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs font-bold px-3 py-1.5 whitespace-nowrap"
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
                      className="p-3.5 rounded-xl border border-border bg-surface hover:border-[#309255]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] border border-[#309255]/25 flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">
                              {lesson.title}
                            </h4>
                            {lesson.isFreePreview && (
                              <span className="px-2 py-0.5 rounded-full bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] border border-[#309255]/30 text-[10px] font-bold shrink-0">
                                Free Preview
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted truncate mt-0.5">
                            ⏱ {lesson.duration || "10:00"} • {lesson.youtubeUrl}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold px-2.5 py-1.5 whitespace-nowrap border-[#309255]/30 text-[#309255] hover:bg-[#E7F8EE]/40"
                          onClick={() => handleOpenEditLesson(lesson)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="text-xs font-semibold px-2.5 py-1.5 whitespace-nowrap"
                          onClick={() => handleOpenDeleteLessonModal(lesson)}
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

          {/* Quizzes Box */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="min-w-0">
                <CardTitle className="text-base font-extrabold tracking-tight">
                  MCQ Quizzes ({currentCourseQuizzes.length})
                </CardTitle>
                <CardDescription className="text-xs text-muted mt-0.5 truncate">
                  Graded assessments for {currentCourse.title}
                </CardDescription>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="shrink-0 text-xs font-bold px-3 py-1.5 whitespace-nowrap shadow-1"
                onClick={handleOpenAddQuiz}
              >
                + Add Quiz
              </Button>
            </CardHeader>

            <CardContent>
              {currentCourseQuizzes.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                  title="No Quizzes in this Track"
                  description={`Add MCQ assessments to grade students taking "${currentCourse.title}".`}
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs font-bold px-3 py-1.5 whitespace-nowrap"
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
                      className="p-4 rounded-xl border border-border bg-surface hover:border-[#309255]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="min-w-0 space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-foreground leading-snug">
                          {quiz.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-muted flex-wrap">
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                            🏆 {quiz.totalScore || 100} pts
                          </span>
                          <span>•</span>
                          <span>⏱ {quiz.timeLimitMinutes || 20}m</span>
                          <span>•</span>
                          <span>📝 {quiz.questions?.length || 0} Questions</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs font-bold px-3 py-1.5 whitespace-nowrap shadow-2xs"
                          onClick={() => handleOpenManageQuestions(quiz)}
                        >
                          Manage Questions ({quiz.questions?.length || 0})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold px-2.5 py-1.5 whitespace-nowrap border-[#309255]/30 text-[#309255] hover:bg-[#E7F8EE]/40"
                          onClick={() => handleOpenEditQuiz(quiz)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="text-xs font-semibold px-2.5 py-1.5 whitespace-nowrap"
                          onClick={() => handleOpenDeleteQuizModal(quiz)}
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
      ) : null}
    </div>
  );
}
