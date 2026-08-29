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
      strapi.log.warn('[Enrollment Auth] Token verification error:', e.message);
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

module.exports = createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async find(ctx) {
    const user = await resolveUser(ctx, strapi);

    const roleType = (user?.role?.type || '').toLowerCase();
    const roleName = (user?.role?.name || '').toLowerCase();
    const isInstructorUser = roleType === 'instructor' || roleName === 'instructor';
    const isAdminOrManagerUser =
      roleType === 'admin' ||
      roleName === 'admin' ||
      roleType === 'content_manager' ||
      roleName === 'content manager';

    const where = {};
    if (user && isInstructorUser && !isAdminOrManagerUser) {
      where.course = {
        instructor: user.id,
      };
    } else if (user && !isAdminOrManagerUser) {
      where.student = user.id;
    }

    const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
      where,
      populate: {
        student: {
          select: ['id', 'username', 'email'],
        },
        course: {
          populate: {
            category: true,
            instructor: {
              select: ['id', 'username', 'email'],
            },
            modules: {
              populate: ['lessons'],
            },
            quizzes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute live progress percentage for student
    const enhancedEnrollments = await Promise.all(
      enrollments.map(async (e) => {
        if (!e.course || !e.student) return e;

        try {
          const studentId = e.student.id;
          const courseId = e.course.id;

          const allCourseLessons = (e.course.modules || []).flatMap((m) => m.lessons || []);
          const allCourseQuizzes = e.course.quizzes || [];

          const [completedLessons, passedQuizAttempts] = await Promise.all([
            strapi.db.query('api::progress.progress').findMany({
              where: {
                student: studentId,
                course: courseId,
                isCompleted: true,
              },
            }),
            strapi.db.query('api::quiz-attempt.quiz-attempt').findMany({
              where: {
                student: studentId,
                passed: true,
              },
              populate: ['quiz'],
            }),
          ]);

          const courseQuizIds = new Set(allCourseQuizzes.map((q) => q.id));
          const passedCourseQuizzes = new Set(
            passedQuizAttempts.filter((a) => a.quiz && courseQuizIds.has(a.quiz.id)).map((a) => a.quiz.id)
          );

          const totalUnits = Math.max(1, allCourseLessons.length + allCourseQuizzes.length);
          const completedUnits = completedLessons.length + passedCourseQuizzes.size;
          const calculatedPct = Math.min(100, Math.round((completedUnits / totalUnits) * 100));

          const finalPercentage = Math.max(Number(e.progressPercentage || 0), calculatedPct);

          if (finalPercentage !== e.progressPercentage) {
            await strapi.db.query('api::enrollment.enrollment').update({
              where: { id: e.id },
              data: { progressPercentage: finalPercentage },
            });
            e.progressPercentage = finalPercentage;
          }
        } catch (err) {
          strapi.log.warn('[Enrollment Progress Compute Error]:', err.message);
        }

        return e;
      })
    );

    return { data: enhancedEnrollments };
  },

  async create(ctx) {
    const user = await resolveUser(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('Authentication required to enroll.');
    }

    const roleType = (user.role?.type || '').toLowerCase();
    const roleName = (user.role?.name || '').toLowerCase();

    if (roleType === 'admin' || roleType === 'content_manager' || roleType === 'instructor') {
      return ctx.forbidden('Only students are eligible to enroll in courses.');
    }

    const payloadData = ctx.request.body?.data || ctx.request.body || {};
    const rawCourse = payloadData.course;
    let courseId = typeof rawCourse === 'object' ? (rawCourse?.id || rawCourse?.documentId) : rawCourse;

    // Resolve course
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

    if (!targetCourse) {
      return ctx.badRequest('Target course does not exist.');
    }

    // Duplicate enrollment guard
    const existing = await strapi.db.query('api::enrollment.enrollment').findOne({
      where: {
        student: user.id,
        course: targetCourse.id,
      },
    });

    if (existing) {
      return {
        data: existing,
        meta: { message: 'Already enrolled in this course.' },
      };
    }

    const newEnrollment = await strapi.db.query('api::enrollment.enrollment').create({
      data: {
        student: user.id,
        course: targetCourse.id,
        progressPercentage: 0,
        createdAt: new Date(),
      },
      populate: {
        course: true,
        student: {
          select: ['id', 'username', 'email'],
        },
      },
    });

    return { data: newEnrollment };
  },
}));
