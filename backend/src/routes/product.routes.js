// src/routes/product.routes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller.js");

router.get("/", productController.findAll);

module.exports = router;