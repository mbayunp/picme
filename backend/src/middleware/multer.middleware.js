// src/middleware/multer.middleware.js

const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file di disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Jalur yang benar ke folder tujuan
    cb(null, path.join(__dirname, '../../public/assets/images'));
  },
  filename: function (req, file, cb) {
    // Buat nama file unik untuk gambar yang diunggah
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  }
});

// Buat instance upload Multer
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas ukuran file 5MB
});

module.exports = { upload };