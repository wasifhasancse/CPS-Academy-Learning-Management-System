'use strict';

/**
 * CPS Academy LMS Core Roles
 */
const ROLES_TO_SEED = [
  {
    name: 'Admin',
    type: 'admin',
    description: 'Full control of the platform. Manages all users and assigns/changes their roles.',
  },
  {
    name: 'Content Manager',
    type: 'content_manager',
    description: 'Creates and manages all courses, modules, lessons, quizzes, and blog posts.',
  },
  {
    name: 'Instructor',
    type: 'instructor',
    description: 'Manages lessons and quizzes for own assigned courses, and monitors student progress.',
  },
  {
    name: 'Student',
    type: 'student',
    description: 'Enrolls in courses, streams video lessons, takes quizzes, and tracks personal learning progress.',
  },
];

/**
 * Essential Permissions by Role Scope
 */
const AUTHENTICATED_ACTIONS = [
  'plugin::users-permissions.user.me',
  'plugin::users-permissions.auth.changePassword',
];

const PUBLIC_ACTIONS = [
  'plugin::users-permissions.auth.callback',
  'plugin::users-permissions.auth.connect',
  'plugin::users-permissions.auth.register',
  'plugin::users-permissions.auth.forgotPassword',
  'plugin::users-permissions.auth.resetPassword',
  'plugin::users-permissions.auth.emailConfirmation',
  'plugin::users-permissions.auth.sendEmailConfirmation',
];

module.exports = {
  register(/*{ strapi }*/) {},
  async bootstrap({ strapi }) {
    try {
      const roleService = strapi.service('plugin::users-permissions.role');
      if (!roleService) return;

      const existingRoles = await strapi.db.query('plugin::users-permissions.role').findMany();
      const existingNames = existingRoles.map((r) => r.name.toLowerCase().trim());
      const existingTypes = existingRoles.map((r) => (r.type || '').toLowerCase().trim());

      for (const roleDef of ROLES_TO_SEED) {
        const nameMatch = existingNames.includes(roleDef.name.toLowerCase().trim());
        const typeMatch = existingTypes.includes(roleDef.type.toLowerCase().trim());

        if (!nameMatch && !typeMatch) {
          strapi.log.info(`[Bootstrap] Creating CPS Academy role: "${roleDef.name}" (${roleDef.type})`);
          await strapi.db.query('plugin::users-permissions.role').create({
            data: {
              name: roleDef.name,
              type: roleDef.type,
              description: roleDef.description,
            },
          });
        }
      }

      const allRoles = await strapi.db.query('plugin::users-permissions.role').findMany();
      const studentRole = allRoles.find(
        (r) => r.type === 'student' || r.name.toLowerCase() === 'student'
      );

      const pluginStore = strapi.store({
        type: 'plugin',
        name: 'users-permissions',
      });
      const advancedSettings = (await pluginStore.get({ key: 'advanced' })) || {};

      const targetType = studentRole?.type || 'student';
      if (advancedSettings.default_role !== targetType) {
        advancedSettings.default_role = targetType;
        advancedSettings.allow_register = true;
        await pluginStore.set({ key: 'advanced', value: advancedSettings });
        strapi.log.info(`[Bootstrap] Set default_role to: "${targetType}"`);
      }

      for (const role of allRoles) {
        const isPublic = role.type === 'public' || role.name.toLowerCase() === 'public';
        const actionsToGrant = isPublic ? PUBLIC_ACTIONS : AUTHENTICATED_ACTIONS;

        for (const action of actionsToGrant) {
          const existingPerm = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: role.id },
          });

          if (!existingPerm) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: role.id },
            });
          }
        }
      }

      strapi.log.info('[Bootstrap] Essential Users & Permissions verified and active.');
    } catch (error) {
      strapi.log.error('[Bootstrap] Failed to seed roles & permissions:', error);
    }
  },
};
