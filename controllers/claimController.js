const { isPointWithinRadius, getDistance } = require("geolib");
const PolicyEnrollment = require("../models/farmvisitTrackingModel");
const Claim = require("../models/claimModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const axios = require("axios");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const blockchainService = require("../services/blockchainService");
const exifr = require("exifr");
const fs = require("fs");
const path = require("path");

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload an image.", 400));
  }
};

const storage = multer.memoryStorage();

exports.upload = multer({
  storage,
  fileFilter: multerFilter,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=b317a07404e3fc77db556222127779ba`
    );

    const tempKelvin = response.data.main.temp;
    const tempCelsius = tempKelvin - 273.15;
    const humidity = response.data.main.humidity;

    let rainfall = 0;
    if (response.data.rain) {
      rainfall = response.data.rain["1h"] || response.data.rain["3h"] || 0;
    }

    return {
      temperature: tempCelsius,
      humidity,
      rainfall,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    return {
      temperature: null,
      humidity: null,
      rainfall: null,
    };
  }
};

const checkWeatherThresholds = (weatherData, cropThresholds) => {
  const thresholdResults = {
    temperatureMinExceeded: false,
    rainfallMaxExceeded: false,
    thresholdSatisfied: false,
    notes: [],
  };

  if (weatherData.temperature !== null) {
    if (weatherData.temperature < cropThresholds.temperature.minTemperature) {
      thresholdResults.temperatureMinExceeded = true;
      thresholdResults.notes.push(
        `Temperature (${weatherData.temperature.toFixed(
          1
        )}°C) is below minimum threshold of ${
          cropThresholds.temperature.minTemperature
        }°C.`
      );
    } else {
      thresholdResults.notes.push(
        `Temperature (${weatherData.temperature.toFixed(
          1
        )}°C) is not below minimum threshold of ${
          cropThresholds.temperature.minTemperature
        }°C.`
      );
    }
  } else {
    thresholdResults.notes.push(
      "Unable to verify temperature due to missing data."
    );
  }

  if (weatherData.rainfall !== null) {
    if (weatherData.rainfall > cropThresholds.rainfall.maxRainfall) {
      thresholdResults.rainfallMaxExceeded = true;
      thresholdResults.notes.push(
        `Rainfall (${weatherData.rainfall}mm) is above maximum threshold of ${cropThresholds.rainfall.maxRainfall}mm.`
      );
    } else {
      thresholdResults.notes.push(
        `Rainfall (${weatherData.rainfall}mm) is not above maximum threshold of ${cropThresholds.rainfall.maxRainfall}mm.`
      );
    }
  } else {
    thresholdResults.notes.push(
      "Unable to verify rainfall due to missing data."
    );
  }

  thresholdResults.thresholdSatisfied =
    thresholdResults.temperatureMinExceeded ||
    thresholdResults.rainfallMaxExceeded;

  return thresholdResults;
};

exports.createClaim = catchAsync(async (req, res, next) => {
  const { policyEnrollmentId } = req.params;
  const { geolocation } = req.body;

  if (
    !geolocation?.coordinates ||
    !Array.isArray(geolocation.coordinates) ||
    geolocation.coordinates.length !== 2
  ) {
    return next(new AppError("Valid geolocation coordinates required", 400));
  }

  const policyEnrollment = await PolicyEnrollment.findById(policyEnrollmentId);
  if (!policyEnrollment) {
    return next(new AppError("Policy enrollment not found", 404));
  }

  const farmGeo = policyEnrollment.farmDetails?.geolocation;
  const farmRadius = policyEnrollment.farmDetails?.radius;
  if (!farmGeo?.coordinates || typeof farmRadius !== "number") {
    return next(new AppError("Invalid farm location data in policy", 400));
  }

  const [farmLon, farmLat] = farmGeo.coordinates;
  const [claimLon, claimLat] = geolocation.coordinates;

  const isWithinFarm = isPointWithinRadius(
    { latitude: claimLat, longitude: claimLon },
    { latitude: farmLat, longitude: farmLon },
    farmRadius
  );

  const distance = getDistance(
    { latitude: claimLat, longitude: claimLon },
    { latitude: farmLat, longitude: farmLon }
  );

  const weatherData = await getWeatherData(farmLat, farmLon);

  console.log("Today's Weather Data:");
  console.log(`Temperature: ${weatherData.temperature?.toFixed(1)}°C`);
  console.log(`Humidity: ${weatherData.humidity}%`);
  console.log(`Rainfall: ${weatherData.rainfall} mm`);

  const crops = policyEnrollment.cropDetails.flatMap(
    (category) => category.crops
  );
  if (!crops || !crops.length) {
    return next(new AppError("No crops found in policy enrollment", 400));
  }

  const cropThresholds = crops[0].thresholds;
  const cropType = crops[0].cropType;

  const thresholdResults = checkWeatherThresholds(weatherData, cropThresholds);

  let status = "rejected";
  let statusReason = "";

  if (!isWithinFarm) {
    statusReason =
      "Location verification failed. User is not within farm boundaries.";
  } else if (!thresholdResults.thresholdSatisfied) {
    statusReason =
      "No weather thresholds were satisfied. Need either temperature below minimum or rainfall above maximum.";
  } else {
    status = "approved";
    statusReason =
      "User is within farm boundaries and at least one weather threshold is satisfied.";
  }

  const timestamp = new Date().toISOString();

  let detailedNote = `Claim Report for ${cropType} | ${timestamp} | Location: ${
    isWithinFarm ? "PASSED" : "FAILED"
  } (Distance: ${distance}m, Radius: ${farmRadius}m) | Weather: Temp ${weatherData.temperature?.toFixed(
    1
  )}°C, Rain ${weatherData.rainfall}mm | Thresholds: Min Temp ${
    cropThresholds.temperature.minTemperature
  }°C (${thresholdResults.temperatureMinExceeded ? "✔" : "✘"}), Max Rain ${
    cropThresholds.rainfall.maxRainfall
  }mm (${
    thresholdResults.rainfallMaxExceeded ? "✔" : "✘"
  }) | Decision: ${status.toUpperCase()} | Reason: ${statusReason}`;

  let existingClaim = await Claim.findOne({ policyEnrollmentId });

  const photoUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: "cropinsurance/claim",
        }
      );
      photoUrls.push(result.secure_url);
    }
  }

  if (existingClaim) {
    if (existingClaim.status === "approved") {
      return next(
        new AppError("Claim already approved. Cannot submit again.", 400)
      );
    }

    existingClaim.geolocation = {
      type: "Point",
      coordinates: [claimLon, claimLat],
    };
    existingClaim.status = status;
    existingClaim.note = detailedNote;
    existingClaim.updatedAt = timestamp;
    existingClaim.weatherData = weatherData;
    existingClaim.thresholdResults = thresholdResults;
    existingClaim.farmer = req.user.id;
    existingClaim.photos = photoUrls;

    await existingClaim.save();
    return res.status(200).json({
      message: "Existing claim updated successfully",
      claim: existingClaim,
      currentWeather: weatherData,
      thresholdResults: thresholdResults,
    });
  } else {
    const claim = await Claim.create({
      policyEnrollmentId,
      farmer: req.user.id,
      geolocation: {
        type: "Point",
        coordinates: [claimLon, claimLat],
      },
      status,
      note: detailedNote,
      weatherData: weatherData,
      thresholdResults: thresholdResults,
      photos: photoUrls,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return res.status(201).json({
      message: "New claim created successfully",
      claim,
      currentWeather: weatherData,
      thresholdResults: thresholdResults,
    });
  }
});

exports.getMyClaims = catchAsync(async (req, res, next) => {
  const farmerId = req.user.id;

  const claims = await Claim.find({ farmer: farmerId }).populate(
    "policyEnrollmentId"
  );

  res.status(200).json({
    status: "success",
    results: claims.length,
    data: {
      claims,
    },
  });
});

exports.getFarmerClaimStatus = catchAsync(async (req, res, next) => {
  const farmerId = req.user.id;
  const { status } = req.params;

  if (!["approved", "rejected"].includes(status)) {
    return next(
      new AppError("Invalid status. Use 'approved' or 'rejected'.", 400)
    );
  }

  const claims = await Claim.find({ farmer: farmerId, status }).populate(
    "policyEnrollmentId"
  );

  res.status(200).json({
    status: "success",
    results: claims.length,
    data: {
      claims,
    },
  });
});

exports.getAllClaims = catchAsync(async (req, res, next) => {
  const claims = await Claim.find().populate("policyEnrollmentId");

  res.status(200).json({
    status: "success",
    results: claims.length,
    data: {
      claims,
    },
  });
});
exports.getAdminClaimStatus = catchAsync(async (req, res, next) => {
  const { status } = req.params;

  if (!["approved", "rejected"].includes(status)) {
    return next(
      new AppError("Invalid status. Use 'approved' or 'rejected'.", 400)
    );
  }

  const claims = await Claim.find({ status }).populate("policyEnrollmentId");

  res.status(200).json({
    status: "success",
    results: claims.length,
    data: {
      claims,
    },
  });
});
// class ClaimController {
//   async processClaim(req, res) {
//     try {
//       const { policyId, images } = req.body;
//       const farmerAddress = req.user.address; // Assuming user's address is stored in the request

//       // 1. Extract metadata from images
//       const metadata = await this.extractMetadata(images);

//       // 2. Get location from metadata
//       const location = {
//         latitude: metadata.latitude,
//         longitude: metadata.longitude,
//       };

//       // 3. Get weather data
//       const weatherData = await this.getWeatherData(location);

//       // 4. Get threshold value from blockchain
//       const policy = await blockchainService.getPolicy(policyId);
//       const thresholdValue = policy.thresholdValue;

//       // 5. Compare weather data with threshold
//       const weatherValue = this.calculateWeatherValue(weatherData);
//       const isEligible = weatherValue >= thresholdValue;

//       // 6. Submit claim to blockchain
//       const claimId = await blockchainService.submitClaim(
//         policyId,
//         weatherValue,
//         process.env.ADMIN_PRIVATE_KEY
//       );

//       // 7. Process the claim
//       await blockchainService.processClaim(
//         claimId,
//         process.env.ADMIN_PRIVATE_KEY
//       );

//       // 8. Get final claim status
//       const claim = await blockchainService.getClaim(claimId);

//       res.status(200).json({
//         success: true,
//         data: {
//           claimId,
//           weatherValue,
//           thresholdValue,
//           isEligible,
//           status: claim.status,
//         },
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   }

//   async extractMetadata(images) {
//     const metadata = {
//       latitude: null,
//       longitude: null,
//       timestamp: null,
//     };

//     for (const image of images) {
//       try {
//         const imagePath = path.join(__dirname, "../uploads", image.filename);
//         const exifData = await exifr.parse(imagePath);

//         if (exifData && exifData.latitude && exifData.longitude) {
//           metadata.latitude = exifData.latitude;
//           metadata.longitude = exifData.longitude;
//           metadata.timestamp = exifData.DateTimeOriginal;
//           break;
//         }
//       } catch (error) {
//         console.error("Error extracting metadata:", error);
//       }
//     }

//     return metadata;
//   }

//   async getWeatherData(location) {
//     try {
//       const response = await axios.get(
//         "https://api.openweathermap.org/data/2.5/weather",
//         {
//           params: {
//             lat: location.latitude,
//             lon: location.longitude,
//             appid: process.env.OPENWEATHER_API_KEY,
//             units: "metric",
//           },
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error("Error fetching weather data:", error);
//       throw error;
//     }
//   }

//   calculateWeatherValue(weatherData) {
//     // This is a simplified example. You might want to consider multiple factors
//     // like temperature, humidity, rainfall, etc.
//     return weatherData.main.temp;
//   }
// }

// module.exports = new ClaimController();
