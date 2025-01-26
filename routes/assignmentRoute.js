const express = require("express");
const insuranceAssignmentController = require("../controllers/insuranceAssignmentController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.post(
  "/create",
  authController.restrictTo("user", "admin", "agent"),
  insuranceAssignmentController.createInsuranceAssignment
);

router.get(
  "/available-agents/:assignmentId",
  authController.restrictTo("admin", "agent"),
  insuranceAssignmentController.findAvailableAgentsForAssignment
);

router.patch(
  "/assign-agent/:assignmentId",
  authController.restrictTo("admin", "agent"),
  insuranceAssignmentController.assignAgentToInsurance
);

router.get(
  "/",
  authController.restrictTo("admin", "agent"),
  insuranceAssignmentController.getInsuranceAssignments
);

module.exports = router;
