"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

const resolveUser = async (ctx, strapi) => {
  if (ctx.state.user && ctx.state.user.role?.type) return ctx.state.user;
  const authHeader = ctx.request.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = await strapi
        .plugin("users-permissions")
        .service("jwt")
        .verify(token);
      if (decoded && decoded.id) {
        return await strapi.db.query("plugin::users-permissions.user").findOne({
          where: { id: decoded.id },
          populate: ["role"],
        });
      }
    } catch (e) {
      strapi.log.warn(
        "[QuizAttempt Auth] Token verification error:",
        e.message,
      );
    }
  }
  if (ctx.state.user?.id) {
    return await strapi.db.query("plugin::users-permissions.user").findOne({
      where: { id: ctx.state.user.id },
      populate: ["role"],
    });
  }
  return null;
};

module.exports = createCoreController(
  "api::quiz-attempt.quiz-attempt",
  ({ strapi }) => ({
    async find(ctx) {
      const user = await resolveUser(ctx, strapi);
      if (!user) {
        return ctx.unauthorized(
          "Authentication required to view quiz attempts.",
        );
      }

      const roleType = (user.role?.type || "").toLowerCase();
      const roleName = (user.role?.name || "").toLowerCase();
      const isInstructorUser =
        roleType === "instructor" || roleName === "instructor";
      const isAdminOrManagerUser =
        roleType === "admin" ||
        roleName === "admin" ||
        roleType === "content_manager" ||
        roleName === "content manager";

      const where = {};
      if (!isAdminOrManagerUser && !isInstructorUser) {
        where.student = user.id;
      }

      const attempts = await strapi.db
        .query("api::quiz-attempt.quiz-attempt")
        .findMany({
          where,
          populate: {
            student: {
              select: ["id", "username", "email"],
            },
            quiz: {
              populate: ["questions", "course"],
            },
          },
          orderBy: { submittedAt: "desc" },
        });

      if (isInstructorUser && !isAdminOrManagerUser) {
        const myCourses = await strapi.db.query("api::course.course").findMany({
          where: { instructor: user.id },
          select: ["id"],
        });
        const myCourseIdSet = new Set(myCourses.map((c) => c.id));

        const scopedAttempts = attempts.filter((a) => {
          const courseId = a.quiz?.course?.id || a.quiz?.course;
          return courseId && myCourseIdSet.has(courseId);
        });

        return { data: scopedAttempts };
      }

      return { data: attempts };
    },

    async create(ctx) {
      const user = await resolveUser(ctx, strapi);
      if (!user) {
        return ctx.unauthorized("Authentication required to submit a quiz.");
      }

      const body = ctx.request.body?.data || ctx.request.body || {};
      const {
        quizId,
        rawCourseId,
        courseId = rawCourseId,
        quiz: rawQuiz,
        score: clientScore,
        answers = {},
        submittedAnswers = answers,
      } = body;

      const rawQuizStr = String(
        quizId ||
          (typeof rawQuiz === "object"
            ? rawQuiz?.id || rawQuiz?.documentId
            : rawQuiz) ||
          "",
      )
        .replace(/^quiz-/, "")
        .trim();

      let quiz = null;
      if (rawQuizStr) {
        if (!isNaN(Number(rawQuizStr)) && Number(rawQuizStr) > 0) {
          quiz = await strapi.db.query("api::quiz.quiz").findOne({
            where: { id: Number(rawQuizStr) },
            populate: ["questions", "course"],
          });
        } else {
          quiz = await strapi.db.query("api::quiz.quiz").findOne({
            where: {
              $or: [{ slug: rawQuizStr }, { documentId: rawQuizStr }],
            },
            populate: ["questions", "course"],
          });
        }
      }

      if (!quiz) {
        return ctx.badRequest("Target quiz not found.");
      }

      const questions = quiz.questions || [];
      const totalScore = Number(quiz.totalScore) || 100;
      const perQuestionScore =
        questions.length > 0 ? totalScore / questions.length : 0;

      let earnedScore = 0;
      let answeredCount = 0;

      if (questions.length > 0) {
        questions.forEach((q) => {
          const studentChoice =
            submittedAnswers[q.id] !== undefined
              ? submittedAnswers[q.id]
              : submittedAnswers[q.documentId] !== undefined
                ? submittedAnswers[q.documentId]
                : submittedAnswers[String(q.id)];

          if (studentChoice !== undefined) {
            answeredCount += 1;
            if (Number(studentChoice) === Number(q.correctAnswer)) {
              earnedScore += perQuestionScore;
            }
          }
        });
      } else if (clientScore !== undefined) {
        earnedScore = Number(clientScore);
      }

      const calculatedScore = Math.round(earnedScore);
      // "Completed" once every question in the quiz has been answered.
      const isCompleted =
        questions.length > 0 && answeredCount === questions.length;

      const newAttempt = await strapi.db
        .query("api::quiz-attempt.quiz-attempt")
        .create({
          data: {
            student: user.id,
            quiz: quiz.id,
            score: calculatedScore,
            totalScore,
            passed: isCompleted,
            submittedAnswers,
            submittedAt: new Date(),
          },
          populate: {
            quiz: {
              populate: ["questions", "course"],
            },
            student: {
              select: ["id", "username", "email"],
            },
          },
        });

      // Synchronize Enrollment Progress with full module & quiz traversal
      let effectiveCourseId = quiz.course?.id || quiz.course;
      if (!effectiveCourseId && courseId) {
        const cleanCourseStr = String(courseId)
          .replace(/^course-/, "")
          .trim();
        const foundCourse = await strapi.db
          .query("api::course.course")
          .findOne({
            where: {
              $or: [
                ...(!isNaN(Number(cleanCourseStr))
                  ? [{ id: Number(cleanCourseStr) }]
                  : []),
                { slug: cleanCourseStr },
                { documentId: cleanCourseStr },
              ],
            },
          });
        if (foundCourse) effectiveCourseId = foundCourse.id;
      }

      if (effectiveCourseId) {
        await strapi
          .service("api::enrollment.enrollment")
          .recalculateProgress(user.id, effectiveCourseId);
      }

      return {
        data: newAttempt,
        meta: {
          score: calculatedScore,
          totalScore,
          passed: isCompleted,
        },
      };
    },
  }),
);
