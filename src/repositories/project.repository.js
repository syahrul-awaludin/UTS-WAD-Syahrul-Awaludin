const prisma = require('../config/prisma');

const projectRepository = {
  async findMany({ ownerId, status, sort = 'createdAt', order = 'desc', limit = 10, offset = 0 } = {}) {
    const where = {};
    if (ownerId) where.ownerId = Number(ownerId);
    if (status) where.status = status.toUpperCase().replace('-', '_');

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [sort]: order },
        take: Number(limit),
        skip: Number(offset),
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return { data, total };
  },

  async findById(id) {
    return prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          select: { id: true, title: true, status: true, priority: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  async create(data) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        status: data.status ? data.status.toUpperCase().replace('-', '_') : 'ACTIVE',
        ownerId: Number(data.ownerId),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async update(id, data) {
    try {
      return await prisma.project.update({
        where: { id: Number(id) },
        data: {
          ...data,
          status: data.status ? data.status.toUpperCase().replace('-', '_') : undefined,
        },
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (e) {
      if (e.code === 'P2025') return null; // Record tidak ditemukan
      throw e;
    }
  },

  async remove(id) {
    try {
      await prisma.project.delete({ where: { id: Number(id) } });
      return true;
    } catch (e) {
      if (e.code === 'P2025') return false;
      throw e;
    }
  },
};

module.exports = projectRepository;
