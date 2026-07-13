const express = require('express');
const router = express.Router();
const userRepo = require('../repositories/user.repository');
const taskRepo = require('../repositories/task.repository');
const projectRepo = require('../repositories/project.repository');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Semua rute admin harus authenticated dan role ADMIN
router.use(authenticate, authorize('ADMIN'));

// GET /api/v1/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await userRepo.findAll();
    res.status(200).json({ data: users });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/tasks
router.get('/tasks', async (req, res, next) => {
  try {
    const { data } = await taskRepo.findMany({});
    res.status(200).json({ data });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/projects
router.get('/projects', async (req, res, next) => {
  try {
    const { data } = await projectRepo.findMany({});
    res.status(200).json({ data });
  } catch (err) { next(err); }
});

module.exports = router;
