// farmVisitTrackingModel.js
const mongoose = require("mongoose");

const farmVisitTrackingSchema = new mongoose.Schema(
  {
    insuranceAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsuranceAssignment",
      required: [true, "Insurance Assignment reference is required"],
    },
    farmVisit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FarmVisit",
      default: null,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    insurancePolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsurancePolicy",
      required: true,
    },
    farmDetails: {
      cropCondition: {
        type: String,
        enum: ["Excellent", "Good", "Fair", "Poor"],
        required: true,
      },
      cropHealth: {
        diseasePresent: {
          type: Boolean,
          default: false,
        },
        diseaseDetails: {
          type: String,
          trim: true,
        },
      },
      landMeasurement: {
        type: Number,
        required: true,
      },
    },
    eligibilityAssessment: {
      isEligible: {
        type: Boolean,
        required: true,
        default: false,
      },
      ineligibilityReasons: [
        {
          type: String,
        },
      ],
    },
    environmentalConditions: {
      temperature: {
        type: Number,
        required: true,
      },
      rainfall: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Ineligible"],
      default: "Pending",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

farmVisitTrackingSchema.pre("save", function (next) {
  const ineligibilityReasons = [];

  if (
    this.farmDetails.landMeasurement <
      this.insurancePolicy.eligibility.minLandArea ||
    this.farmDetails.landMeasurement >
      this.insurancePolicy.eligibility.maxLandArea
  ) {
    ineligibilityReasons.push("Land area does not meet policy requirements");
  }

  //   if (
  //     this.environmentalConditions.temperature <
  //     this.insurancePolicy.thresholds.temperature.minTemperature
  //   ) {
  //     ineligibilityReasons.push("Temperature below policy threshold");
  //   }

  //   if (
  //     this.environmentalConditions.rainfall <
  //     this.insurancePolicy.thresholds.rainfall.minRainfall
  //   ) {
  //     ineligibilityReasons.push("Rainfall below policy threshold");
  //   }

  this.eligibilityAssessment.isEligible = ineligibilityReasons.length === 0;
  this.eligibilityAssessment.ineligibilityReasons = ineligibilityReasons;
  this.status = ineligibilityReasons.length === 0 ? "Completed" : "Ineligible";

  next();
});

const FarmVisitTracking = mongoose.model(
  "FarmVisitTracking",
  farmVisitTrackingSchema
);
