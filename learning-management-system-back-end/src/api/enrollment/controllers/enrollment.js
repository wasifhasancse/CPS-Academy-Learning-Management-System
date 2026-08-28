'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const isInstructor = (user) => {
  const roleType = (user?.role?.type || '').toLowerCase();
  const roleName = (user?.role?.name || '').toLowerCase();
  return roleType === 'instructor' || roleName === 'instructor';
};

const isAdminOrManager = (user) => {
  const roleType = (user?.role?.type || '').toLowerCase();
  const roleName = (user?.role?.name || '').toLowerCase();
  return (
    roleType === 'admin' ||
    roleName === 'admin' ||
    roleType === 'content_manager' ||
    roleName === 'content manager'
  );
};

module.exports = createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    const filters = {};
    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      filters.course = {
        instructor: {
          id: user.id,
        },
      };
    }

    const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
      filters,
      populate: ['student', 'course'],
    });

    const sanitizedOutput = await this.sanitizeOutput(enrollments, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required to enroll.');
    }

    const roleType = (user.role?.type || '').toLowerCase();
    const roleName = (user.role?.name || '').toLowerCase();

    // Invariant: Admin, Content Manager, and Instructor cannot enroll in courses
    if (roleType !== 'student' && roleName !== 'student') {
      return ctx.forbidden('Only students are eligible to enroll in courses.');
    }

    return super.create(ctx);
  },
}));
