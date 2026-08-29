'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const resolveUser = async (ctx, strapi) => {
  if (ctx.state.user && ctx.state.user.role?.type) return ctx.state.user;
  const authHeader = ctx.request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = await strapi.plugin('users-permissions').service('jwt').verify(token);
      if (decoded && decoded.id) {
        return await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: decoded.id },
          populate: ['role'],
        });
      }
    } catch (e) {
      strapi.log.warn('[QuizAttempt Auth] Token verification error:', e.message);
    }
  }
  if (ctx.state.user?.id) {
    return await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: ['role'],
    });
  }
  return null;
};

module.exports = createCoreController('api::quiz-attempt.quiz-attempt', ({ strapi }) => ({
  async find(ctx) {
    const user = await resolveUser(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('Authentication required to view quiz attempts.');
    }

    const roleType = (user.role?.type || '').toLowerCase();
    const roleName = (user.role?.name || '').toLowerCase();
    const isAdminOrManagerUser =
      roleType === 'admin' ||
      roleName === 'admin' ||
      roleType === 'content_manager' ||
      roleName === 'content manager';

    const where = {};
    if (!isAdminOrManagerUser) {
      where.student = user.id;
    }

    const attempts = await strapi.db.query('api::quiz-attempt.quiz-attempt').findMany({
      where,
      populate: {
        student: {
          select: ['id', 'username', 'email'],
        },
        quiz: {
          populate: ['questions', 'course'],
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return { data: attempts };
  },

  async create(ctx) {
    const user = await resolveUser(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('Authentication required to submit a quiz.');
    }

    const body = ctx.request.body?.data || ctx.request.body || {};
    const { quizId, rawCourseId, courseId = rawCourseId, quiz: rawQuiz, score: clientScore, answers = {}, submittedAnswers = answers } = body;

    const targetQuizId = quizId || (typeof rawQuiz === 'object' ? (rawQuiz?.id || rawQuiz?.documentId) : rawQuiz);

    let quiz = null;
    if (targetQuizId) {
      if (!isNaN(Number(targetQuizId)) && Number(targetQuizId) > 0) {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: { id: Number(targetQuizId) },
          populate: ['questions', 'course'],
        });
      } else {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: {
            $or: [
              { slug: String(targetQuizId) },
              { documentId: String(targetQuizId) },
            ],
          },
          populate: ['questions', 'course'],
        });
      }
    }

    if (!quiz) {
      return ctx.badRequest('Target quiz not found.');
    }

    const questions = quiz.questions || [];
    let calculatedScore = 0;

    if (questions.length > 0) {
      let correctCount = 0;
      questions.forEach((q) => {
        const studentChoice = submittedAnswers[q.id] !== undefined
          ? submittedAnswers[q.id]
          : submittedAnswers[q.documentId];

        if (studentChoice !== undefined && Number(studentChoice) === Number(q.correctAnswer)) {
          correctCount += 1;
        }
      });
      calculatedScore = Math.round((correctCount / questions.length) * 100);
    } else if (clientScore !== undefined) {
      calculatedScore = Number(clientScore);
    }

    const passingScore = quiz.passingScore || 80;
    const passed = calculatedScore >= passingScore;

    const newAttempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').create({
      data: {
        student: user.id,
        quiz: quiz.id,
        score: calculatedScore,
        passed,
        submittedAnswers,
        submittedAt: new Date(),
      },
      populate: {
        quiz: {
          populate: ['questions'],
        },
        student: {
          select: ['id', 'username', 'email'],
        },
      },
    });

    // Synchronize Enrollment Progress
    let effectiveCourseId = quiz.course?.id || quiz.course;
    if (!effectiveCourseId && courseId) {
      const foundCourse = await strapi.db.query('api::course.course').findOne({
        where: {
          $or: [
            ...(!isNaN(Number(courseId)) ? [{ id: Number(courseId) }] : []),
            { slug: String(courseId) },
            { documentId: String(courseId) },
          ],
        },
      });
      if (foundCourse) effectiveCourseId = foundCourse.id;
    }

    if (effectiveCourseId) {
      const allCourseLessons = await strapi.db.query('api::lesson.lesson').findMany({
        where: { course: effectiveCourseId },
      });
      const allCourseQuizzes = await strapi.db.query('api::quiz.quiz').findMany({
        where: { course: effectiveCourseId },
      });

      const completedLessons = await strapi.db.query('api::progress.progress').findMany({
        where: {
          student: user.id,
          course: effectiveCourseId,
          isCompleted: true,
        },
      });

      const passedQuizAttempts = await strapi.db.query('api::quiz-attempt.quiz-attempt').findMany({
        where: {
          student: user.id,
          passed: true,
        },
        populate: ['quiz'],
      });

      const courseQuizIds = new Set(allCourseQuizzes.map((q) => q.id));
      const passedCourseQuizzes = new Set(
        passedQuizAttempts.filter((a) => a.quiz && courseQuizIds.has(a.quiz.id)).map((a) => a.quiz.id)
      );

      const totalUnits = Math.max(1, allCourseLessons.length + allCourseQuizzes.length);
      const completedUnits = completedLessons.length + passedCourseQuizzes.size;
      const percentage = Math.min(100, Math.round((completedUnits / totalUnits) * 100));

      const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
        where: {
          student: user.id,
          course: effectiveCourseId,
        },
      });

      if (enrollment) {
        await strapi.db.query('api::enrollment.enrollment').update({
          where: { id: enrollment.id },
          data: { progressPercentage: percentage },
        });
      }
    }

    return {
      data: newAttempt,
      meta: {
        score: calculatedScore,
        passed,
        passingScore,
      },
    };
  },
}));
