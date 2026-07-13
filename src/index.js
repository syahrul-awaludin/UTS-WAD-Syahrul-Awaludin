const config = require('./config');
const express = require('express');

const routes = require('./routes');
const authRoutes = require('./routes/auth.routes');
const tasksRoutes = require('./routes/tasks.routes');
const projectsRoutes = require('./routes/projects.routes');
const adminRoutes = require('./routes/admin.routes');

const setupSwagger = require('./docs/swagger');
const authenticate = require('./middleware/authenticate');

const http = require('http');
const { initSocket } = require('./config/socket');

const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Swagger
setupSwagger(app);

// Public Routes
app.use('/', routes); // health & info
app.use('/api/v1/auth', authRoutes);

// Protected Routes
app.use('/api/v1/tasks', authenticate, tasksRoutes);
app.use('/api/v1/projects', authenticate, projectsRoutes);
app.use('/api/v1/admin', authenticate, adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} tidak ditemukan.`,
      hint: 'Kunjungi GET /api/docs untuk dokumentasi API.',
    },
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: { code: err.code || 'AUTH_ERROR', message: err.message },
    });
  }
  
  if (err.code === 'P2002') {
    const field = err.meta?.target || 'field';
    return res.status(409).json({
      error: { code: 'DUPLICATE_RESOURCE', message: `Nilai ${field} sudah digunakan.` }
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      error: { code: 'INVALID_REFERENCE', message: 'Referensi ID tidak ditemukan.' }
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: { 
      code: 'INTERNAL_ERROR', 
      message: config.env === 'development' ? err.message : 'Terjadi kesalahan di server.' 
    }
  });
});

server.listen(config.port, () => {
  console.log('='.repeat(50));
  console.log(`${config.appName} v${config.version}`);
  console.log(`Environment : ${config.env}`);
  console.log(`Server      : http://localhost:${config.port}`);
  console.log(`Docs        : http://localhost:${config.port}/api/docs`);
  console.log('='.repeat(50));
});

module.exports = { app, server };
