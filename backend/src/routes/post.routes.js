const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller.js');
const { verifyToken } = require('../middleware/auth.middleware.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

router.get('/', postController.findAll);
router.get('/:id', postController.findOne);

router.post('/', verifyToken, upload.single('image'), postController.create);
router.put('/:id', verifyToken, upload.single('image'), postController.update);
router.delete('/:id', verifyToken, postController.delete);

module.exports = router;