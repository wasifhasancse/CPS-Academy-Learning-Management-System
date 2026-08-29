module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:1337',
        ...(env('FRONTEND_URL') ? [env('FRONTEND_URL')] : []),
        ...(env('PUBLIC_URL') ? [env('PUBLIC_URL')] : []),
      ],
      headers: ['*'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      includeUnparsed: true,
    },
  },
  {
    name: 'strapi::session',
    config: {
      secure: false,
      sameSite: 'lax',
    },
  },
  'strapi::favicon',
  'strapi::public',
];
