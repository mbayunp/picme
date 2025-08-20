const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller.js");
const { verifyToken } = require("../middleware/auth.middleware.js");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // PERBAIKAN: Menggunakan jalur absolut yang lebih andal
        // Jalur dari 'backend/src/routes' ke 'frontend/src/assets/images'
        cb(null, path.join(__dirname, '../../../frontend/src/assets/images/'));
    },
    filename: (req, file, cb) => {
        const cleanedFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, Date.now() + '_' + cleanedFileName);
    }
});
const upload = multer({ storage: storage });

router.get("/", postController.findAll);
router.post("/", verifyToken, upload.single('image'), postController.create);
router.put("/:id", verifyToken, upload.single('image'), postController.update);
router.delete("/:id", verifyToken, postController.delete);

module.exports = router;
