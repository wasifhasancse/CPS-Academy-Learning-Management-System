"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::enrollment.enrollment",
  ({ strapi }) => ({
    /**
     * Single source of truth for a student's progress on a course.
     * Recomputes (completed lessons + passed quizzes) / (total lessons + quizzes)
     * and persists it onto the Enrollment record so every dashboard (Student,
     * Instructor, Content Manager, Admin) reads the exact same stored value.
     */
    async recalculateProgress(studentId, courseId) {
      if (!studentId || !courseId) return null;

      const course = await strapi.db.query("api::course.course").findOne({
        where: { id: courseId },
        populate: { modules: { populate: ["lessons"] }, quizzes: true },
      });
      if (!course) return null;

      const lessons = (course.modules || []).flatMap((m) => m.lessons || []);
      const quizzes = course.quizzes || [];
      const lessonIds = new Set(lessons.map((l) => l.id));
      const quizIds = new Set(quizzes.map((q) => q.id));

      const [completedProgress, passedAttempts] = await Promise.all([
        strapi.db.query("api::progress.progress").findMany({
          where: { student: studentId, isCompleted: true },
          populate: ["lesson"],
        }),
        strapi.db.query("api::quiz-attempt.quiz-attempt").findMany({
          where: { student: studentId, passed: true },
          populate: ["quiz"],
        }),
      ]);

      const completedLessonsCount = new Set(
        completedProgress
          .filter((p) => p.lesson && lessonIds.has(p.lesson.id))
          .map((p) => p.lesson.id),
      ).size;

      const passedQuizzesCount = new Set(
        passedAttempts
          .filter((a) => a.quiz && quizIds.has(a.quiz.id))
          .map((a) => a.quiz.id),
      ).size;

      const totalUnits = Math.max(1, lessons.length + quizzes.length);
      const completedUnits = completedLessonsCount + passedQuizzesCount;
      const percentage = Math.min(
        100,
        Math.round((completedUnits / totalUnits) * 100),
      );

      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: { student: studentId, course: courseId },
        });

      if (enrollment) {
        const nextStatus =
          percentage === 100
            ? "completed"
            : enrollment.status === "cancelled"
              ? "cancelled"
              : "active";
        if (
          enrollment.progressPercentage !== percentage ||
          enrollment.status !== nextStatus
        ) {
          await strapi.db.query("api::enrollment.enrollment").update({
            where: { id: enrollment.id },
            data: { progressPercentage: percentage, status: nextStatus },
          });
        }
      }

      return percentage;
    },
  }),
);
