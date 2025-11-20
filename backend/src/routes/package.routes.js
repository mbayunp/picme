const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // Diperlukan untuk parsing FormData tanpa file di endpoint ini

const packageController = require("../controllers/package.controller.js");
const authJwt = require("../middleware/auth.middleware.js");

// GET Semua Paket
router.get("/", packageController.findAll);

// POST Paket Baru (Gunakan upload.none() untuk parse text fields dari FormData)
router.post("/", [authJwt.verifyToken, upload.none()], packageController.create);

// PUT Update Paket
router.put("/:id", [authJwt.verifyToken, upload.none()], packageController.update);

// DELETE Paket
router.delete("/:id", [authJwt.verifyToken], packageController.delete);

// PATCH Toggle Status
router.patch("/:id/status", [authJwt.verifyToken, upload.none()], packageController.toggleStatus);

module.exports = router;