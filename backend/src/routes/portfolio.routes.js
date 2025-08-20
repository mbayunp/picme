// src/routes/gallery.routes.js
const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/portfolio.controller.js");

router.get("/", galleryController.findAll);

module.exports = router;