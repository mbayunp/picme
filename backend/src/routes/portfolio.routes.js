// src/routes/portfolio.routes.js

const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolio.controller.js");
const { verifyToken } = require("../middleware/auth.middleware.js");

// Rute untuk mengambil semua item portfolio
router.get("/", portfolioController.findAll);

// Rute untuk menambah item portfolio baru
router.post("/", [verifyToken], portfolioController.create);

// Rute untuk mengedit item portfolio berdasarkan ID
router.put("/:id", [verifyToken], portfolioController.update);

// Rute untuk menghapus item portfolio berdasarkan ID
router.delete("/:id", [verifyToken], portfolioController.delete);

module.exports = router;