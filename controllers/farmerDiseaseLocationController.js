const FarmerDiseaseLocation = require('../models/farmerDiseaseLocation');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

// Configure multer to store in memory
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadDiseaseImage = upload.single('image');

exports.createDiseaseLocation = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  if (!req.body.latitude || !req.body.longitude) {
    return next(new AppError('Please provide latitude and longitude', 400));
  }

  try {
    // Create form data for the model
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Send to disease detection model
    const response = await axios.post(
      `http://127.0.0.1:5000/detect_crop_disease`,
      formData,
      {
        headers: { ...formData.getHeaders() }
      }
    );

    if (!response.data || !response.data.predictions || !response.data.predictions[0]) {
      return next(new AppError('Invalid response from disease detection service', 500));
    }

    const prediction = response.data.predictions[0];

    // Create disease location record
    const newLocation = await FarmerDiseaseLocation.create({
      userId: req.user.id,
      userName: req.user.name,
      cropDiseaseName: prediction.disease,
      diseaseConfidence: prediction.confidence,
      geolocation: {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        location: newLocation,
        prediction: prediction
      }
    });
  } catch (error) {
    console.error('Disease Detection Error:', error);
    return next(new AppError('Error in disease detection. Please try again.', 500));
  }
});

exports.getAllDiseaseLocations = catchAsync(async (req, res, next) => {
  const locations = await FarmerDiseaseLocation.find();

  res.status(200).json({
    status: 'success',
    results: locations.length,
    data: {
      locations
    }
  });
});

exports.getDiseaseLocationsWithinRadius = catchAsync(async (req, res, next) => {
  const { latitude, longitude, distance } = req.params;
  const radius = distance / 6378.1; // Convert distance to radians

  const locations = await FarmerDiseaseLocation.find({
    geolocation: {
      $geoWithin: {
        $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radius]
      }
    }
  });

  res.status(200).json({
    status: 'success',
    results: locations.length,
    data: {
      locations
    }
  });
});

exports.getDiseaseLocationStats = catchAsync(async (req, res, next) => {
  const stats = await FarmerDiseaseLocation.aggregate([
    {
      $group: {
        _id: '$cropDiseaseName',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$diseaseConfidence' },
        locations: { $push: '$geolocation' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getNearbyDiseases = catchAsync(async (req, res, next) => {
  const { latitude, longitude, radius } = req.query; // radius in meters

  if (!latitude || !longitude || !radius) {
    return next(new AppError('Please provide latitude, longitude and radius', 400));
  }

  // Convert radius from meters to radians (divide by Earth's radius in meters)
  const radiusInRadians = radius / 6378100;

  const diseases = await FarmerDiseaseLocation.find({
    geolocation: {
      $geoWithin: {
        $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radiusInRadians]
      }
    }
  }).select('cropDiseaseName diseaseConfidence geolocation createdAt');

  res.status(200).json({
    status: 'success',
    results: diseases.length,
    data: {
      diseases
    }
  });
}); 