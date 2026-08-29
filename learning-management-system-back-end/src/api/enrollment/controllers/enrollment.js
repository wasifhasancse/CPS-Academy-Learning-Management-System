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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: enrollments };
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

    return super.create(ctx);
  },
}));
