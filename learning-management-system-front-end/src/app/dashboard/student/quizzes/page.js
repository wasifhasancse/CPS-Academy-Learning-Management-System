"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useStudent } from "@/context/StudentContext";
import Link from "next/link";
import { useState } from "react";
import { HiOutlineEye, HiOutlineXMark } from "react-icons/hi2";

export default function StudentQuizzesPage() {
  const { quizAttempts, isLoading } = useStudent();
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Quiz Evaluations {isLoading ? "" : `(${quizAttempts.length})`}
          </h2>
          <p className="text-xs text-muted">
            Your verified assessment attempts, scorecards, and stored answers
          </p>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} columns={7} />
      ) : quizAttempts.length === 0 ? (
        <EmptyState
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
          title="No Quiz Attempts Recorded"
          description="Take checkpoint quizzes inside your enrolled courses to assess your progress and earn verified scores."
          action={
            <Link href="/dashboard/student/courses">
              <Button variant="primary" size="sm">
                Go to Enrolled Courses
              </Button>
            </Link>
          }
        />
      ) : (
        <Card className="shadow-1 overflow-hidden">
          <CardContent className="p-0">
            <Table className="border-0 shadow-none rounded-none">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Quiz Name</TableHead>
                  <TableHead className="min-w-[220px]">Course Track</TableHead>
                  <TableHead className="w-[120px] min-w-[100px]">Score</TableHead>
                  <TableHead className="w-[120px] min-w-[100px]">Total Score</TableHead>
                  <TableHead className="w-[140px] min-w-[120px]">Result</TableHead>
                  <TableHead className="w-[130px] min-w-[110px] text-right">Date Taken</TableHead>
                  <TableHead className="w-[140px] min-w-[120px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizAttempts.map((attempt) => {
                  const quiz = attempt.quiz;
                  const course = attempt.course || attempt.quiz?.course;
                  const totalScore = Number(
                    attempt.totalScore || quiz?.totalScore || 100,
                  );
                  const isCompleted = Boolean(attempt.passed);

                  return (
                    <TableRow key={attempt.documentId || attempt.id}>
                      <TableCell>
                        <span className="font-bold text-xs sm:text-sm text-foreground">
                          {quiz?.title || "Quiz Evaluation"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {course?.title || "CPS Course Track"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`font-bold text-xs ${
                            isCompleted
                              ? "text-[#309255] dark:text-[#E7F8EE]"
                              : "text-red-500"
                          }`}
                        >
                          {attempt.score || 0} pts
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted whitespace-nowrap">
                        {totalScore} pts
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#309255] text-white font-bold text-xs shadow-2xs whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-xs whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                            <span>Incomplete</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted text-right whitespace-nowrap">
                        {attempt.submittedAt || attempt.createdAt
                          ? new Date(
                              attempt.submittedAt || attempt.createdAt,
                            ).toLocaleDateString()
                          : "Recent"}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          onClick={() => setSelectedAttempt(attempt)}
                          variant="outline"
                          size="sm"
                          className="text-xs py-1 px-2.5 gap-1"
                        >
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          <span>View Answers</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Stored Answers Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-border p-6 shadow-1 space-y-5 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="space-y-0.5">
                <Badge
                  variant={selectedAttempt.passed ? "highlight" : "danger"}
                  size="sm"
                >
                  {selectedAttempt.passed ? "COMPLETED" : "INCOMPLETE"} (
                  {selectedAttempt.score || 0}/
                  {Number(
                    selectedAttempt.totalScore ||
                      selectedAttempt.quiz?.totalScore ||
                      100,
                  )}{" "}
                  pts)
                </Badge>
                <h3 className="font-extrabold text-base text-foreground mt-1">
                  {selectedAttempt.quiz?.title || "Quiz Scorecard"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-1 rounded-lg text-muted hover:text-foreground cursor-pointer"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {(selectedAttempt.quiz?.questions || []).map((q, qIdx) => {
                const answersMap =
                  selectedAttempt.submittedAnswers ||
                  selectedAttempt.answers ||
                  {};
                const selected =
                  answersMap[q.id] !== undefined
                    ? answersMap[q.id]
                    : answersMap[q.documentId];
                const isCorrect = Number(selected) === Number(q.correctAnswer);
                const questionCount =
                  (selectedAttempt.quiz?.questions || []).length || 1;
                const perQuestionScore = Math.round(
                  Number(
                    selectedAttempt.totalScore ||
                      selectedAttempt.quiz?.totalScore ||
                      100,
                  ) / questionCount,
                );

                return (
                  <div
                    key={q.id || qIdx}
                    className="p-4 rounded-xl bg-surface border border-border space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground">
                        {qIdx + 1}. {q.prompt || q.title}
                      </h4>
                      <Badge
                        variant={isCorrect ? "highlight" : "danger"}
                        size="sm"
                      >
                        {isCorrect
                          ? `Correct (+${perQuestionScore})`
                          : "Incorrect (0)"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(Array.isArray(q.options)
                        ? q.options
                        : ["Option A", "Option B", "Option C", "Option D"]
                      ).map((opt, optIdx) => {
                        const isStudentChoice = Number(selected) === optIdx;
                        const isCorrectChoice =
                          Number(q.correctAnswer) === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              isCorrectChoice
                                ? "bg-green-500/15 border-green-600 text-green-700 dark:text-green-300 font-bold"
                                : isStudentChoice
                                  ? "bg-red-500/15 border-red-500 text-red-600 font-medium"
                                  : "bg-card border-border text-muted"
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + optIdx)}.{" "}
                              {typeof opt === "string" ? opt : opt.text}
                            </span>
                            {isStudentChoice && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-foreground/10">
                                Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-card border border-border text-[11px] text-muted">
                        <strong className="text-foreground">
                          Explanation:{" "}
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border">
              <Button
                onClick={() => setSelectedAttempt(null)}
                variant="primary"
                size="sm"
              >
                Close Scorecard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
