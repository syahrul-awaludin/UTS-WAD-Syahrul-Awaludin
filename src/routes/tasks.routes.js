const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tasks.controller');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  replaceTaskSchema,
  updateTaskSchema,
  listTasksSchema,
} = require('../validators/task.validator');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Manajemen Tasks
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Ambil daftar task (dengan pagination)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *         description: Filter berdasarkan prioritas
 *       - in: query
 *         name: projectId
 *         schema: { type: integer }
 *         description: Filter berdasarkan project
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: Daftar task berhasil diambil }
 *       401: { description: Unauthorized }
 *   post:
 *     summary: Buat task baru
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: 'Kerjakan tugas akhir' }
 *               description: { type: string, example: 'Deskripsi task' }
 *               status: { type: string, enum: [TODO, IN_PROGRESS, DONE], default: TODO }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH], default: MEDIUM }
 *               dueDate: { type: string, format: date-time, example: '2026-12-31T00:00:00.000Z' }
 *               projectId: { type: integer, example: 1 }
 *     responses:
 *       201: { description: Task berhasil dibuat }
 *       401: { description: Unauthorized }
 */
router.get('/', validate(listTasksSchema, 'query'), ctrl.listTasks);
router.post('/', validate(createTaskSchema, 'body'), ctrl.createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Dapatkan detail task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Detail task }
 *       404: { description: Task tidak ditemukan }
 *   put:
 *     summary: Replace task (semua field wajib diisi)
 *     tags: [Tasks]
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
 *             required: [title, status, priority]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               dueDate: { type: string, format: date-time }
 *               projectId: { type: integer }
 *     responses:
 *       200: { description: Task diupdate }
 *   patch:
 *     summary: Update parsial task
 *     tags: [Tasks]
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
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               dueDate: { type: string, format: date-time }
 *               projectId: { type: integer }
 *     responses:
 *       200: { description: Task diupdate }
 *   delete:
 *     summary: Hapus task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Task dihapus }
 */
router.get('/:id', ctrl.getTask);
router.put('/:id', validate(replaceTaskSchema, 'body'), ctrl.replaceTask);
router.patch('/:id', validate(updateTaskSchema, 'body'), ctrl.updateTask);
router.delete('/:id', ctrl.deleteTask);

module.exports = router;

