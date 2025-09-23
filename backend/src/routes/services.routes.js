const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/services.controller.js");
const { verifyToken } = require("../middleware/auth.middleware.js");

// Rute untuk Pemesanan (Services)
router.get("/", verifyToken, servicesController.findAll);
router.get("/slots", servicesController.getAvailableSlots);
router.post("/", servicesController.create);
router.put("/:id", verifyToken, servicesController.update);
router.delete("/:id", verifyToken, servicesController.delete);

// Rute untuk Data Pelanggan
router.get("/customers", verifyToken, servicesController.findAllCustomers);

module.exports = router;
