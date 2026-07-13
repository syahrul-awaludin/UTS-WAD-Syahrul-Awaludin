const projectRepo = require('../repositories/project.repository');
const { getIo } = require('../config/socket');
const prisma = require('../config/prisma');

class ProjectError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const listProjects = async (query, user) => {
  const { status, search, sort, order, limit, offset } = query;
  const ownerId = user.role === 'ADMIN' ? undefined : user.userId;
  
  const { data, total } = await projectRepo.findMany({ 
    ownerId, 
    status, 
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

const createProject = async (body, user) => {
  const project = await projectRepo.create({ 
    ...body, 
    ownerId: user.userId 
  });
  
  try { 
    getIo().to(`user:${project.ownerId}`).to('global_admin').emit('project:created', { project, senderId: user.userId }); 
  } catch(e) { console.error('Socket error:', e); }
  
  return project;
};

const getProject = async (id, user) => {
  const project = await projectRepo.findById(id);
  const isMember = project?.members?.some(m => m.id === user.userId);
  
  if (!project || (user.role !== 'ADMIN' && project.ownerId !== user.userId && !isMember)) {
    throw new ProjectError(`Project ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }
  
  return project;
};

const replaceProject = async (id, body, user) => {
  const existing = await projectRepo.findById(id);
  
  if (!existing || (user.role !== 'ADMIN' && existing.ownerId !== user.userId)) {
    throw new ProjectError(`Project ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }

  const project = await projectRepo.update(id, body);
  
  try { 
    getIo().to(`user:${project.ownerId}`).to('global_admin').emit('project:updated', { project, senderId: user.userId }); 
  } catch(e) { console.error('Socket error:', e); }
  
  return project;
};

const updateProject = async (id, body, user) => {
  const existing = await projectRepo.findById(id);
  
  if (!existing || (user.role !== 'ADMIN' && existing.ownerId !== user.userId)) {
    throw new ProjectError(`Project ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }

  const project = await projectRepo.update(id, body);
  
  try { 
    getIo().to(`user:${project.ownerId}`).to('global_admin').emit('project:updated', { project, senderId: user.userId }); 
  } catch(e) { console.error('Socket error:', e); }
  
  return project;
};

const deleteProject = async (id, user) => {
  const existing = await projectRepo.findById(id);
  
  if (!existing || (user.role !== 'ADMIN' && existing.ownerId !== user.userId)) {
    throw new ProjectError(`Project ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }

  const ok = await projectRepo.remove(id);
  if (!ok) {
    throw new ProjectError(`Project ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  }
  
  try { 
    getIo().to(`user:${existing.ownerId}`).to('global_admin').emit('project:deleted', { projectId: id, senderId: user.userId }); 
  } catch(e) { console.error('Socket error:', e); }
  
  return true;
};

const addMember = async (id, email, user) => {
  if (!email) {
    throw new ProjectError('Email harus diisi.', 400, 'BAD_REQUEST');
  }

  const project = await projectRepo.findById(id);
  if (!project || (user.role !== 'ADMIN' && project.ownerId !== user.userId)) {
    throw new ProjectError(`Project tidak ditemukan atau Anda bukan pemiliknya.`, 404, 'NOT_FOUND');
  }

  const userToAdd = await prisma.user.findUnique({ where: { email } });
  
  if (!userToAdd) {
    throw new ProjectError(`Pengguna dengan email ${email} tidak ditemukan.`, 404, 'NOT_FOUND');
  }

  const updatedProject = await projectRepo.addMember(id, userToAdd.id);
  
  try { 
    getIo().to(`user:${userToAdd.id}`).emit('project:created', { project: updatedProject, senderId: user.userId }); 
  } catch(e) { console.error('Socket error:', e); }

  return updatedProject;
};

module.exports = { 
  listProjects, 
  createProject, 
  getProject, 
  replaceProject, 
  updateProject, 
  deleteProject, 
  addMember 
};
