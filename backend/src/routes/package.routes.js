const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const packageController = require("../controllers/package.controller.js");
const authJwt = require("../middleware/auth.middleware.js");

router.get("/", packageController.findAll);

router.post("/", [authJwt.verifyToken, upload.none()], packageController.create);

router.put("/:id", [authJwt.verifyToken, upload.none()], packageController.update);

router.delete("/:id", [authJwt.verifyToken], packageController.delete);

router.patch("/:id/status", [authJwt.verifyToken, upload.none()], packageController.toggleStatus);

module.exports = router;
