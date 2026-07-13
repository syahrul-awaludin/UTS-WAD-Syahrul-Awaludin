const projectRepo = require('../repositories/project.repository');

const listProjects = async (req, res, next) => {
  try {
    const { status, sort, order, limit, offset } = req.query;
    const ownerId = req.user.role === 'ADMIN' ? undefined : req.user.userId;
    const { data, total } = await projectRepo.findMany({ 
      ownerId, 
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
    try { getIo().to(`user:${project.ownerId}`).to('global_admin').emit('project:created', { project }); } catch(e){}
    res.status(201).set('Location', `/api/v1/projects/${project.id}`).json({ data: project });
  } catch (err) { next(err); }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectRepo.findById(req.params.id);
    const isMember = project?.members?.some(m => m.id === req.user.userId);
    if (!project || (req.user.role !== 'ADMIN' && project.ownerId !== req.user.userId && !isMember)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }
    res.status(200).json({ data: project });
  } catch (err) { next(err); }
};

const replaceProject = async (req, res, next) => {
  try {
    const existing = await projectRepo.findById(req.params.id);
    if (!existing || (req.user.role !== 'ADMIN' && existing.ownerId !== req.user.userId)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }

    const project = await projectRepo.update(req.params.id, req.body);
    try { getIo().to(`user:${project.ownerId}`).to('global_admin').emit('project:updated', { project }); } catch(e){}
    res.status(200).json({ data: project });
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const existing = await projectRepo.findById(req.params.id);
    if (!existing || (req.user.role !== 'ADMIN' && existing.ownerId !== req.user.userId)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }

    const project = await projectRepo.update(req.params.id, req.body);
    try { getIo().to(`user:${project.ownerId}`).to('global_admin').emit('project:updated', { project }); } catch(e){}
    res.status(200).json({ data: project });
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    const existing = await projectRepo.findById(req.params.id);
    if (!existing || (req.user.role !== 'ADMIN' && existing.ownerId !== req.user.userId)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }

    const ok = await projectRepo.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project ID ${req.params.id} tidak ditemukan.` } });
    }
    try { getIo().to(`user:${existing.ownerId}`).to('global_admin').emit('project:deleted', { projectId: req.params.id }); } catch(e){}
    res.status(204).send();
  } catch (err) { next(err); }
};

const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email harus diisi.' } });
    }

    const project = await projectRepo.findById(req.params.id);
    if (!project || (req.user.role !== 'ADMIN' && project.ownerId !== req.user.userId)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Project tidak ditemukan atau Anda bukan pemiliknya.` } });
    }

    const userRepo = require('../repositories/user.repository');
    // We need findByEmail, let's use prisma directly for now to be quick
    const prisma = require('../config/prisma');
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    
    if (!userToAdd) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Pengguna dengan email ${email} tidak ditemukan.` } });
    }

    const updatedProject = await projectRepo.addMember(req.params.id, userToAdd.id);
    
    // Notify the newly invited user so it appears on their screen live
    const { getIo } = require('../config/socket');
    try { getIo().to(`user:${userToAdd.id}`).emit('project:created', { project: updatedProject }); } catch(e){}

    res.status(200).json({ message: 'Anggota berhasil ditambahkan.' });
  } catch (err) { next(err); }
};

module.exports = { listProjects, createProject, getProject, replaceProject, updateProject, deleteProject, addMember };
