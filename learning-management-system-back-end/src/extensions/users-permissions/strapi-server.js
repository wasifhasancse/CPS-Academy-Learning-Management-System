'use strict';

module.exports = (plugin) => {
  // Extend auth controller to handle safe role assignment on registration
  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx) => {
    const requestedRole = ctx.request.body?.role;

    // Allow user to self-select "Instructor", otherwise default to "Student"
    // Strictly prevent self-registration as Admin or Content Manager
    const allowedSelfSelect = ['instructor', 'student'];
    let targetRoleName = 'Student';

    if (requestedRole && typeof requestedRole === 'string') {
      const normalized = requestedRole.toLowerCase().trim();
      if (allowedSelfSelect.includes(normalized)) {
        targetRoleName = normalized === 'instructor' ? 'Instructor' : 'Student';
      }
    }

    const targetRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { name: targetRoleName },
    });

    if (targetRole) {
      ctx.request.body.role = targetRole.id;
    }

    // Execute standard registration
    await originalRegister(ctx);

    // Ensure role is populated in response if registration was successful
    if (ctx.body?.user && targetRole) {
      ctx.body.user.role = {
        id: targetRole.id,
        name: targetRole.name,
        type: targetRole.type,
      };
    }
  };

  return plugin;
};
