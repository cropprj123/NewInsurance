const mongoose = require("mongoose");

const prediction = new mongoose.Schema(
  {
    nitrogen: {
      type: Number,
      required: [true, "Nitrogen amoun to be mentioned "],
    },
    p: {
      type: Number,
      required: [true, "P value is required"],
    },
    k: {
      type: Number,
      required: [true, "K value is required"],
    },
    temperature: {
      type: Number,
      required: [true, "Temperature must be mentioned"],
    },
    humidity: {
      type: Number,
      required: [true, "humidity is required"],
    },
    ph: {
      type: Number,
      required: [true, "ph is required"],
    },
    rainfall: {
      type: Number,
      required: [true, "rainfall amount is required"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const predictions = mongoose.model("Predict", prediction);

module.exports = predictions;
