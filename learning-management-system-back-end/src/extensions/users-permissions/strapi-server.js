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

const isAdmin = (user) => {
  const roleType = (user?.role?.type || '').toLowerCase();
  const roleName = (user?.role?.name || '').toLowerCase();
  return roleType === 'admin' || roleName === 'admin';
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

  // 4. Custom User Find Controller (Admin Only)
  plugin.controllers.user.find = async (ctx) => {
    const authUser = ctx.state.user;
    if (!authUser) {
      return ctx.unauthorized();
    }
    const fullAuthUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: authUser.id },
      populate: ['role'],
    });
    if (!isAdmin(fullAuthUser)) {
      return ctx.forbidden('Only administrators can view platform users.');
    }

    const users = await strapi.db.query('plugin::users-permissions.user').findMany({
      populate: ['role'],
      orderBy: { createdAt: 'desc' },
    });

    const sanitizedUsers = await Promise.all(
      users.map(async (u) => {
        const sanitized = await sanitizeUser(u, ctx);
        return {
          ...sanitized,
          role: formatRole(u.role),
        };
      })
    );

    ctx.body = sanitizedUsers;
  };

  // 5. Custom User Update Controller (Admin Only for Role / Block mutation)
  plugin.controllers.user.update = async (ctx) => {
    const authUser = ctx.state.user;
    const targetUserId = ctx.params.id;

    if (!authUser) {
      return ctx.unauthorized();
    }

    const fullAuthUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: authUser.id },
      populate: ['role'],
    });

    const isUserAdmin = isAdmin(fullAuthUser);
    const isSelf = String(authUser.id) === String(targetUserId);

    if (!isUserAdmin && !isSelf) {
      return ctx.forbidden('Access denied.');
    }

    const body = ctx.request.body || {};
    const updateData = {};

    if (body.username) updateData.username = body.username.trim();
    if (body.email) updateData.email = body.email.toLowerCase().trim();

    // Only Admin can change role or blocked status
    if (isUserAdmin) {
      if (typeof body.blocked === 'boolean') {
        updateData.blocked = body.blocked;
      }

      if (body.role) {
        let roleId = body.role;
        if (typeof roleId === 'string' && isNaN(Number(roleId))) {
          const matchedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
            where: {
              $or: [
                { type: roleId.toLowerCase().trim() },
                { name: roleId.trim() },
              ],
            },
          });
          if (matchedRole) {
            roleId = matchedRole.id;
          }
        }
        updateData.role = Number(roleId) || roleId;
      }
    }

    const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: targetUserId },
      data: updateData,
      populate: ['role'],
    });

    if (!updatedUser) {
      return ctx.notFound('User not found.');
    }

    const sanitized = await sanitizeUser(updatedUser, ctx);
    ctx.body = {
      ...sanitized,
      role: formatRole(updatedUser.role),
    };
  };

  // 6. Custom User Destroy Controller (Admin Only)
  plugin.controllers.user.destroy = async (ctx) => {
    const authUser = ctx.state.user;
    const targetUserId = ctx.params.id;

    if (!authUser) {
      return ctx.unauthorized();
    }

    const fullAuthUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: authUser.id },
      populate: ['role'],
    });

    if (!isAdmin(fullAuthUser)) {
      return ctx.forbidden('Only administrators can delete user accounts.');
    }

    const deleted = await strapi.db.query('plugin::users-permissions.user').delete({
      where: { id: targetUserId },
    });

    if (!deleted) {
      return ctx.notFound('User not found.');
    }

    ctx.body = { message: 'User successfully deleted.' };
  };

  // 7. Custom Role Controller (Get all roles for Admin assignment)
  if (plugin.controllers.role) {
    plugin.controllers.role.find = async (ctx) => {
      const authUser = ctx.state.user;
      if (!authUser) {
        return ctx.unauthorized();
      }
      const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
        orderBy: { name: 'asc' },
      });
      ctx.body = { roles: roles.map(formatRole) };
    };
  }

  return plugin;
};
