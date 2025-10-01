// src/routes/contact.routes.js
const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller.js");
const { verifyToken } = require("../middleware/auth.middleware.js");

// ✅ Rute untuk mengirim pesan
router.post("/", contactController.create);

// ✅ Rute untuk mengambil semua pesan (hanya bisa diakses admin)
router.get("/", verifyToken, contactController.findAll);

module.exports = router;