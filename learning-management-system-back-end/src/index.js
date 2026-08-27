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
      const allRoles = await strapi.db.query('plugin::users-permissions.role').findMany();
      for (const role of allRoles) {
        const isPublic = role.type === 'public' || role.name.toLowerCase() === 'public';
        const actionsToGrant = isPublic ? PUBLIC_ACTIONS : AUTHENTICATED_ACTIONS;

        for (const action of actionsToGrant) {
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: role.id },
          });
          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: role.id },
            });
          }
        }
      }
    } catch (err) {
      strapi.log.error('Bootstrap error:', err);
    }
  },
};
