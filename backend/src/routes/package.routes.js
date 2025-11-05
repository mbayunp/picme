const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const packageController = require("../controllers/package.controller.js");
const authJwt = require("../middleware/auth.middleware.js");

// GET /api/packages
router.get("/", packageController.findAll);

// POST /api/packages
router.post("/", [authJwt.verifyToken, upload.none()], packageController.create);

// PUT /api/packages/:id
router.put("/:id", [authJwt.verifyToken, upload.none()], packageController.update);

// DELETE /api/packages/:id
router.delete("/:id", [authJwt.verifyToken], packageController.delete);

router.patch("/:id/status", [authJwt.verifyToken, upload.none()], packageController.toggleStatus);

module.exports = router;