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

    insuranceStatus: {
      type: String,
      enum: ["Pending", "Active", "Expired", "Cancelled"],
      default: "Pending",
    },
    paymentReceived: {
      type: Boolean,
      default: false,
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

farmVisitTrackingSchema.pre("save", async function (next) {
  try {
    const ineligibilityReasons = [];

    const populatedAssignment = await this.model("InsuranceAssignment")
      .findById(this.insuranceAssignment)
      .populate("insurancePolicy");

    if (!populatedAssignment || !populatedAssignment.insurancePolicy) {
      return next(
        new Error(
          "Insurance Assignment or its associated policy could not be found."
        )
      );
    }

    const { insurancePolicy } = populatedAssignment;
    const { landMeasurement } = this.farmDetails;
    const { minLandArea, maxLandArea } = insurancePolicy.eligibility;

    // Validate land measurement
    if (landMeasurement < minLandArea || landMeasurement > maxLandArea) {
      ineligibilityReasons.push("Land area does not meet policy requirements");
    }

    // Additional optional validations you might want to add
    if (this.environmentalConditions) {
      const { temperature, rainfall } = this.environmentalConditions;

      if (temperature < insurancePolicy.thresholds?.temperature?.min) {
        ineligibilityReasons.push("Temperature below policy threshold");
      }

      if (rainfall < insurancePolicy.thresholds?.rainfall?.min) {
        ineligibilityReasons.push("Rainfall below policy threshold");
      }
    }

    // Update eligibility and status
    this.eligibilityAssessment.isEligible = ineligibilityReasons.length === 0;
    this.eligibilityAssessment.ineligibilityReasons = ineligibilityReasons;
    this.status =
      ineligibilityReasons.length === 0 ? "Completed" : "Ineligible";

    next();
  } catch (error) {
    next(error);
  }
});
const FarmVisitTracking = mongoose.model(
  "FarmVisitTracking",
  farmVisitTrackingSchema
);

module.exports = FarmVisitTracking;
