'use strict';

const utils = require('@strapi/utils');
const { ApplicationError, ValidationError } = utils.errors;

module.exports = (plugin) => {
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
    const sanitizedUser = await strapi.service('plugin::users-permissions.user').sanitizeUser(user);
    const jwt = strapi.service('plugin::users-permissions.jwt').issue({ id: user.id });

    ctx.send({
      jwt,
      user: {
        ...sanitizedUser,
        role: {
          id: targetRole.id,
          name: targetRole.name,
          type: targetRole.type,
        },
      },
    });
  };

  return plugin;
};
