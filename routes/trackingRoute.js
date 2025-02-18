const express = require("express");
const policyEnrollmentController = require("../controllers/farmvisitTrackingController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/:insuranceAssignmentId",
  authController.protect,

  policyEnrollmentController.createPolicyEnrollment
);

module.exports = router;
