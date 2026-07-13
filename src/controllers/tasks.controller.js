const taskRepo = require('../repositories/task.repository');
const { getIo } = require('../config/socket');

const listTasks = async (req, res, next) => {
  try {
    const { status, priority, projectId, sort, order, limit, offset } = req.query;
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.userId;
    const { data, total } = await taskRepo.findMany({ 
      userId, // Filter berdasarkan user yang login, kecuali Admin
      status, 
      priority,
      projectId,
      sort, 
      order, 
      limit, 
      offset 
    });

    const numLimit = Number(limit) || 10;
    const numOffset = Number(offset) || 0;

    res.status(200).json({
      data,
      pagination: {
        total,
        limit: numLimit,
        offset: numOffset,
        hasNext: numOffset + numLimit < total,
        hasPrev: numOffset > 0,
        nextOffset: numOffset + numLimit < total ? numOffset + numLimit : null,
        prevOffset: numOffset > 0 ? Math.max(0, numOffset - numLimit) : null,
      },
    });
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const task = await taskRepo.create({ 
      ...req.body, 
      userId: req.user.userId 
    });

    try { 
      let emitObj = getIo().to(`user:${task.userId}`).to('global_admin');
      if (task.projectId) {
        emitObj = emitObj.to(`project:${task.projectId}`);
      }
      emitObj.emit('task:created', { task });
    } catch (e) { console.error('Socket error:', e); }

    res.status(201).set('Location', `/api/v1/tasks/${task.id}`).json({ data: task });
  } catch (err) { next(err); }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskRepo.findById(req.params.id);
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    const hasAccess = req.user.role === 'ADMIN' || task.userId === req.user.userId || task.project?.ownerId === req.user.userId || task.project?.members?.some(m => m.id === req.user.userId);
    if (!hasAccess) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    }
    res.status(200).json({ data: task });
  } catch (err) { next(err); }
};

const replaceTask = async (req, res, next) => {
  try {
    const existing = await taskRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    const hasAccess = req.user.role === 'ADMIN' || existing.userId === req.user.userId || existing.project?.ownerId === req.user.userId || existing.project?.members?.some(m => m.id === req.user.userId);
    if (!hasAccess) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    }

    const task = await taskRepo.update(req.params.id, req.body);

    try { 
      let emitObj = getIo().to(`user:${task.userId}`).to('global_admin');
      if (task.projectId) {
        emitObj = emitObj.to(`project:${task.projectId}`);
      }
      emitObj.emit('task:updated', { task });
    } catch (e) { console.error('Socket error:', e); }

    res.status(200).json({ data: task });
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const existing = await taskRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    const hasAccess = req.user.role === 'ADMIN' || existing.userId === req.user.userId || existing.project?.ownerId === req.user.userId || existing.project?.members?.some(m => m.id === req.user.userId);
    if (!hasAccess) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    }

    const task = await taskRepo.update(req.params.id, req.body);

    try { 
      let emitObj = getIo().to(`user:${task.userId}`).to('global_admin');
      if (task.projectId) {
        emitObj = emitObj.to(`project:${task.projectId}`);
      }
      emitObj.emit('task:updated', { task });
    } catch (e) { console.error('Socket error:', e); }

    res.status(200).json({ data: task });
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const existing = await taskRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    const hasAccess = req.user.role === 'ADMIN' || existing.userId === req.user.userId || existing.project?.ownerId === req.user.userId || existing.project?.members?.some(m => m.id === req.user.userId);
    if (!hasAccess) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    }

    const ok = await taskRepo.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    }

    try { 
      let emitObj = getIo().to(`user:${existing.userId}`).to('global_admin');
      if (existing.projectId) {
        emitObj = emitObj.to(`project:${existing.projectId}`);
      }
      emitObj.emit('task:deleted', { taskId: req.params.id });
    } catch (e) { console.error('Socket error:', e); }

    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { listTasks, createTask, getTask, replaceTask, updateTask, deleteTask };
