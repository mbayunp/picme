const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ PERBAIKAN: Pisahkan storage untuk pengumuman
const announcementStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "..", "public", "assets", "images", "pengumuman");
    // Pastikan direktori ada, jika tidak, buat
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const defaultStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "..", "public", "assets", "images"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

exports.upload = multer({ storage: defaultStorage });
exports.uploadAnnouncement = multer({ storage: announcementStorage });