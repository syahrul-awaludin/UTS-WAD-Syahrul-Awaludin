const projectService = require('../services/project.service');

const listProjects = async (req, res, next) => {
  try {
    const result = await projectService.listProjects(req.query, req.user);
    res.status(200).json(result);
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user);
    res.status(201).set('Location', `/api/v1/projects/${project.id}`).json({ data: project });
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProject(req.params.id, req.user);
    res.status(200).json({ data: project });
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const replaceProject = async (req, res, next) => {
  try {
    const project = await projectService.replaceProject(req.params.id, req.body, req.user);
    res.status(200).json({ data: project });
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user);
    res.status(200).json({ data: project });
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user);
    res.status(204).send();
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

const addMember = async (req, res, next) => {
  try {
    await projectService.addMember(req.params.id, req.body.email, req.user);
    res.status(200).json({ message: 'Anggota berhasil ditambahkan.' });
  } catch (err) { 
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    next(err); 
  }
};

module.exports = { listProjects, createProject, getProject, replaceProject, updateProject, deleteProject, addMember };
