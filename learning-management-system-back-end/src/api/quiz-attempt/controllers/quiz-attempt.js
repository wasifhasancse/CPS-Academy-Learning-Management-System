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
    const isInstructorUser = roleType === 'instructor' || roleName === 'instructor';
    const isAdminOrManagerUser =
      roleType === 'admin' ||
      roleName === 'admin' ||
      roleType === 'content_manager' ||
      roleName === 'content manager';

    const where = {};
    if (!isAdminOrManagerUser && !isInstructorUser) {
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

    if (isInstructorUser && !isAdminOrManagerUser) {
      const myCourses = await strapi.db.query('api::course.course').findMany({
        where: { instructor: user.id },
        select: ['id'],
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
      return ctx.unauthorized('Authentication required to submit a quiz.');
    }

    const body = ctx.request.body?.data || ctx.request.body || {};
    const { quizId, rawCourseId, courseId = rawCourseId, quiz: rawQuiz, score: clientScore, answers = {}, submittedAnswers = answers } = body;

    const rawQuizStr = String(quizId || (typeof rawQuiz === 'object' ? (rawQuiz?.id || rawQuiz?.documentId) : rawQuiz) || '')
      .replace(/^quiz-/, '')
      .trim();

    let quiz = null;
    if (rawQuizStr) {
      if (!isNaN(Number(rawQuizStr)) && Number(rawQuizStr) > 0) {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: { id: Number(rawQuizStr) },
          populate: ['questions', 'course'],
        });
      } else {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: {
            $or: [
              { slug: rawQuizStr },
              { documentId: rawQuizStr },
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
          : (submittedAnswers[q.documentId] !== undefined ? submittedAnswers[q.documentId] : submittedAnswers[String(q.id)]);

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
          populate: ['questions', 'course'],
        },
        student: {
          select: ['id', 'username', 'email'],
        },
      },
    });

    // Synchronize Enrollment Progress with full module & quiz traversal
    let effectiveCourseId = quiz.course?.id || quiz.course;
    if (!effectiveCourseId && courseId) {
      const cleanCourseStr = String(courseId).replace(/^course-/, '').trim();
      const foundCourse = await strapi.db.query('api::course.course').findOne({
        where: {
          $or: [
            ...(!isNaN(Number(cleanCourseStr)) ? [{ id: Number(cleanCourseStr) }] : []),
            { slug: cleanCourseStr },
            { documentId: cleanCourseStr },
          ],
        },
      });
      if (foundCourse) effectiveCourseId = foundCourse.id;
    }

    if (effectiveCourseId) {
      const fullCourse = await strapi.db.query('api::course.course').findOne({
        where: { id: effectiveCourseId },
        populate: {
          modules: { populate: ['lessons'] },
          quizzes: true,
        },
      });

      if (fullCourse) {
        const allLessons = (fullCourse.modules || []).flatMap((m) => m.lessons || []);
        const allQuizzes = fullCourse.quizzes || [];
        const lessonIds = new Set(allLessons.map((l) => l.id));
        const quizIds = new Set(allQuizzes.map((q) => q.id));

        const [studentProgresses, studentAttempts] = await Promise.all([
          strapi.db.query('api::progress.progress').findMany({
            where: {
              student: user.id,
              isCompleted: true,
            },
            populate: ['lesson'],
          }),
          strapi.db.query('api::quiz-attempt.quiz-attempt').findMany({
            where: {
              student: user.id,
              passed: true,
            },
            populate: ['quiz'],
          }),
        ]);

        const completedLessonsCount = new Set(
          studentProgresses.filter((p) => p.lesson && lessonIds.has(p.lesson.id)).map((p) => p.lesson.id)
        ).size;

        const passedQuizzesCount = new Set(
          studentAttempts.filter((a) => a.quiz && quizIds.has(a.quiz.id)).map((a) => a.quiz.id)
        ).size;

        const totalUnits = Math.max(1, allLessons.length + allQuizzes.length);
        const completedUnits = completedLessonsCount + passedQuizzesCount;
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
