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

      {courses.length === 0 ? (
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
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">
                  Video Lessons ({currentCourseLessons.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Curriculum videos for {currentCourse.title}
                </CardDescription>
              </div>
              <Button variant="primary" size="sm" onClick={handleOpenAddLesson}>
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
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                  title="No Lessons in this Track"
                  description={`Add video lessons to establish the syllabus for "${currentCourse.title}".`}
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenAddLesson}
                    >
                      + Add First Lesson
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {currentCourseLessons.map((lesson, idx) => (
                    <div
                      key={lesson.documentId || lesson.id}
                      className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-muted flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-foreground truncate">
                              {lesson.title}
                            </h4>
                            {lesson.isFreePreview && (
                              <Badge
                                variant="highlight"
                                className="text-[10px] py-0"
                              >
                                Free Preview
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted truncate mt-0.5">
                            ⏱ {lesson.duration || "10:00"} • {lesson.youtubeUrl}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEditLesson(lesson)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
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
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">
                  MCQ Quizzes ({currentCourseQuizzes.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Graded assessments for {currentCourse.title}
                </CardDescription>
              </div>
              <Button variant="secondary" size="sm" onClick={handleOpenAddQuiz}>
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
                      variant="secondary"
                      size="sm"
                      onClick={handleOpenAddQuiz}
                    >
                      + Add First Quiz
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {currentCourseQuizzes.map((quiz) => (
                    <div
                      key={quiz.documentId || quiz.id}
                      className="p-3 rounded-lg border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-semibold text-xs text-foreground">
                          {quiz.title}
                        </h4>
                        <p className="text-[11px] text-muted mt-0.5">
                          Total Score: {quiz.totalScore || 100} pts • Time:{" "}
                          {quiz.timeLimitMinutes || 20}m • Questions:{" "}
                          {quiz.questions?.length || 0}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenManageQuestions(quiz)}
                        >
                          Questions ({quiz.questions?.length || 0})
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEditQuiz(quiz)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
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
