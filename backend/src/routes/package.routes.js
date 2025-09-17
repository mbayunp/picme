// src/routes/package.routes.js
const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller.js");
const authJwt = require("../middleware/auth.middleware.js");
const multer = require("multer");

// Konfigurasi Multer untuk mengunggah file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/images'); // Folder tujuan untuk menyimpan gambar
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nama file unik: timestamp + nama asli
  }
});
const upload = multer({ storage: storage });

// Rute untuk mengelola paket
router.get("/", packageController.findAll);
// Tambah Paket Baru dengan unggah gambar
router.post("/", [authJwt.verifyToken, upload.single('image')], packageController.create);
// Perbarui Paket dengan unggah gambar
router.put("/:id", [authJwt.verifyToken, upload.single('image')], packageController.update);
// Hapus Paket
router.delete("/:id", [authJwt.verifyToken], packageController.delete);

module.exports = router;