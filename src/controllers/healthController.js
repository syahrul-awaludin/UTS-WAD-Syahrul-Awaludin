const config = require('../config');

const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} detik`,
  });
};

const getInfo = (req, res) => {
  res.status(200).json({
    name: config.appName,
    version: config.version,
    environment: config.env,
    node: process.version,
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'GET', path: '/api/info', description: 'API information' },
      { method: 'GET', path: '/api/v1/tasks', description: 'Tasks CRUD' },
      { method: 'GET', path: '/api/v1/projects', description: 'Projects CRUD' },
    ],
  });
};

module.exports = { getHealth, getInfo };
