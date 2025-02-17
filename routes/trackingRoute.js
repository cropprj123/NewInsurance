const express = require("express");
const router = express.Router();
const farmVisitTrackingController = require("./../controllers/farmvisitTrackingController");
const { protect, restrictTo } = require("./../controllers/authController");

// Protect all routes
router.use(protect);

// Routes for agents and admins
router
  .route("/assignment/:insuranceAssignmentId")
  .post(
    restrictTo("agent"),
    farmVisitTrackingController.createFarmVisitTracking
  )
  .get(farmVisitTrackingController.getFarmVisitTrackingByAssignment);

router
  .route("/:id")
  .get(farmVisitTrackingController.getFarmVisitTrackingById)
  .patch(
    restrictTo("agent", "admin"),
    farmVisitTrackingController.updateFarmVisitTracking
  )
  .delete(
    restrictTo("admin"),
    farmVisitTrackingController.deleteFarmVisitTracking
  );

router
  .route("/")
  .get(
    restrictTo("admin", "agent"),
    farmVisitTrackingController.getAllFarmVisitTrackings
  );

router
  .route("/ineligible")
  .get(
    restrictTo("admin"),
    farmVisitTrackingController.getIneligibleFarmVisitTrackings
  );

// Routes for farmers
router
  .route("/final-tracking/latest")
  .get(farmVisitTrackingController.getLatestFinalTrackingForFarmer);

router
  .route("/final-trackings")
  .get(farmVisitTrackingController.getAllFinalTrackingsForFarmer);
module.exports = router;
