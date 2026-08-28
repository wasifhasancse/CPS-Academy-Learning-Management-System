'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const utils = require('@strapi/utils');
const { ForbiddenError, NotFoundError, ValidationError } = utils.errors;

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

module.exports = createCoreController('api::quiz.quiz', ({ strapi }) => ({
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

    const quizzes = await strapi.documents('api::quiz.quiz').findMany({
      filters,
      populate: ['course', 'questions'],
    });

    const sanitizedOutput = await this.sanitizeOutput(quizzes, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const quiz = await strapi.documents('api::quiz.quiz').findOne({
      documentId: id,
      populate: ['course', 'questions'],
    });

    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    const sanitizedOutput = await this.sanitizeOutput(quiz, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { data } = ctx.request.body || {};
    const { title, slug, passingScore, timeLimitMinutes, course: courseId } = data || {};

    if (!title) {
      throw new ValidationError('Quiz title is required');
    }

    if (!courseId) {
      throw new ValidationError('A parent course is required for this quiz');
    }

    const course = await strapi.db.query('api::course.course').findOne({
      where: {
        $or: [{ documentId: String(courseId) }, { id: isNaN(Number(courseId)) ? 0 : Number(courseId) }],
      },
      populate: ['instructor'],
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (isInstructor(user) && !isAdminOrManager(user)) {
      if (course.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only add quizzes to your own courses');
      }
    }

    const resolvedSlug =
      slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const newQuiz = await strapi.documents('api::quiz.quiz').create({
      data: {
        title,
        slug: resolvedSlug,
        passingScore: Number(passingScore) || 80,
        timeLimitMinutes: Number(timeLimitMinutes) || 20,
        course: course.id,
      },
      populate: ['course', 'questions'],
    });

    const sanitizedOutput = await this.sanitizeOutput(newQuiz, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing = await strapi.db.query('api::quiz.quiz').findOne({
      where: {
        $or: [{ documentId: id }, { id: isNaN(Number(id)) ? 0 : Number(id) }],
      },
      populate: {
        course: {
          populate: ['instructor'],
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Quiz not found');
    }

    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      if (existing.course?.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only edit quizzes belonging to your own courses');
      }
    }

    const { data } = ctx.request.body || {};
    const { title, passingScore, timeLimitMinutes } = data || {};

    const updated = await strapi.documents('api::quiz.quiz').update({
      documentId: existing.documentId,
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(passingScore !== undefined ? { passingScore: Number(passingScore) || 80 } : {}),
        ...(timeLimitMinutes !== undefined ? { timeLimitMinutes: Number(timeLimitMinutes) || 20 } : {}),
      },
      populate: ['course', 'questions'],
    });

    const sanitizedOutput = await this.sanitizeOutput(updated, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing = await strapi.db.query('api::quiz.quiz').findOne({
      where: {
        $or: [{ documentId: id }, { id: isNaN(Number(id)) ? 0 : Number(id) }],
      },
      populate: {
        course: {
          populate: ['instructor'],
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Quiz not found');
    }

    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      if (existing.course?.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only delete quizzes from your own courses');
      }
    }

    await strapi.documents('api::quiz.quiz').delete({
      documentId: existing.documentId,
    });

    return ctx.send({ ok: true });
  },
}));
