// File Baru: src/routes/studio.routes.js

const express = require('express');
const router = express.Router();
const studiosController = require('../controllers/studio.controller.js');
const { verifyToken } = require("../middleware/auth.middleware.js"); // Pastikan path middleware ini benar

// Mendefinisikan rute GET / untuk mengambil semua studio
router.get('/', verifyToken, studiosController.findAll);

module.exports = router;