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
      strapi.log.warn('[Progress Auth] Token verification error:', e.message);
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

module.exports = createCoreController('api::progress.progress', ({ strapi }) => ({
  async find(ctx) {
    const user = await resolveUser(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('Authentication required to view progress.');
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

    const progresses = await strapi.db.query('api::progress.progress').findMany({
      where,
      populate: {
        student: {
          select: ['id', 'username', 'email'],
        },
        lesson: true,
        course: {
          populate: ['instructor'],
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    if (isInstructorUser && !isAdminOrManagerUser) {
      const myCourses = await strapi.db.query('api::course.course').findMany({
        where: { instructor: user.id },
        select: ['id'],
      });
      const myCourseIdSet = new Set(myCourses.map((c) => c.id));

      const scopedProgresses = progresses.filter((p) => {
        const cId = p.course?.id || p.course;
        return cId && myCourseIdSet.has(cId);
      });

      return { data: scopedProgresses };
    }

    return { data: progresses };
  },

  async create(ctx) {
    const user = await resolveUser(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('Authentication required to update lesson progress.');
    }

    const body = ctx.request.body?.data || ctx.request.body || {};
    const { lessonId, courseId, isCompleted = true } = body;

    const rawLessonStr = String(lessonId || '').replace(/^lesson-/, '').trim();
    const rawCourseStr = String(courseId || '').replace(/^course-/, '').trim();

    let targetLesson = null;
    if (rawLessonStr) {
      if (!isNaN(Number(rawLessonStr)) && Number(rawLessonStr) > 0) {
        targetLesson = await strapi.db.query('api::lesson.lesson').findOne({
          where: { id: Number(rawLessonStr) },
          populate: ['course', 'module'],
        });
      } else {
        targetLesson = await strapi.db.query('api::lesson.lesson').findOne({
          where: { documentId: rawLessonStr },
          populate: ['course', 'module'],
        });
      }
    }

    let targetCourse = null;
    if (rawCourseStr) {
      if (!isNaN(Number(rawCourseStr)) && Number(rawCourseStr) > 0) {
        targetCourse = await strapi.db.query('api::course.course').findOne({
          where: { id: Number(rawCourseStr) },
          populate: {
            modules: { populate: ['lessons'] },
            quizzes: true,
          },
        });
      } else {
        targetCourse = await strapi.db.query('api::course.course').findOne({
          where: {
            $or: [
              { slug: rawCourseStr },
              { documentId: rawCourseStr },
            ],
          },
          populate: {
            modules: { populate: ['lessons'] },
            quizzes: true,
          },
        });
      }
    }

    if (!targetLesson) {
      return ctx.badRequest('Target lesson is required.');
    }

    let effectiveCourseId = targetCourse ? targetCourse.id : (targetLesson.course?.id || targetLesson.course);

    if (!effectiveCourseId && targetLesson.module) {
      const moduleRecord = await strapi.db.query('api::module.module').findOne({
        where: { id: targetLesson.module.id || targetLesson.module },
        populate: ['course'],
      });
      if (moduleRecord?.course) {
        effectiveCourseId = moduleRecord.course.id || moduleRecord.course;
      }
    }

    // Check existing progress record
    const existing = await strapi.db.query('api::progress.progress').findOne({
      where: {
        student: user.id,
        lesson: targetLesson.id,
      },
    });

    let progressRecord;
    if (existing) {
      progressRecord = await strapi.db.query('api::progress.progress').update({
        where: { id: existing.id },
        data: {
          isCompleted,
          completedAt: new Date(),
        },
        populate: ['student', 'lesson', 'course'],
      });
    } else {
      progressRecord = await strapi.db.query('api::progress.progress').create({
        data: {
          student: user.id,
          lesson: targetLesson.id,
          course: effectiveCourseId || null,
          isCompleted: true,
          completedAt: new Date(),
        },
        populate: ['student', 'lesson', 'course'],
      });
    }

    // Synchronize Enrollment percentage with full module & quiz traversal
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

    return { data: progressRecord };
  },
}));
