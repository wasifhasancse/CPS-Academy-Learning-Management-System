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
 * CPS Academy Default Course Categories
 */
const DEFAULT_CATEGORIES = [
  {
    name: 'Competitive Programming',
    slug: 'competitive-programming',
    description: 'Algorithms, Data Structures, and Online Contest Tracks',
  },
  {
    name: 'Software Engineering',
    slug: 'software-engineering',
    description: 'Full-Stack Architecture, Backend Engineering, and Clean Code',
  },
  {
    name: 'Data Structures & Algorithms',
    slug: 'dsa',
    description: 'Core Computer Science Foundations and Problem Solving',
  },
  {
    name: 'System Design & Architecture',
    slug: 'system-design',
    description: 'Scalable Systems, Microservices, and Distributed Systems',
  },
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Modern Next.js, React, Node.js, and Full-Stack Engineering',
  },
];

/**
 * Essential Permissions by Role Scope
 */
const PUBLIC_ACTIONS = [
  'plugin::users-permissions.auth.callback',
  'plugin::users-permissions.auth.connect',
  'plugin::users-permissions.auth.register',
  'plugin::users-permissions.auth.forgotPassword',
  'plugin::users-permissions.auth.resetPassword',
  'plugin::users-permissions.auth.emailConfirmation',
  'plugin::users-permissions.auth.sendEmailConfirmation',
  'plugin::users-permissions.providers.getProviders',
  'api::course.course.find',
  'api::course.course.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::lesson.lesson.find',
  'api::lesson.lesson.findOne',
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
];

const STUDENT_ACTIONS = [
  'plugin::users-permissions.user.me',
  'plugin::users-permissions.auth.changePassword',
  'api::course.course.find',
  'api::course.course.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::lesson.lesson.find',
  'api::lesson.lesson.findOne',
  'api::quiz.quiz.find',
  'api::quiz.quiz.findOne',
  'api::enrollment.enrollment.find',
  'api::enrollment.enrollment.findOne',
  'api::progress.progress.find',
  'api::progress.progress.findOne',
  'api::progress.progress.create',
  'api::progress.progress.update',
  'api::quiz-attempt.quiz-attempt.find',
  'api::quiz-attempt.quiz-attempt.findOne',
  'api::quiz-attempt.quiz-attempt.create',
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
];

const INSTRUCTOR_ACTIONS = [
  'plugin::users-permissions.user.me',
  'plugin::users-permissions.auth.changePassword',
  // Course Management
  'api::course.course.find',
  'api::course.course.findOne',
  'api::course.course.create',
  'api::course.course.update',
  'api::course.course.delete',
  // Module Management
  'api::module.module.find',
  'api::module.module.findOne',
  'api::module.module.create',
  'api::module.module.update',
  'api::module.module.delete',
  // Lesson Management
  'api::lesson.lesson.find',
  'api::lesson.lesson.findOne',
  'api::lesson.lesson.create',
  'api::lesson.lesson.update',
  'api::lesson.lesson.delete',
  // Quiz Management
  'api::quiz.quiz.find',
  'api::quiz.quiz.findOne',
  'api::quiz.quiz.create',
  'api::quiz.quiz.update',
  'api::quiz.quiz.delete',
  // Question Management
  'api::question.question.find',
  'api::question.question.findOne',
  'api::question.question.create',
  'api::question.question.update',
  'api::question.question.delete',
  // Student Progress & Enrollment Insights
  'api::enrollment.enrollment.find',
  'api::enrollment.enrollment.findOne',
  'api::progress.progress.find',
  'api::progress.progress.findOne',
  'api::quiz-attempt.quiz-attempt.find',
  'api::quiz-attempt.quiz-attempt.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
];

const CONTENT_MANAGER_ACTIONS = [
  ...INSTRUCTOR_ACTIONS,
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
  'api::blog-post.blog-post.create',
  'api::blog-post.blog-post.update',
  'api::blog-post.blog-post.delete',
  'api::category.category.create',
  'api::category.category.update',
  'api::category.category.delete',
];

const ADMIN_ACTIONS = [
  ...CONTENT_MANAGER_ACTIONS,
  'plugin::users-permissions.user.find',
  'plugin::users-permissions.user.findOne',
  'plugin::users-permissions.user.create',
  'plugin::users-permissions.user.update',
  'plugin::users-permissions.user.destroy',
  'plugin::users-permissions.role.find',
  'plugin::users-permissions.role.findOne',
  'plugin::users-permissions.role.create',
  'plugin::users-permissions.role.update',
  'plugin::users-permissions.role.deleteRole',
];

module.exports = {
  register(/*{ strapi }*/) {},
  async bootstrap({ strapi }) {
    try {
      const roleService = strapi.service('plugin::users-permissions.role');
      if (!roleService) return;

      // 1. Seed custom LMS roles
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

      // 2. Seed Default Course Categories if none exist
      const existingCategories = await strapi.db.query('api::category.category').findMany();
      if (existingCategories.length === 0) {
        strapi.log.info('[Bootstrap] Seeding default course categories...');
        for (const cat of DEFAULT_CATEGORIES) {
          await strapi.documents('api::category.category').create({
            data: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
            },
          });
        }
      }

      // 3. Fetch updated roles list
      const allRoles = await strapi.db.query('plugin::users-permissions.role').findMany();
      const studentRole = allRoles.find(
        (r) => r.type === 'student' || r.name.toLowerCase() === 'student'
      );

      const pluginStore = strapi.store({
        type: 'plugin',
        name: 'users-permissions',
      });

      // 4. Configure Advanced Registration & Default Role settings
      const advancedSettings = (await pluginStore.get({ key: 'advanced' })) || {};
      const targetType = studentRole?.type || 'student';

      if (advancedSettings.default_role !== targetType || !advancedSettings.allow_register) {
        advancedSettings.default_role = targetType;
        advancedSettings.allow_register = true;
        advancedSettings.email_confirmation = false;
        await pluginStore.set({ key: 'advanced', value: advancedSettings });
        strapi.log.info(`[Bootstrap] Set default_role to: "${targetType}", registration enabled.`);
      }

      // 5. Configure & Enable Providers strictly via environment variables
      const grantConfig = (await pluginStore.get({ key: 'grant' })) || {};
      const serverUrl =
        process.env.PUBLIC_URL ||
        `http://${process.env.HOST === '0.0.0.0' ? 'localhost' : process.env.HOST || 'localhost'}:${process.env.PORT || 1337}`;

      const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

      let grantModified = false;
      if (googleClientId && googleClientSecret) {
        if (
          !grantConfig.google?.enabled ||
          grantConfig.google.key !== googleClientId ||
          grantConfig.google.secret !== googleClientSecret
        ) {
          grantConfig.google = {
            enabled: true,
            icon: 'google',
            key: googleClientId,
            secret: googleClientSecret,
            callback: `${serverUrl}/api/auth/google/callback`,
            scope: ['email', 'profile'],
          };
          grantModified = true;
        }
      }

      if (!grantConfig.email?.enabled) {
        grantConfig.email = {
          enabled: true,
          icon: 'envelope',
        };
        grantModified = true;
      }

      if (grantModified) {
        await pluginStore.set({ key: 'grant', value: grantConfig });
        strapi.log.info('[Bootstrap] Users-Permissions providers updated from environment.');
      }

      // 6. Fast In-Memory Bulk Permission Verification
      const existingPermissions = await strapi.db
        .query('plugin::users-permissions.permission')
        .findMany({ populate: ['role'] });

      const existingPermKeys = new Set(
        existingPermissions.map((p) => `${p.action}::${p.role?.id || p.role}`)
      );

      const permissionsToCreate = [];

      for (const role of allRoles) {
        const normalizedType = (role.type || '').toLowerCase();
        const normalizedName = (role.name || '').toLowerCase();

        let actionsToGrant = STUDENT_ACTIONS;
        if (normalizedType === 'public' || normalizedName === 'public') {
          actionsToGrant = PUBLIC_ACTIONS;
        } else if (normalizedType === 'admin' || normalizedName === 'admin') {
          actionsToGrant = ADMIN_ACTIONS;
        } else if (normalizedType === 'content_manager' || normalizedName === 'content manager') {
          actionsToGrant = CONTENT_MANAGER_ACTIONS;
        } else if (normalizedType === 'instructor' || normalizedName === 'instructor') {
          actionsToGrant = INSTRUCTOR_ACTIONS;
        } else if (normalizedType === 'student' || normalizedName === 'student') {
          actionsToGrant = STUDENT_ACTIONS;
        } else if (normalizedType === 'authenticated' || normalizedName === 'authenticated') {
          actionsToGrant = STUDENT_ACTIONS;
        }

        for (const action of actionsToGrant) {
          const key = `${action}::${role.id}`;
          if (!existingPermKeys.has(key)) {
            permissionsToCreate.push({ action, role: role.id });
          }
        }
      }

      if (permissionsToCreate.length > 0) {
        strapi.log.info(
          `[Bootstrap] Seeding ${permissionsToCreate.length} missing permissions...`
        );
        for (const perm of permissionsToCreate) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: perm,
          });
        }
      }

      strapi.log.info('[Bootstrap] Essential Users & Permissions verified.');
    } catch (error) {
      strapi.log.error('[Bootstrap] Failed to bootstrap roles & permissions:', error);
    }
  },
};
