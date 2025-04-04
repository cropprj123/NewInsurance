const express = require('express');
const diseaseLocationController = require('../controllers/farmerDiseaseLocationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(diseaseLocationController.getAllDiseaseLocations)
  .post(
    diseaseLocationController.uploadDiseaseImage,
    diseaseLocationController.createDiseaseLocation
  );

router.get('/nearby', diseaseLocationController.getNearbyDiseases);
router.get('/stats', diseaseLocationController.getDiseaseLocationStats);
router.get(
  '/within/:distance/center/:latitude,:longitude',
  diseaseLocationController.getDiseaseLocationsWithinRadius
);

module.exports = router; 