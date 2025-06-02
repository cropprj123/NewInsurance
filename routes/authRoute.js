const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Protected routes
router.use(authController.protect);
router.get("/me", authController.getMe);

module.exports = router;
