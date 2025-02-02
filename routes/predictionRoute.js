const express = require("express");
const axios = require("axios");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");

const translateMiddleware = require("./../controllers/translationController");
const FLASK_SERVER_URL = "http://127.0.0.1:5000/";
router.use(translateMiddleware);

router.get("/infopredict", (req, res) => {
  const inputData = req.query.data.map(parseFloat);
  axios
    .post(`${FLASK_SERVER_URL}/withinfo_predict_crop`, {
      data: inputData,
    })
    .then((response) => {
      res.json({
        crop: response.data.prediction[0],
        nitrogen: {
          description: response.data.n_desc,
        },
        phosphorus: {
          description: response.data.p_desc,
        },
        potassium: {
          description: response.data.k_desc,
        },
        message: response.data.message,
      });
    })
    .catch((error) => {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Prediction failed" });
    });
});

// Crop prediction route

router.get("/predict", (req, res) => {
  const inputData = req.query.data.map(parseFloat);
  axios
    .post(`${FLASK_SERVER_URL}/predict_crop`, {
      data: inputData,
    })
    .then((response) => {
      const prediction = response.data;
      res.json({ prediction });
    })
    .catch((error) => {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Prediction failed" });
    });
});

// Single crop prediction route
router.get("/singlecrop", (req, res) => {
  const inputData = req.query.data.map(parseFloat);
  axios
    .post(`${FLASK_SERVER_URL}/singlecrop`, {
      data: inputData,
    })
    .then((response) => {
      const prediction = response.data;
      res.json({ prediction });
    })
    .catch((error) => {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Prediction failed" });
    });
});

// Fertilizer prediction route
router.get("/predictfertilizer", (req, res) => {
  const inputData = req.query.data.map(parseFloat);
  axios
    .post(`${FLASK_SERVER_URL}/predict_fertilizer`, {
      data: inputData,
    })
    .then((response) => {
      const prediction = response.data.prediction;
      res.json({ prediction });
    })
    .catch((error) => {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Prediction failed" });
    });
});

const upload = multer(); // No destination specified

router.post(
  "/detect-crop-disease",
  upload.single("image"),
  async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      // Create FormData
      const formData = new FormData();
      formData.append("image", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      // Forward to Flask API
      const response = await axios.post(
        `${FLASK_SERVER_URL}/detect_crop_disease`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      // Send predictions back to client
      res.json(response.data);
    } catch (error) {
      console.error("Crop Disease Detection Error:", error);
      res.status(500).json({
        error: "Crop disease detection failed",
        details: error.message,
      });
    }
  }
);
module.exports = router;
