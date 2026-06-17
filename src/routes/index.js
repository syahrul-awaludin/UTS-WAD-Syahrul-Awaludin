const express = require('express');
const router = express.Router();
const { getHealth, getInfo } = require('../controllers/healthController');

router.get('/health', getHealth);
router.get('/info', getInfo);

module.exports = router;
