const prisma = require('../config/prisma');

const refreshTokenRepo = {
  async create({ token, userId, expiresAt }) {
    return prisma.refreshToken.create({
      data: { token, userId, expiresAt: new Date(expiresAt) },
    });
  },

  async findValid(token) {
    return prisma.refreshToken.findFirst({
      where: {
        token,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  },

  async findByToken(token) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  async revoke(token) {
    return prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  },

  async revokeAllByUser(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId: Number(userId), isRevoked: false },
      data: { isRevoked: true },
    });
  },

  async deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};

module.exports = refreshTokenRepo;
