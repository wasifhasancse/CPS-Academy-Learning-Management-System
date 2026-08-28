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

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    const filters = {};
    // Only scope by instructor when explicitly querying own courses in instructor dashboard
    if (ctx.query?.myCourses === "true" && user && isInstructor(user) && !isAdminOrManager(user)) {
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

    // Ensure instructor username and curriculum modules are preserved across public and authenticated roles
    if (Array.isArray(sanitizedOutput)) {
      sanitizedOutput.forEach((c, idx) => {
        const rawCourse = courses[idx];
        const rawInstructor = rawCourse?.instructor;
        if (rawInstructor && (!c.instructor || !c.instructor.username)) {
          c.instructor = {
            id: rawInstructor.id,
            documentId: rawInstructor.documentId,
            username: rawInstructor.username || rawInstructor.name || rawInstructor.email?.split('@')[0] || 'CPS Instructor',
          };
        }
        if (rawCourse?.modules && (!c.modules || c.modules.length === 0)) {
          c.modules = rawCourse.modules;
        }
      });
    }

    return this.transformResponse(sanitizedOutput);
  },

  async findOne(ctx) {
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

    const sanitizedOutput = await this.sanitizeOutput(course, ctx);

    if (course.instructor && (!sanitizedOutput.instructor || !sanitizedOutput.instructor.username)) {
      sanitizedOutput.instructor = {
        id: course.instructor.id,
        documentId: course.instructor.documentId,
        username: course.instructor.username || course.instructor.name || course.instructor.email?.split('@')[0] || 'CPS Instructor',
      };
    }
    if (course.modules && (!sanitizedOutput.modules || sanitizedOutput.modules.length === 0)) {
      sanitizedOutput.modules = course.modules;
    }

    return this.transformResponse(sanitizedOutput);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { data } = ctx.request.body || {};
    const { title, slug, price, difficulty, description, category, thumbnailUrl } = data || {};

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
        thumbnailUrl: thumbnailUrl || null,
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

    if (newCourse.instructor && (!sanitizedOutput.instructor || !sanitizedOutput.instructor.username)) {
      sanitizedOutput.instructor = {
        id: newCourse.instructor.id,
        documentId: newCourse.instructor.documentId,
        username: newCourse.instructor.username || newCourse.instructor.name || newCourse.instructor.email?.split('@')[0] || user.username,
      };
    }

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
    const { title, price, difficulty, description, category, thumbnailUrl, instructor } = data || {};

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
        ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
        ...(category !== undefined ? { category: categoryRelation } : {}),
        ...(instructor !== undefined ? { instructor } : {}),
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

    if (updated.instructor && (!sanitizedOutput.instructor || !sanitizedOutput.instructor.username)) {
      sanitizedOutput.instructor = {
        id: updated.instructor.id,
        documentId: updated.instructor.documentId,
        username: updated.instructor.username || updated.instructor.name || updated.instructor.email?.split('@')[0] || 'CPS Instructor',
      };
    }

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
