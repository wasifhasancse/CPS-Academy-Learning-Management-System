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

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
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

      // Ensure default role is set to Student if available
      const studentRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { name: 'Student' },
      });

      if (studentRole) {
        const pluginStore = strapi.store({
          type: 'plugin',
          name: 'users-permissions',
        });
        const advancedSettings = (await pluginStore.get({ key: 'advanced' })) || {};
        if (!advancedSettings.default_role || advancedSettings.default_role !== studentRole.id) {
          advancedSettings.default_role = studentRole.id;
          await pluginStore.set({ key: 'advanced', value: advancedSettings });
        }
      }
    } catch (error) {
      strapi.log.error('[Bootstrap] Failed to seed roles:', error);
    }
  },
};
