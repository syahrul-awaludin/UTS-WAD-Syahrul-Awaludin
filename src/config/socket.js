const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./index');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Can be restricted to frontend URL in production
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
  });

  // JWT Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      socket.user = decoded; // { id, role, ... }
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] connected: ${socket.id} (User ID: ${socket.user.userId})`);
    
    // Join a user-specific room
    socket.join(`user:${socket.user.userId}`);
    if (socket.user.role === 'ADMIN') {
      socket.join('global_admin');
    }

    // Emit updated user count to everyone
    io.emit('users:online', { count: io.engine.clientsCount });

    // Project Rooms logic
    socket.on('project:join', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`[Socket] User ${socket.user.id} joined project:${projectId}`);
    });

    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`[Socket] User ${socket.user.id} left project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] disconnected: ${socket.id}`);
      // Emit updated user count to everyone
      io.emit('users:online', { count: io.engine.clientsCount });
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIo };
