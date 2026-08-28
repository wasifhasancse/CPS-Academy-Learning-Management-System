'use strict';

const utils = require('@strapi/utils');
const { ApplicationError, ValidationError } = utils.errors;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');
  return strapi.contentAPI.sanitize.output(user, userSchema, { auth });
};

const formatRole = (role) => {
  if (!role) return null;
  return {
    id: role.id,
    name: role.name,
    description: role.description || null,
    type: role.type,
    createdAt: role.createdAt ? new Date(role.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: role.updatedAt ? new Date(role.updatedAt).toISOString() : new Date().toISOString(),
  };
};

module.exports = (plugin) => {
  // 1. Custom Register Controller
  plugin.controllers.auth.register = async (ctx) => {
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
    const settings = await pluginStore.get({ key: 'advanced' });

    if (!settings.allow_register) {
      throw new ApplicationError('Register action is currently disabled');
    }

    const { username, email, password, role: requestedRole } = ctx.request.body;

    if (!username || !email || !password) {
      throw new ValidationError('Please provide username, email and password');
    }

    let targetRoleType = 'student';
    if (requestedRole && typeof requestedRole === 'string') {
      const normalized = requestedRole.toLowerCase().trim();
      if (normalized === 'instructor') {
        targetRoleType = 'instructor';
      }
    }

    let targetRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: targetRoleType },
    });

    if (!targetRole) {
      targetRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { name: targetRoleType === 'instructor' ? 'Instructor' : 'Student' },
      });
    }

    if (!targetRole) {
      targetRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });
    }

    if (!targetRole) {
      throw new ApplicationError('Impossible to find the default role');
    }

    const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: {
        $or: [{ email: email.toLowerCase() }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        throw new ApplicationError('Email is already taken');
      }
      throw new ApplicationError('Username is already taken');
    }

    const isConfirmed = !settings.email_confirmation;

    const newUser = {
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      provider: 'local',
      confirmed: isConfirmed,
      blocked: false,
      role: targetRole.id,
    };

    const user = await strapi.service('plugin::users-permissions.user').add(newUser);
    const sanitizedUser = await sanitizeUser(user, ctx);
    const jwt = strapi.service('plugin::users-permissions.jwt').issue({ id: user.id });

    ctx.send({
      jwt,
      user: {
        ...sanitizedUser,
        role: formatRole(targetRole),
      },
    });
  };

  // 2. Custom Auth Callback (Local Login & Google OAuth)
  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || 'local';

    if (provider === 'local') {
      const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
      const grantSettings = await store.get({ key: 'grant' });

      if (!grantSettings?.email?.enabled) {
        throw new ApplicationError('This provider is disabled');
      }

      const params = ctx.request.body;
      const { identifier, password } = params || {};

      if (!identifier || !password) {
        throw new ValidationError('Please provide your email/username and password');
      }

      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          provider: 'local',
          $or: [{ email: identifier.toLowerCase().trim() }, { username: identifier.trim() }],
        },
        populate: ['role'],
      });

      if (!user || !user.password) {
        throw new ValidationError('Invalid identifier or password');
      }

      const validPassword = await strapi.service('plugin::users-permissions.user').validatePassword(
        password,
        user.password
      );

      if (!validPassword) {
        throw new ValidationError('Invalid identifier or password');
      }

      const advancedSettings = await store.get({ key: 'advanced' });
      if (advancedSettings?.email_confirmation && user.confirmed !== true) {
        throw new ApplicationError('Your account email is not confirmed');
      }

      if (user.blocked === true) {
        throw new ApplicationError('Your account has been blocked by an administrator');
      }

      const jwt = strapi.service('plugin::users-permissions.jwt').issue({ id: user.id });
      const sanitizedUser = await sanitizeUser(user, ctx);

      return ctx.send({
        jwt,
        user: {
          ...sanitizedUser,
          role: formatRole(user.role),
        },
      });
    }

    // Third-party OAuth Provider flow (e.g. Google)
    const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const grantSettings = await store.get({ key: 'grant' });
    const grantProvider = provider === 'local' ? 'email' : provider;

    if (!grantSettings?.[grantProvider]?.enabled) {
      throw new ApplicationError('This provider is disabled');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const isBrowserRequest =
      ctx.request.headers.accept?.includes('text/html') ||
      ctx.headers['sec-fetch-dest'] === 'document';

    try {
      const user = await strapi.service('plugin::users-permissions.providers').connect(provider, ctx.query);

      if (user.blocked) {
        throw new ApplicationError('Your account has been blocked by an administrator');
      }

      const jwt = strapi.service('plugin::users-permissions.jwt').issue({ id: user.id });

      if (isBrowserRequest) {
        return ctx.redirect(`${frontendUrl}/auth/callback/google?jwt=${jwt}`);
      }

      const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: user.id },
        populate: ['role'],
      });

      const sanitizedUser = await sanitizeUser(fullUser || user, ctx);

      return ctx.send({
        jwt,
        user: {
          ...sanitizedUser,
          role: formatRole(fullUser?.role),
        },
      });
    } catch (error) {
      if (isBrowserRequest) {
        return ctx.redirect(
          `${frontendUrl}/auth/callback/google?error=${encodeURIComponent(error.message || 'Authentication failed')}`
        );
      }
      throw new ApplicationError(error.message);
    }
  };

  // 3. Custom User Me Controller
  plugin.controllers.user.me = async (ctx) => {
    const authUser = ctx.state.user;
    if (!authUser) {
      return ctx.unauthorized();
    }

    const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: authUser.id },
      populate: ['role'],
    });

    if (!userWithRole) {
      return ctx.notFound();
    }

    const sanitizedUser = await sanitizeUser(userWithRole, ctx);

    ctx.body = {
      ...sanitizedUser,
      role: formatRole(userWithRole.role),
    };
  };

  return plugin;
};
