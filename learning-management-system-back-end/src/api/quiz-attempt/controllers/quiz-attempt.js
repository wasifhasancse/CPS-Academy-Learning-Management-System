'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quiz-attempt.quiz-attempt', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required to take quizzes.');
    }

    const roleType = (user.role?.type || '').toLowerCase();
    const roleName = (user.role?.name || '').toLowerCase();

    // Invariant: Admin, Content Manager, and Instructor cannot take quizzes
    if (roleType !== 'student' && roleName !== 'student') {
      return ctx.forbidden('Only students are eligible to take quizzes.');
    }

    return super.create(ctx);
  },
}));
