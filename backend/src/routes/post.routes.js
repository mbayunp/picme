const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller.js');
const { verifyToken } = require('../middleware/auth.middleware.js');
const multer = require('multer');
const upload = multer(); // Hanya untuk parsing FormData text fields

// Routes Bersih (Tanpa logika upload file disini)
router.get('/', postController.findAll);
router.get('/:id', postController.findOne);

// Gunakan upload.none() karena file dikirim sebagai URL string
router.post('/', [verifyToken, upload.none()], postController.create);
router.put('/:id', [verifyToken, upload.none()], postController.update);
router.delete('/:id', verifyToken, postController.delete);

module.exports = router;