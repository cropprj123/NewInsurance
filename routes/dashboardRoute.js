const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router.get("/stats", dashboardController.getDashboardStats);
router.get("/regional-stats", dashboardController.getRegionalStats);
router.get("/agent-performance/:agentId", dashboardController.getAgentPerformance);

module.exports = router; 