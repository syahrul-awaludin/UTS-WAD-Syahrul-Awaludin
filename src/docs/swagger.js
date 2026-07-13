const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('../config');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: config.appName,
      version: config.version,
      description: 'REST API untuk capstone project Web Advanced Development. Termasuk model tambahan Project oleh Syahrul Awaludin.',
    },
    servers: [
      { url: `https://uas-wad.syahrulawaludin.my.id/api/v1`, description: 'Production VPS' },
      { url: `http://localhost:${config.port}/api/v1`, description: 'Local Dev' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: `${config.appName} - API Docs`,
  }));

  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Docs: http://localhost:${config.port}/api/docs`);
};

module.exports = setupSwagger;
