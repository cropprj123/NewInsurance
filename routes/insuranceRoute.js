const express = require("express");
const insurancePolicyController = require("../controllers/insuranceController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(insurancePolicyController.getAllPolicies);
router.route("/:id").get(insurancePolicyController.getPolicy);

router.use(authController.protect, authController.restrictTo("admin"));

router.route("/").post(insurancePolicyController.createPolicy);

router
  .route("/:id")
  .patch(insurancePolicyController.updatePolicy)
  .delete(insurancePolicyController.deletePolicy);

module.exports = router;
