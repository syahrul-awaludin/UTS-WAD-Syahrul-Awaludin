const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const userRepo = require('../repositories/user.repository');
const refreshTokenRepo = require('../repositories/refreshToken.repository');
const prisma = require('../config/prisma');

const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    jwtid: uuidv4(),
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    jwtid: uuidv4(),
  });
}

function getRefreshTokenExpiry() {
  const days = parseInt(config.jwt.refreshExpiresIn, 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

const authService = {
  async register({ name, email, password }) {
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      const err = new Error('Email sudah terdaftar.');
      err.statusCode = 409;
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }

    const hashedPassword = await argon2.hash(password, ARGON2_OPTIONS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return user;
  },

  async login({ email, password }) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      const err = new Error('Email atau password salah.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      const err = new Error('Email atau password salah.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    await refreshTokenRepo.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    };
  },

  async refresh(tokenString) {
    let payload;
    try {
      payload = jwt.verify(tokenString, config.jwt.refreshSecret);
    } catch (e) {
      const err = new Error('Refresh token tidak valid atau sudah expired.');
      err.statusCode = 401; err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    const storedToken = await refreshTokenRepo.findValid(tokenString);

    if (!storedToken) {
      // Check if token exists but is revoked (reuse detection)
      const revokedToken = await refreshTokenRepo.findByToken(tokenString);
      if (revokedToken && revokedToken.isRevoked) {
        await refreshTokenRepo.revokeAllByUser(revokedToken.userId);
        const err = new Error('Token mencurigakan terdeteksi. Silakan login ulang.');
        err.statusCode = 401; err.code = 'TOKEN_REUSE_DETECTED';
        throw err;
      }
      const err = new Error('Refresh token tidak ditemukan atau sudah expired.');
      err.statusCode = 401; err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    await refreshTokenRepo.revoke(tokenString);

    const newAccessToken = signAccessToken({ userId: storedToken.userId, email: storedToken.user.email });
    const newRefreshToken = signRefreshToken({ userId: storedToken.userId });

    await refreshTokenRepo.create({
      token: newRefreshToken,
      userId: storedToken.userId,
      expiresAt: getRefreshTokenExpiry(),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(tokenString) {
    if (!tokenString) return;
    await refreshTokenRepo.revoke(tokenString);
  },
};

module.exports = authService;
