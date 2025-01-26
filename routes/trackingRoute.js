const express = require("express");
const router = express.Router();
const farmVisitTrackingController = require("./../controllers/farmvisitTrackingController");
const { protect, restrictTo } = require("./../controllers/authController");

router.use(protect);

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

// router
//   .route("/:id")
//   .patch(
//     restrictTo("agent", "admin"),
//     farmVisitTrackingController.updateFarmVisitTracking
//   )
//   .delete(
//     restrictTo("admin"),
//     farmVisitTrackingController.deleteFarmVisitTracking
//   );

module.exports = router;
