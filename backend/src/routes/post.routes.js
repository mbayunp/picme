// src/routes/posts.routes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller.js');
const { verifyToken } = require('../middleware/auth.middleware.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder upload jika belum ada
const uploadDir = path.join(__dirname, '..', '..', 'public', 'assets', 'images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Maks 10 MB
});

// 📂 ROUTES
router.get('/', postController.findAll);
router.get('/:id', postController.findOne);
router.post(
  '/',
  verifyToken,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'slides', maxCount: 10 }]),
  postController.create
);
router.put(
  '/:id',
  verifyToken,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'slides', maxCount: 10 }]),
  postController.update
);
router.delete('/:id', verifyToken, postController.delete);

module.exports = router;
