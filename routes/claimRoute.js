const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claimController");
const authController = require("../controllers/authController");
const multer = require("multer");
const path = require("path");

const { upload } = require("../controllers/claimController");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadMulter = multer({ storage: storage });

// Protect all routes
router.use(authController.protect);

router.post(
  "/:policyEnrollmentId",
  uploadMulter.array("photos", 5),
  claimController.createClaim
);

router.get("/myclaims", claimController.getMyClaims);
router.get("/statusclaim", claimController.getFarmerClaimStatus);
router.get(
  "/getallclaims",
  authController.restrictTo("admin"),
  claimController.getAllClaims
);
router.get(
  "/adminclaimstatus",
  authController.restrictTo("admin"),
  claimController.getAdminClaimStatus
);

// Process claim with images
// router.post(
//   "/process",
//   uploadMulter.array("images", 5) // Allow up to 5 images
//   // claimController.processClaim
// );

// Get claim status
router.get("/:claimId", async (req, res) => {
  try {
    const claim = await blockchainService.getClaim(req.params.claimId);
    res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
