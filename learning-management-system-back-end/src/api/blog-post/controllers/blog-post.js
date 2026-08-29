"use strict";

const { createCoreController } = require("@strapi/strapi").factories;
const utils = require("@strapi/utils");
const { ForbiddenError, NotFoundError, ValidationError } = utils.errors;

const resolveUser = async (ctx, strapi) => {
  if (ctx.state.user && ctx.state.user.role?.type) return ctx.state.user;
  const authHeader = ctx.request.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = await strapi
        .plugin("users-permissions")
        .service("jwt")
        .verify(token);
      if (decoded && decoded.id) {
        return await strapi.db.query("plugin::users-permissions.user").findOne({
          where: { id: decoded.id },
          populate: ["role"],
        });
      }
    } catch (e) {
      strapi.log.warn("[BlogPost Auth] Token verification error:", e.message);
    }
  }
  if (ctx.state.user?.id) {
    return await strapi.db.query("plugin::users-permissions.user").findOne({
      where: { id: ctx.state.user.id },
      populate: ["role"],
    });
  }
  return null;
};

const isAdmin = (user) => {
  if (!user) return false;
  const roleType = (user?.role?.type || "").toLowerCase();
  const roleName = (user?.role?.name || "").toLowerCase();
  return roleType === "admin" || roleName === "admin";
};

const isContentManager = (user) => {
  if (!user) return false;
  const roleType = (user?.role?.type || "").toLowerCase();
  const roleName = (user?.role?.name || "").toLowerCase();
  return roleType === "content_manager" || roleName === "content manager";
};

const isAdminOrManager = (user) => {
  return isAdmin(user) || isContentManager(user);
};

module.exports = createCoreController(
  "api::blog-post.blog-post",
  ({ strapi }) => ({
    async find(ctx) {
      const user = await resolveUser(ctx, strapi);
      const canSeeDrafts = isAdminOrManager(user);

      let posts = await strapi.documents("api::blog-post.blog-post").findMany({
        populate: ["author", "category"],
        sort: { createdAt: "desc" },
      });

      // Deduplicate by documentId / id and filter out empty / ghost items without titles
      const seenMap = new Map();
      (posts || []).forEach((p) => {
        if (!p || !p.title || !String(p.title).trim()) return;
        const key = p.documentId || String(p.id);
        if (!seenMap.has(key)) {
          seenMap.set(key, p);
        }
      });
      posts = Array.from(seenMap.values());

      // Zero-Trust filter guarantee: Non-managers (public / students) only receive published posts
      if (!canSeeDrafts) {
        posts = posts.filter((p) => p.status === "published");
      }

      const sanitizedOutput =
        /** @type {Record<string, unknown> | Array<Record<string, unknown>>} */ (
          await this.sanitizeOutput(posts, ctx)
        );

      // Explicitly preserve safe author and category fields after sanitization
      const sanitizedArray = Array.isArray(sanitizedOutput)
        ? sanitizedOutput
        : [sanitizedOutput];
      sanitizedArray.forEach((postItem, idx) => {
        const original = posts[idx];
        const item = /** @type {Record<string, unknown>} */ (postItem);
        if (item && typeof item === "object" && original) {
          if (original.author) {
            item.author = {
              id: original.author.id,
              username:
                original.author.username ||
                original.author.email?.split("@")[0] ||
                "CPS Editorial Team",
              name:
                original.author.username ||
                original.author.email?.split("@")[0] ||
                "CPS Editorial Team",
              email: original.author.email || "",
            };
          }
          if (original.category) {
            item.category = original.category;
          }
          item.status = original.status;
          item.publishedAt = original.publishedDate || null;
        }
      });

      return this.transformResponse(sanitizedOutput);
    },

    async findOne(ctx) {
      const user = await resolveUser(ctx, strapi);
      const canSeeDrafts = isAdminOrManager(user);
      const { id } = ctx.params;

      let post = await strapi.db.query("api::blog-post.blog-post").findOne({
        where: {
          $or: [
            { documentId: id },
            { slug: id },
            { id: isNaN(Number(id)) ? 0 : Number(id) },
            { title: id },
          ],
        },
        populate: ["author", "category"],
      });

      if (!post) {
        throw new NotFoundError("Blog post not found");
      }

      // Zero-Trust: If not Admin/Manager and post is a draft, do not reveal
      if (!canSeeDrafts && post.status !== "published") {
        throw new NotFoundError("Blog post not found");
      }

      const sanitizedOutput = /** @type {Record<string, unknown>} */ (
        await this.sanitizeOutput(post, ctx)
      );
      if (sanitizedOutput && typeof sanitizedOutput === "object") {
        if (post.author) {
          sanitizedOutput.author = {
            id: post.author.id,
            username:
              post.author.username ||
              post.author.email?.split("@")[0] ||
              "CPS Editorial Team",
            name:
              post.author.username ||
              post.author.email?.split("@")[0] ||
              "CPS Editorial Team",
            email: post.author.email || "",
          };
        }
        if (post.category) {
          sanitizedOutput.category = post.category;
        }
        sanitizedOutput.status = post.status;
        sanitizedOutput.publishedAt = post.publishedDate || null;
      }

      return this.transformResponse(sanitizedOutput);
    },

    async create(ctx) {
      const user = await resolveUser(ctx, strapi);
      if (!user) return ctx.unauthorized();

      if (!isAdminOrManager(user)) {
        throw new ForbiddenError(
          "Only Content Managers and Admins can create blog posts",
        );
      }

      const { data } = ctx.request.body || {};
      const {
        title,
        slug,
        excerpt,
        content,
        coverImageUrl,
        category,
        isPublished,
        status,
      } = data || {};

      if (!title || !content) {
        throw new ValidationError("Blog post title and content are required");
      }

      const resolvedSlug =
        slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      // Resolve category relation
      let categoryRelation = undefined;
      if (category) {
        const foundCategory = await strapi.db
          .query("api::category.category")
          .findOne({
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

      // By default, blog posts are saved as Draft; only publish when explicitly requested
      const finalStatus =
        status === "published" || isPublished === true ? "published" : "draft";
      const finalPublishedDate =
        finalStatus === "published" ? new Date().toISOString() : null;

      const newPost = await strapi
        .documents("api::blog-post.blog-post")
        .create({
          data: {
            title,
            slug: resolvedSlug,
            excerpt: excerpt || "",
            content,
            coverImageUrl: coverImageUrl || "",
            category: categoryRelation,
            author: user.id,
            status: /** @type {'draft' | 'published'} */ (finalStatus),
            publishedDate: finalPublishedDate || undefined,
          },
          populate: ["author", "category"],
        });

      const sanitizedOutput = /** @type {Record<string, unknown>} */ (
        await this.sanitizeOutput(newPost, ctx)
      );
      if (sanitizedOutput && typeof sanitizedOutput === "object") {
        sanitizedOutput.status = newPost.status;
        sanitizedOutput.publishedAt = newPost.publishedDate || null;
      }
      return this.transformResponse(sanitizedOutput);
    },

    async update(ctx) {
      const user = await resolveUser(ctx, strapi);
      if (!user) return ctx.unauthorized();

      if (!isAdminOrManager(user)) {
        throw new ForbiddenError(
          "Only Content Managers and Admins can edit blog posts",
        );
      }

      const { id } = ctx.params;
      const existing = await strapi.db
        .query("api::blog-post.blog-post")
        .findOne({
          where: {
            $or: [
              { documentId: id },
              { id: isNaN(Number(id)) ? 0 : Number(id) },
            ],
          },
          populate: ["author"],
        });

      if (!existing) {
        throw new NotFoundError("Blog post not found");
      }

      const { data } = ctx.request.body || {};
      const {
        title,
        excerpt,
        content,
        coverImageUrl,
        category,
        isPublished,
        status,
      } = data || {};

      let categoryRelation = undefined;
      if (category !== undefined) {
        if (!category) {
          categoryRelation = null;
        } else {
          const foundCategory = await strapi.db
            .query("api::category.category")
            .findOne({
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

      let nextStatus;
      if (status !== undefined) {
        nextStatus = status === "published" ? "published" : "draft";
      } else if (isPublished !== undefined) {
        nextStatus = isPublished ? "published" : "draft";
      }

      let nextPublishedDate;
      if (nextStatus !== undefined) {
        if (nextStatus === "published") {
          // Preserve original publish date when re-publishing, otherwise stamp now
          nextPublishedDate = existing.publishedDate
            ? new Date(existing.publishedDate).toISOString()
            : new Date().toISOString();
        } else {
          nextPublishedDate = null;
        }
      }

      const updated = await strapi
        .documents("api::blog-post.blog-post")
        .update({
          documentId: existing.documentId,
          data: {
            ...(title !== undefined ? { title } : {}),
            ...(excerpt !== undefined ? { excerpt } : {}),
            ...(content !== undefined ? { content } : {}),
            ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
            ...(categoryRelation !== undefined
              ? { category: categoryRelation }
              : {}),
            ...(nextStatus !== undefined
              ? { status: /** @type {'draft' | 'published'} */ (nextStatus) }
              : {}),
            ...(nextPublishedDate !== undefined
              ? {
                  publishedDate: nextPublishedDate || undefined,
                }
              : {}),
          },
          populate: ["author", "category"],
        });

      const sanitizedOutput = /** @type {Record<string, unknown>} */ (
        await this.sanitizeOutput(updated, ctx)
      );
      const updatedRecord = /** @type {Record<string, unknown>} */ (updated);
      if (
        sanitizedOutput &&
        typeof sanitizedOutput === "object" &&
        updatedRecord
      ) {
        sanitizedOutput.status = updatedRecord.status;
        sanitizedOutput.publishedAt = updatedRecord.publishedDate || null;
      }
      return this.transformResponse(sanitizedOutput);
    },

    async delete(ctx) {
      const user = await resolveUser(ctx, strapi);
      if (!user) return ctx.unauthorized();

      if (!isAdminOrManager(user)) {
        throw new ForbiddenError(
          "Only Content Managers and Admins can delete blog posts",
        );
      }

      const { id } = ctx.params;
      const existing = await strapi.db
        .query("api::blog-post.blog-post")
        .findOne({
          where: {
            $or: [
              { documentId: id },
              { id: isNaN(Number(id)) ? 0 : Number(id) },
            ],
          },
        });

      if (!existing) {
        throw new NotFoundError("Blog post not found");
      }

      await strapi.documents("api::blog-post.blog-post").delete({
        documentId: existing.documentId,
      });

      return ctx.send({ ok: true });
    },
  }),
);
