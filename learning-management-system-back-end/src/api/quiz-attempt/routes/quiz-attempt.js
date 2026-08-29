'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/quiz-attempts',
      handler: 'api::quiz-attempt.quiz-attempt.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/quiz-attempts/:id',
      handler: 'api::quiz-attempt.quiz-attempt.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/quiz-attempts',
      handler: 'api::quiz-attempt.quiz-attempt.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/quiz-attempts/:id',
      handler: 'api::quiz-attempt.quiz-attempt.update',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/quiz-attempts/:id',
      handler: 'api::quiz-attempt.quiz-attempt.delete',
      config: {
        auth: false,
      },
    },
  ],
};
