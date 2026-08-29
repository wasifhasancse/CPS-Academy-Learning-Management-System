'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orders/create-checkout-session',
      handler: 'api::order.order.createCheckoutSession',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/orders/webhook',
      handler: 'api::order.order.webhook',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/orders/verify-session',
      handler: 'api::order.order.verifySession',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/orders/my-orders',
      handler: 'api::order.order.myOrders',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/orders/config',
      handler: 'api::order.order.getConfig',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/orders',
      handler: 'api::order.order.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/orders/:id',
      handler: 'api::order.order.findOne',
    },
    {
      method: 'POST',
      path: '/orders',
      handler: 'api::order.order.create',
    },
    {
      method: 'PUT',
      path: '/orders/:id',
      handler: 'api::order.order.update',
    },
    {
      method: 'DELETE',
      path: '/orders/:id',
      handler: 'api::order.order.delete',
    },
  ],
};
