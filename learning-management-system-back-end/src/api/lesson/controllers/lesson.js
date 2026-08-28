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

module.exports = createCoreController('api::lesson.lesson', ({ strapi }) => ({
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

    const lessons = await strapi.documents('api::lesson.lesson').findMany({
      filters,
      populate: ['course', 'module'],
    });

    const sanitizedOutput = await this.sanitizeOutput(lessons, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const lesson = await strapi.documents('api::lesson.lesson').findOne({
      documentId: id,
      populate: ['course', 'module'],
    });

    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    const sanitizedOutput = await this.sanitizeOutput(lesson, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { data } = ctx.request.body || {};
    const { title, slug, youtubeUrl, duration, content, order, isFreePreview, module: moduleId, course: courseId } = data || {};

    if (!title || !youtubeUrl) {
      throw new ValidationError('Lesson title and video URL are required');
    }

    if (!courseId) {
      throw new ValidationError('A parent course is required for this lesson');
    }

    const course = await strapi.db.query('api::course.course').findOne({
      where: {
        $or: [{ documentId: String(courseId) }, { id: isNaN(Number(courseId)) ? 0 : Number(courseId) }],
      },
      populate: ['instructor', 'modules'],
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (isInstructor(user) && !isAdminOrManager(user)) {
      if (course.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only add lessons to your own courses');
      }
    }

    // Resolve or auto-create module for the course
    let targetModuleRelation = undefined;
    if (moduleId) {
      const existingMod = await strapi.db.query('api::module.module').findOne({
        where: {
          $or: [{ documentId: String(moduleId) }, { id: isNaN(Number(moduleId)) ? 0 : Number(moduleId) }],
        },
      });
      if (existingMod) targetModuleRelation = existingMod.id;
    }

    if (!targetModuleRelation) {
      if (course.modules && course.modules.length > 0) {
        targetModuleRelation = course.modules[0].id;
      } else {
        const createdMod = await strapi.documents('api::module.module').create({
          data: {
            title: 'Module 1: Course Curriculum',
            order: 1,
            course: course.id,
          },
        });
        targetModuleRelation = createdMod?.id;
      }
    }

    const resolvedSlug =
      slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const newLesson = await strapi.documents('api::lesson.lesson').create({
      data: {
        title,
        slug: resolvedSlug,
        youtubeUrl,
        duration: duration || '10:00',
        content,
        order: Number(order) || 1,
        isFreePreview: Boolean(isFreePreview),
        module: targetModuleRelation,
        course: course.id,
      },
      populate: ['course', 'module'],
    });

    const sanitizedOutput = await this.sanitizeOutput(newLesson, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing = await strapi.db.query('api::lesson.lesson').findOne({
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
      throw new NotFoundError('Lesson not found');
    }

    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      if (existing.course?.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only edit lessons belonging to your own courses');
      }
    }

    const { data } = ctx.request.body || {};
    const { title, youtubeUrl, duration, content, order, isFreePreview } = data || {};

    const updated = await strapi.documents('api::lesson.lesson').update({
      documentId: existing.documentId,
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(youtubeUrl !== undefined ? { youtubeUrl } : {}),
        ...(duration !== undefined ? { duration } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        ...(isFreePreview !== undefined ? { isFreePreview: Boolean(isFreePreview) } : {}),
      },
      populate: ['course', 'module'],
    });

    const sanitizedOutput = await this.sanitizeOutput(updated, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing = await strapi.db.query('api::lesson.lesson').findOne({
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
      throw new NotFoundError('Lesson not found');
    }

    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      if (existing.course?.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only delete lessons from your own courses');
      }
    }

    await strapi.documents('api::lesson.lesson').delete({
      documentId: existing.documentId,
    });

    return ctx.send({ ok: true });
  },
}));
