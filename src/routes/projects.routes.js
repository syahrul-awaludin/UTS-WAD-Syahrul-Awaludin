const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projects.controller');
const validate = require('../middleware/validate');
const {
  createProjectSchema,
  replaceProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
} = require('../validators/project.validator');

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Manajemen Projects
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Ambil daftar project (dengan pagination)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, COMPLETED, ARCHIVED] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: Daftar project berhasil diambil }
 *   post:
 *     summary: Buat project baru
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: 'Project Alpha' }
 *               description: { type: string, example: 'Deskripsi project' }
 *               status: { type: string, enum: [ACTIVE, COMPLETED, ARCHIVED] }
 *     responses:
 *       201: { description: Project berhasil dibuat }
 */
router.get('/', validate(listProjectsSchema, 'query'), ctrl.listProjects);
router.post('/', validate(createProjectSchema, 'body'), ctrl.createProject);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Dapatkan detail project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Detail project }
 *       404: { description: Project tidak ditemukan }
 *   put:
 *     summary: Replace project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, status]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *     responses:
 *       200: { description: Project diupdate }
 *   patch:
 *     summary: Update parsial project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *     responses:
 *       200: { description: Project diupdate }
 *   delete:
 *     summary: Hapus project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Project dihapus }
 */
router.get('/:id', ctrl.getProject);
router.put('/:id', validate(replaceProjectSchema, 'body'), ctrl.replaceProject);
router.patch('/:id', validate(updateProjectSchema, 'body'), ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);
router.post('/:id/members', ctrl.addMember);

module.exports = router;
