'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const utils = require('@strapi/utils');
const { ForbiddenError, NotFoundError, ValidationError } = utils.errors;

const isAdminOrManager = (user) => {
  if (!user) return false;
  const roleType = (user?.role?.type || '').toLowerCase();
  const roleName = (user?.role?.name || '').toLowerCase();
  return (
    roleType === 'admin' ||
    roleName === 'admin' ||
    roleType === 'content_manager' ||
    roleName === 'content manager'
  );
};

module.exports = createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const isManagerOrAdmin = isAdminOrManager(user);

    const filters = {};
    // Public, Students, and Instructors only see published blog posts
    if (!isManagerOrAdmin) {
      filters.publishedAt = {
        $notNull: true,
      };
    }

    const posts = await strapi.documents('api::blog-post.blog-post').findMany({
      filters,
      populate: ['author', 'category'],
      sort: { createdAt: 'desc' },
    });

    const sanitizedOutput = await this.sanitizeOutput(posts, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const isManagerOrAdmin = isAdminOrManager(user);
    const { id } = ctx.params;

    const post = await strapi.db.query('api::blog-post.blog-post').findOne({
      where: {
        $or: [
          { documentId: id },
          { slug: id },
          { id: isNaN(Number(id)) ? 0 : Number(id) },
        ],
      },
      populate: ['author', 'category'],
    });

    if (!post) {
      throw new NotFoundError('Blog post not found');
    }

    // Public and students cannot view draft blog posts
    if (!isManagerOrAdmin && !post.publishedAt) {
      throw new NotFoundError('Blog post not found');
    }

    const sanitizedOutput = await this.sanitizeOutput(post, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (!isAdminOrManager(user)) {
      throw new ForbiddenError('Only Content Managers and Admins can create blog posts');
    }

    const { data } = ctx.request.body || {};
    const { title, slug, excerpt, content, coverImageUrl, category, isPublished } = data || {};

    if (!title || !content) {
      throw new ValidationError('Blog post title and content are required');
    }

    const resolvedSlug =
      slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Resolve category relation
    let categoryRelation = undefined;
    if (category) {
      const foundCategory = await strapi.db.query('api::category.category').findOne({
        where: {
          $or: [
            { documentId: String(category) },
            { id: isNaN(Number(category)) ? 0 : Number(category) },
            { name: String(category) },
          ],
        },
      });
      if (foundCategory) categoryRelation = foundCategory.id;
    }

    const newPost = await strapi.documents('api::blog-post.blog-post').create({
      data: {
        title,
        slug: resolvedSlug,
        excerpt: excerpt || '',
        content,
        coverImageUrl: coverImageUrl || '',
        category: categoryRelation,
        author: user.id,
        publishedAt: isPublished !== false ? new Date() : null,
      },
      populate: ['author', 'category'],
    });

    const sanitizedOutput = await this.sanitizeOutput(newPost, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (!isAdminOrManager(user)) {
      throw new ForbiddenError('Only Content Managers and Admins can edit blog posts');
    }

    const { id } = ctx.params;
    const existing = await strapi.db.query('api::blog-post.blog-post').findOne({
      where: {
        $or: [{ documentId: id }, { id: isNaN(Number(id)) ? 0 : Number(id) }],
      },
      populate: ['author'],
    });

    if (!existing) {
      throw new NotFoundError('Blog post not found');
    }

    const { data } = ctx.request.body || {};
    const { title, excerpt, content, coverImageUrl, category, isPublished } = data || {};

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

    let publishedAtVal = undefined;
    if (isPublished !== undefined) {
      publishedAtVal = isPublished ? new Date() : null;
    }

    const updated = await strapi.documents('api::blog-post.blog-post').update({
      documentId: existing.documentId,
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
        ...(categoryRelation !== undefined ? { category: categoryRelation } : {}),
        ...(publishedAtVal !== undefined ? { publishedAt: publishedAtVal } : {}),
      },
      populate: ['author', 'category'],
    });

    const sanitizedOutput = await this.sanitizeOutput(updated, ctx);
    return this.transformResponse(sanitizedOutput);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (!isAdminOrManager(user)) {
      throw new ForbiddenError('Only Content Managers and Admins can delete blog posts');
    }

    const { id } = ctx.params;
    const existing = await strapi.db.query('api::blog-post.blog-post').findOne({
      where: {
        $or: [{ documentId: id }, { id: isNaN(Number(id)) ? 0 : Number(id) }],
      },
    });

    if (!existing) {
      throw new NotFoundError('Blog post not found');
    }

    await strapi.documents('api::blog-post.blog-post').delete({
      documentId: existing.documentId,
    });

    return ctx.send({ ok: true });
  },
}));
