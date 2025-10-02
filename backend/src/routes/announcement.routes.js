const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcement.controller.js");
const { verifyToken } = require("../middleware/auth.middleware.js");
const { uploadAnnouncement } = require("../middleware/multer.middleware.js"); 

router.post("/", verifyToken, uploadAnnouncement.single('gambar'), announcementController.create);
router.get("/", announcementController.findAll); 
router.put("/:id", verifyToken, uploadAnnouncement.single('gambar'), announcementController.update);
router.delete("/:id", verifyToken, announcementController.delete);

module.exports = router;