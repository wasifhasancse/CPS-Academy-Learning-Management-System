'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/enrollments',
      handler: 'api::enrollment.enrollment.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/enrollments/:id',
      handler: 'api::enrollment.enrollment.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/enrollments',
      handler: 'api::enrollment.enrollment.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/enrollments/:id',
      handler: 'api::enrollment.enrollment.update',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/enrollments/:id',
      handler: 'api::enrollment.enrollment.delete',
      config: {
        auth: false,
      },
    },
  ],
};
