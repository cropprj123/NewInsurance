const express = require("express");
const router = express.Router();
const farmVisitTrackingController = require("./../controllers/farmvisitTrackingController");
const { protect, restrictTo } = require("./../controllers/authController");

router.use(protect);

router
  .route("/")
  .post(
    restrictTo("agent"),
    farmVisitTrackingController.createFarmVisitTracking
  )
  .get(
    restrictTo("admin"),
    farmVisitTrackingController.getAllFarmVisitTrackings
  );

router
  .route("/ineligible")
  .get(
    restrictTo("admin"),
    farmVisitTrackingController.getIneligibleFarmVisitTrackings
  );

router
  .route("/:id")
  .get(farmVisitTrackingController.getFarmVisitTrackingByAssignment)
  .patch(
    restrictTo("agent", "admin"),
    farmVisitTrackingController.updateFarmVisitTracking
  )
  .delete(
    restrictTo("admin"),
    farmVisitTrackingController.deleteFarmVisitTracking
  );

router
  .route("/assignment/:insuranceAssignmentId")
  .get(farmVisitTrackingController.getFarmVisitTrackingByAssignment);

module.exports = router;
