// src/routes/package.routes.js
const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller.js");

router.get("/", packageController.findAll);

module.exports = router;
