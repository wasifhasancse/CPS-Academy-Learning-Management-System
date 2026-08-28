"use client";

import { useStudent } from "@/context/StudentContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function StudentQuizzesPage() {
  const { quizAttempts } = useStudent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Quiz Evaluations ({quizAttempts.length})
          </h2>
          <p className="text-xs text-muted">
            Your verified assessment attempts and scorecard history
          </p>
        </div>
      </div>

      {quizAttempts.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz Name</TableHead>
                  <TableHead>Course Track</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Passing Criteria</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Date Taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizAttempts.map((attempt) => {
                  const quiz = attempt.quiz;
                  const course = attempt.course;
                  const passingScore = quiz?.passingScore || 80;
                  const isPassed = attempt.score >= passingScore;

                  return (
                    <TableRow key={attempt.documentId || attempt.id}>
                      <TableCell>
                        <span className="font-semibold text-xs text-foreground">
                          {quiz?.title || "Quiz Evaluation"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {course?.title || "CPS Course Track"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-bold text-xs ${
                            isPassed ? "text-primary dark:text-highlight" : "text-red-500"
                          }`}
                        >
                          {attempt.score || 0}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted">{passingScore}%</TableCell>
                      <TableCell>
                        <Badge variant={isPassed ? "highlight" : "danger"}>
                          {isPassed ? "PASSED" : "FAILED"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted text-right">
                        {attempt.createdAt
                          ? new Date(attempt.createdAt).toLocaleDateString()
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
