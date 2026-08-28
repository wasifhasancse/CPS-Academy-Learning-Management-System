'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const isInstructor = (user) => {
  const roleType = (user?.role?.type || '').toLowerCase();
  const roleName = (user?.role?.name || '').toLowerCase();
  return roleType === 'instructor' || roleName === 'instructor' || roleName === 'teacher';
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

module.exports = createCoreController('api::progress.progress', ({ strapi }) => ({
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

    const progresses = await strapi.documents('api::progress.progress').findMany({
      filters,
      populate: ['user', 'course', 'completedLessons'],
    });

    const sanitizedOutput = await this.sanitizeOutput(progresses, ctx);
    return this.transformResponse(sanitizedOutput);
  },
}));
