'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const utils = require('@strapi/utils');
const { ForbiddenError, NotFoundError, ValidationError } = utils.errors;

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

module.exports = createCoreController('api::question.question', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { data } = ctx.request.body || {};
    const { prompt, options, correctAnswer, explanation, points, quiz: quizId } = data || {};

    if (!prompt || !options || !quizId) {
      throw new ValidationError('Question prompt, options, and quiz relation are required');
    }

    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: {
        $or: [{ documentId: String(quizId) }, { id: isNaN(Number(quizId)) ? 0 : Number(quizId) }],
      },
      populate: {
        course: {
          populate: ['instructor'],
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    if (isInstructor(user) && !isAdminOrManager(user)) {
      if (quiz.course?.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only add questions to quizzes in your own courses');
      }
    }

    const newQuestion = await strapi.documents('api::question.question').create({
      data: {
        prompt,
        options,
        correctAnswer: Number(correctAnswer) || 0,
        explanation: explanation || '',
        points: Number(points) || 1,
        quiz: quiz.id,
      },
      populate: ['quiz'],
    });

    const sanitizedOutput = await this.sanitizeOutput(newQuestion, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing = await strapi.db.query('api::question.question').findOne({
      where: {
        $or: [{ documentId: id }, { id: isNaN(Number(id)) ? 0 : Number(id) }],
      },
      populate: {
        quiz: {
          populate: {
            course: {
              populate: ['instructor'],
            },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Question not found');
    }

    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      if (existing.quiz?.course?.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only edit questions in your own courses');
      }
    }

    const { data } = ctx.request.body || {};
    const { prompt, options, correctAnswer, explanation, points } = data || {};

    const updated = await strapi.documents('api::question.question').update({
      documentId: existing.documentId,
      data: {
        ...(prompt !== undefined ? { prompt } : {}),
        ...(options !== undefined ? { options } : {}),
        ...(correctAnswer !== undefined ? { correctAnswer: Number(correctAnswer) } : {}),
        ...(explanation !== undefined ? { explanation } : {}),
        ...(points !== undefined ? { points: Number(points) } : {}),
      },
      populate: ['quiz'],
    });

    const sanitizedOutput = await this.sanitizeOutput(updated, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing = await strapi.db.query('api::question.question').findOne({
      where: {
        $or: [{ documentId: id }, { id: isNaN(Number(id)) ? 0 : Number(id) }],
      },
      populate: {
        quiz: {
          populate: {
            course: {
              populate: ['instructor'],
            },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Question not found');
    }

    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      if (existing.quiz?.course?.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only delete questions in your own courses');
      }
    }

    await strapi.documents('api::question.question').delete({
      documentId: existing.documentId,
    });

    return ctx.send({ ok: true });
  },
}));
