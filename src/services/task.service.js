const taskRepo = require('../repositories/task.repository');
const { getIo } = require('../config/socket');

class TaskError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const listTasks = async (query, user) => {
  const { status, priority, projectId, search, sort, order, limit, offset } = query;
  const userId = user.role === 'ADMIN' ? undefined : user.userId;
  
  const { data, total } = await taskRepo.findMany({ 
    userId, 
    status, 
    priority,
    projectId,
    search,
    sort, 
    order, 
    limit, 
    offset 
  });

  const numLimit = Number(limit) || 10;
  const numOffset = Number(offset) || 0;

  return {
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
  };
};

const createTask = async (body, user) => {
  const task = await taskRepo.create({ 
    ...body, 
    userId: user.userId 
  });

  try { 
    let emitObj = getIo().to(`user:${task.userId}`).to('global_admin');
    if (task.projectId) {
      emitObj = emitObj.to(`project:${task.projectId}`);
    }
    emitObj.emit('task:created', { task, senderId: user.userId });
  } catch (e) { console.error('Socket error:', e); }

  return task;
};

const getTask = async (id, user) => {
  const task = await taskRepo.findById(id);
  if (!task) {
    throw new TaskError(`Task ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }
  const hasAccess = user.role === 'ADMIN' || task.userId === user.userId || task.project?.ownerId === user.userId || task.project?.members?.some(m => m.id === user.userId);
  if (!hasAccess) {
    throw new TaskError(`Task ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }
  return task;
};

const replaceTask = async (id, body, user) => {
  const existing = await taskRepo.findById(id);
  if (!existing) {
    throw new TaskError(`Task ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }
  const hasAccess = user.role === 'ADMIN' || existing.userId === user.userId || existing.project?.ownerId === user.userId || existing.project?.members?.some(m => m.id === user.userId);
  if (!hasAccess) {
    throw new TaskError(`Task ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }

  const task = await taskRepo.update(id, body);

  try { 
    let emitObj = getIo().to(`user:${task.userId}`).to('global_admin');
    if (task.projectId) {
      emitObj = emitObj.to(`project:${task.projectId}`);
    }
    emitObj.emit('task:updated', { task, senderId: user.userId });
  } catch (e) { console.error('Socket error:', e); }

  return task;
};

const updateTask = async (id, body, user) => {
  const existing = await taskRepo.findById(id);
  if (!existing) {
    throw new TaskError(`Task ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }
  const hasAccess = user.role === 'ADMIN' || existing.userId === user.userId || existing.project?.ownerId === user.userId || existing.project?.members?.some(m => m.id === user.userId);
  if (!hasAccess) {
    throw new TaskError(`Task ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }

  const task = await taskRepo.update(id, body);

  try { 
    let emitObj = getIo().to(`user:${task.userId}`).to('global_admin');
    if (task.projectId) {
      emitObj = emitObj.to(`project:${task.projectId}`);
    }
    emitObj.emit('task:updated', { task, senderId: user.userId });
  } catch (e) { console.error('Socket error:', e); }

  return task;
};

const deleteTask = async (id, user) => {
  const existing = await taskRepo.findById(id);
  if (!existing) {
    throw new TaskError(`Task ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }
  const hasAccess = user.role === 'ADMIN' || existing.userId === user.userId || existing.project?.ownerId === user.userId || existing.project?.members?.some(m => m.id === user.userId);
  if (!hasAccess) {
    throw new TaskError(`Task ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }

  const ok = await taskRepo.remove(id);
  if (!ok) {
    throw new TaskError(`Task ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }

  try { 
    let emitObj = getIo().to(`user:${existing.userId}`).to('global_admin');
    if (existing.projectId) {
      emitObj = emitObj.to(`project:${existing.projectId}`);
    }
    emitObj.emit('task:deleted', { taskId: id, senderId: user.userId });
  } catch (e) { console.error('Socket error:', e); }

  return true;
};

module.exports = { listTasks, createTask, getTask, replaceTask, updateTask, deleteTask };
