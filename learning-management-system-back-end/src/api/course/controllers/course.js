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

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    const filters = {};
    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      filters.instructor = {
        id: user.id,
      };
    }

    const courses = await strapi.documents('api::course.course').findMany({
      filters,
      populate: {
        modules: {
          populate: ['lessons'],
        },
        quizzes: {
          populate: ['questions'],
        },
        enrollments: {
          populate: ['student'],
        },
        category: true,
        instructor: true,
      },
    });

    const sanitizedOutput = await this.sanitizeOutput(courses, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const course = await strapi.documents('api::course.course').findOne({
      documentId: id,
      populate: {
        modules: {
          populate: ['lessons'],
        },
        quizzes: {
          populate: ['questions'],
        },
        enrollments: {
          populate: ['student'],
        },
        category: true,
        instructor: true,
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      if (course.instructor?.id !== user.id && course.instructor?.documentId !== user.documentId) {
        throw new ForbiddenError('You can only access your own courses');
      }
    }

    const sanitizedOutput = await this.sanitizeOutput(course, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { data } = ctx.request.body || {};
    const { title, slug, price, difficulty, description, category } = data || {};

    if (!title) {
      throw new ValidationError('Course title is required');
    }

    const resolvedSlug =
      slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const instructorId =
      isInstructor(user) && !isAdminOrManager(user) ? user.id : data?.instructor || user.id;

    // Safe Category Resolution (resolves by documentId, numeric ID, name, or creates on-the-fly)
    let categoryRelation = undefined;
    if (category) {
      const foundCategory = await strapi.db.query('api::category.category').findOne({
        where: {
          $or: [
            { documentId: String(category) },
            { id: isNaN(Number(category)) ? 0 : Number(category) },
            { name: String(category) },
            { slug: String(category).toLowerCase() },
          ],
        },
      });

      if (foundCategory) {
        categoryRelation = foundCategory.id;
      } else {
        const catName = typeof category === 'string' && isNaN(Number(category)) ? category : 'Programming';
        const createdCat = await strapi.documents('api::category.category').create({
          data: {
            name: catName,
            slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            description: `${catName} Courses and Tracks`,
          },
        });
        categoryRelation = createdCat?.id;
      }
    }

    const newCourse = await strapi.documents('api::course.course').create({
      data: {
        title,
        slug: resolvedSlug,
        price: Number(price) || 0,
        difficulty: difficulty || 'Beginner',
        description,
        category: categoryRelation,
        instructor: instructorId,
        publishedAt: new Date(),
      },
      populate: {
        modules: {
          populate: ['lessons'],
        },
        quizzes: {
          populate: ['questions'],
        },
        enrollments: {
          populate: ['student'],
        },
        category: true,
        instructor: true,
      },
    });

    const sanitizedOutput = await this.sanitizeOutput(newCourse, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing = await strapi.db.query('api::course.course').findOne({
      where: {
        $or: [{ documentId: id }, { id: isNaN(Number(id)) ? 0 : Number(id) }],
      },
      populate: ['instructor'],
    });

    if (!existing) {
      throw new NotFoundError('Course not found');
    }

    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      if (existing.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only edit your own courses');
      }
    }

    const { data } = ctx.request.body || {};
    const { title, price, difficulty, description, category } = data || {};

    let categoryRelation = undefined;
    if (category !== undefined) {
      if (!category) {
        categoryRelation = null;
      } else {
        const foundCategory = await strapi.db.query('api::category.category').findOne({
          where: {
            $or: [
              { documentId: String(category) },
              { id: isNaN(Number(category)) ? 0 : Number(category) },
              { name: String(category) },
            ],
          },
        });
        categoryRelation = foundCategory ? foundCategory.id : null;
      }
    }

    const updated = await strapi.documents('api::course.course').update({
      documentId: existing.documentId,
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(price !== undefined ? { price: Number(price) || 0 } : {}),
        ...(difficulty !== undefined ? { difficulty } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category: categoryRelation } : {}),
      },
      populate: {
        modules: {
          populate: ['lessons'],
        },
        quizzes: {
          populate: ['questions'],
        },
        enrollments: {
          populate: ['student'],
        },
        category: true,
        instructor: true,
      },
    });

    const sanitizedOutput = await this.sanitizeOutput(updated, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing = await strapi.db.query('api::course.course').findOne({
      where: {
        $or: [{ documentId: id }, { id: isNaN(Number(id)) ? 0 : Number(id) }],
      },
      populate: ['instructor'],
    });

    if (!existing) {
      throw new NotFoundError('Course not found');
    }

    if (user && isInstructor(user) && !isAdminOrManager(user)) {
      if (existing.instructor?.id !== user.id) {
        throw new ForbiddenError('You can only delete your own courses');
      }
    }

    await strapi.documents('api::course.course').delete({
      documentId: existing.documentId,
    });

    return ctx.send({ ok: true });
  },
}));
