// src/routes/services.routes.js
const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/services.controller.js");
const { verifyToken } = require("../middleware/auth.middleware.js");

router.get("/", verifyToken, servicesController.findAll);

router.get("/slots", servicesController.getAvailableSlots);
router.post("/", servicesController.create);

router.delete("/:id", verifyToken, servicesController.delete);

module.exports = router;