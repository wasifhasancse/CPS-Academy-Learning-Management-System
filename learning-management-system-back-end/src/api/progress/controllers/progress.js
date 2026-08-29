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
    if (isInstructorUser && !isAdminOrManagerUser) {
      where.course = {
        instructor: user.id,
      };
    } else if (!isAdminOrManagerUser) {
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
          select: ['id', 'title', 'slug', 'documentId'],
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    return { data: progresses };
  },

  async create(ctx) {
    const user = await resolveUser(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('Authentication required to update lesson progress.');
    }

    const body = ctx.request.body?.data || ctx.request.body || {};
    const { lessonId, courseId, isCompleted = true } = body;

    let targetLesson = null;
    if (lessonId) {
      if (!isNaN(Number(lessonId)) && Number(lessonId) > 0) {
        targetLesson = await strapi.db.query('api::lesson.lesson').findOne({
          where: { id: Number(lessonId) },
        });
      } else {
        targetLesson = await strapi.db.query('api::lesson.lesson').findOne({
          where: { documentId: String(lessonId) },
        });
      }
    }

    let targetCourse = null;
    if (courseId) {
      if (!isNaN(Number(courseId)) && Number(courseId) > 0) {
        targetCourse = await strapi.db.query('api::course.course').findOne({
          where: { id: Number(courseId) },
        });
      } else {
        targetCourse = await strapi.db.query('api::course.course').findOne({
          where: {
            $or: [
              { slug: String(courseId) },
              { documentId: String(courseId) },
            ],
          },
        });
      }
    }

    if (!targetLesson) {
      return ctx.badRequest('Target lesson is required.');
    }

    const effectiveCourseId = targetCourse ? targetCourse.id : targetLesson.course;

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
          course: effectiveCourseId,
          isCompleted: true,
          completedAt: new Date(),
        },
        populate: ['student', 'lesson', 'course'],
      });
    }

    // Synchronize Enrollment percentage if course is known
    if (effectiveCourseId) {
      const allCourseLessons = await strapi.db.query('api::lesson.lesson').findMany({
        where: { course: effectiveCourseId },
      });
      const completedCourseLessons = await strapi.db.query('api::progress.progress').findMany({
        where: {
          student: user.id,
          course: effectiveCourseId,
          isCompleted: true,
        },
      });

      const totalCount = Math.max(1, allCourseLessons.length);
      const percentage = Math.min(100, Math.round((completedCourseLessons.length / totalCount) * 100));

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

    return { data: progressRecord };
  },
}));
