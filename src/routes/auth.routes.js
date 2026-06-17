const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoint autentikasi
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrasi user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: 'Budi Santoso' }
 *               email: { type: string, example: 'budi@example.com' }
 *               password: { type: string, minLength: 8, example: 'P@ssw0rd!' }
 *     responses:
 *       201: { description: Registrasi berhasil }
 *       409: { description: Email sudah terdaftar }
 */
router.post('/register', validate(registerSchema), ctrl.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login dan dapatkan token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: 'budi@example.com' }
 *               password: { type: string, example: 'P@ssw0rd!' }
 *     responses:
 *       200: { description: Login berhasil }
 *       401: { description: Kredensial tidak valid }
 */
router.post('/login', validate(loginSchema), ctrl.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Token berhasil direfresh }
 *       401: { description: Token tidak valid atau expired }
 */
router.post('/refresh', validate(refreshSchema), ctrl.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout dan revoke token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Logout berhasil }
 */
router.post('/logout', ctrl.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Dapatkan info user yang sedang login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Info user }
 *       401: { description: Unauthorized }
 */
router.get('/me', authenticate, ctrl.me);

module.exports = router;
