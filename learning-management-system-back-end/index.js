'use strict';

const strapi = require('@strapi/strapi');

let instance;

/**
 * Serverless request handler for Vercel deployment.
 * Lazily boots the Strapi v5 application context and delegates incoming
 * HTTP requests to Strapi's underlying Koa server instance.
 */
async function getStrapiInstance() {
  if (!instance) {
    instance = await strapi.createStrapi({
      appDir: process.cwd(),
      distDir: process.cwd(),
    }).load();
    await instance.server.mount();
  }
  return instance;
}

module.exports = async (req, res) => {
  try {
    const app = await getStrapiInstance();
    return app.server.app.callback()(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[Strapi Vercel Serverless Error]:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Strapi initialization failed',
        message: errorMessage,
        ...(process.env.NODE_ENV !== 'production' ? { stack: errorStack } : {}),
      })
    );
  }
};

// If executed directly (e.g. node index.js) in standalone Node environments
if (require.main === module) {
  strapi.createStrapi({
    appDir: process.cwd(),
    distDir: process.cwd(),
  }).start();
}
