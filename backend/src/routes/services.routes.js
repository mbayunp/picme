// src/routes/services.routes.js

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

// Rute untuk mengkonfirmasi dan membatalkan pemesanan
router.put("/:id/confirm", verifyToken, servicesController.confirmBooking);
router.put("/:id/cancel", verifyToken, servicesController.cancelBooking);

// ✅ Rute baru untuk laporan keuangan
router.get("/financial-report", verifyToken, servicesController.getFinancialReport);

// Rute untuk Data Pelanggan
router.get("/customers", verifyToken, servicesController.findAllCustomers);
router.get("/customers/export", verifyToken, servicesController.exportCustomers);
router.post("/customers/import", verifyToken, upload.single('csvFile'), servicesController.importCustomers);
router.get("/customer/:nomor_whatsapp", verifyToken, servicesController.getCustomerDetails);


module.exports = router;