const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller.js');
const { verifyToken } = require('../middleware/auth.middleware.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tentukan folder upload yang benar, yaitu di luar folder 'src'
const uploadDir = path.join(__dirname, '..', '..', 'public', 'assets', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, Date.now() + '_' + baseName + ext);
  }
});

const upload = multer({ storage: storage });

// Publicambil semua post
router.get('/', postController.findAll);

// Tambah post (admin-protected)
router.post('/', verifyToken, upload.single('image'), postController.create);

// Update post
router.put('/:id', verifyToken, upload.single('image'), postController.update);

// Delete post
router.delete('/:id', verifyToken, postController.delete);

module.exports = router;
