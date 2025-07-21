// backend/routes/blindBox.js
const express = require('express');
const router = express.Router();
const blindBoxController = require('../controllers/BlindBoxController');

// 创建新盲盒
router.post('/blindbox', blindBoxController.createBlindBox);

// 删除盲盒
router.delete('/blindbox/:id', blindBoxController.deleteBlindBox);

module.exports = router;