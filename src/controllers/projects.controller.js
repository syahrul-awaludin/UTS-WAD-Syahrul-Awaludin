const projectRepo = require('../repositories/project.repository');

const listProjects = async (req, res, next) => {
  try {
    const { status, sort, order, limit, offset } = req.query;
    const { data, total } = await projectRepo.findMany({ 
      ownerId: req.user.userId, 
      status, 
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

const createProject = async (req, res, next) => {
  try {
    const project = await projectRepo.create({ 
      ...req.body, 
      ownerId: req.user.userId 
    });
    res.status(201).set('Location', `/api/v1/projects/${project.id}`).json({ data: project });
  } catch (err) { next(err); }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectRepo.findById(req.params.id);
    if (!project || project.ownerId !== req.user.userId) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }
    res.status(200).json({ data: project });
  } catch (err) { next(err); }
};

const replaceProject = async (req, res, next) => {
  try {
    const existing = await projectRepo.findById(req.params.id);
    if (!existing || existing.ownerId !== req.user.userId) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }

    const project = await projectRepo.update(req.params.id, req.body);
    res.status(200).json({ data: project });
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const existing = await projectRepo.findById(req.params.id);
    if (!existing || existing.ownerId !== req.user.userId) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }

    const project = await projectRepo.update(req.params.id, req.body);
    res.status(200).json({ data: project });
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    const existing = await projectRepo.findById(req.params.id);
    if (!existing || existing.ownerId !== req.user.userId) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }

    const ok = await projectRepo.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { listProjects, createProject, getProject, replaceProject, updateProject, deleteProject };
