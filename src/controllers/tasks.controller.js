const taskService = require('../services/task.service');

const listTasks = async (req, res, next) => {
  try {
    const result = await taskService.listTasks(req.query, req.user);
    res.status(200).json(result);
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user);
    res.status(201).set('Location', `/api/v1/tasks/${task.id}`).json({ data: task });
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTask(req.params.id, req.user);
    res.status(200).json({ data: task });
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const replaceTask = async (req, res, next) => {
  try {
    const task = await taskService.replaceTask(req.params.id, req.body, req.user);
    res.status(200).json({ data: task });
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);
    res.status(200).json({ data: task });
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user);
    res.status(204).send();
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

module.exports = { listTasks, createTask, getTask, replaceTask, updateTask, deleteTask };
