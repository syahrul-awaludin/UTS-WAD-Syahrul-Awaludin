const Joi = require('joi');

const VALID_STATUS = ['ACTIVE', 'COMPLETED', 'ARCHIVED'];
const VALID_SORT = ['createdAt', 'updatedAt', 'name', 'status'];
const VALID_ORDER = ['asc', 'desc'];

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.empty': 'Nama project tidak boleh kosong.',
      'string.max': 'Nama project maksimal 200 karakter.',
      'any.required': 'Nama project wajib diisi.',
    }),
  description: Joi.string().trim().max(1000).optional().allow('', null),
  status: Joi.string().valid(...VALID_STATUS).default('ACTIVE')
    .messages({ 'any.only': `Status project harus salah satu dari: ${VALID_STATUS.join(', ')}.` }),
});

const replaceProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(1000).optional().allow('', null),
  status: Joi.string().valid(...VALID_STATUS).required(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().max(1000).allow('', null),
  status: Joi.string().valid(...VALID_STATUS),
}).min(1).messages({ 'object.min': 'Minimal satu field harus diisi untuk update.' });

const listProjectsSchema = Joi.object({
  status: Joi.string().valid(...VALID_STATUS).optional(),
  sort: Joi.string().valid(...VALID_SORT).default('createdAt'),
  order: Joi.string().valid(...VALID_ORDER).default('desc'),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0),
});

module.exports = { createProjectSchema, replaceProjectSchema, updateProjectSchema, listProjectsSchema };
