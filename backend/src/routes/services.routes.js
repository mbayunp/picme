const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/services.controller.js");
const { verifyToken } = require("../middleware/auth.middleware.js");
const { upload } = require("../middleware/multer.middleware.js");

// Rute untuk Pemesanan (Services)
router.get("/", verifyToken, servicesController.findAll);
router.get("/slots", servicesController.getAvailableSlots);
router.post("/", servicesController.create);
router.put("/:id", verifyToken, servicesController.update);
router.delete("/:id", verifyToken, servicesController.delete);

// Rute yang benar untuk mengkonfirmasi pemesanan
router.put("/:id/confirm", verifyToken, servicesController.confirmBooking);

// Rute untuk Data Pelanggan
router.get("/customers", verifyToken, servicesController.findAllCustomers);
router.get("/customers/export", verifyToken, servicesController.exportCustomers);
router.post("/customers/import", verifyToken, upload.single('csvFile'), servicesController.importCustomers);

module.exports = router;
