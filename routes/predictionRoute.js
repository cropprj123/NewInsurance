const express = require("express");
const axios = require("axios");
const router = express.Router();

const FLASK_SERVER_URL = "http://127.0.0.1:5000/";

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

module.exports = router;
