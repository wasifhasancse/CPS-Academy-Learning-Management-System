'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/progresses',
      handler: 'api::progress.progress.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/progresses/:id',
      handler: 'api::progress.progress.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/progresses',
      handler: 'api::progress.progress.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/progresses/:id',
      handler: 'api::progress.progress.update',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/progresses/:id',
      handler: 'api::progress.progress.delete',
      config: {
        auth: false,
      },
    },
  ],
};
