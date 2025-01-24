const mongoose = require("mongoose");

const insurancePolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Policy name is required"],
      trim: true,
    },
    policyNumber: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        "CROP-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    cropSeason: {
      type: String,
      enum: ["kharif", "rabi", "zaid"],
      required: true,
    },
    cropType: {
      type: String,
      enum: [
        "paddy",
        "wheat",
        "cotton",
        "sugarcane",
        "maize",
        "pulses",
        "vegetables",
        "fruits",
        "other",
      ],
      required: true,
    },
    seasonDates: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
        validate: [
          {
            validator: function (value) {
              return this.seasonDates.startDate < value;
            },
            message: "End date must be after start date",
          },
        ],
      },
    },
    premium: {
      type: Number,
      required: true,
      min: 0,
    },
    sumInsured: {
      type: Number,
      required: true,
      min: 0,
    },
    agentFee: {
      type: Number,
      required: true,
      min: 0,
      description: "Fee to be paid to the agent for processing the policy",
    },
    risks: [
      {
        type: String,
        enum: ["drought", "flood", "natural_calamities"],
        required: true,
      },
    ],
    thresholds: {
      temperature: {
        minTemperature: {
          type: Number,
          required: true,
          description: "Minimum temperature in °C to approve the claim",
        },
      },
      rainfall: {
        minRainfall: {
          type: Number,
          required: true,
          description: "Minimum rainfall in mm to approve the claim",
        },
      },
    },
    eligibility: {
      minLandArea: { type: Number, required: true },
      maxLandArea: {
        type: Number,
        required: true,
        validate: {
          validator: function (value) {
            return value >= this.eligibility.minLandArea;
          },
          message:
            "Max land area must be greater than or equal to min land area",
        },
      },
      requiredDocuments: [
        {
          type: String,
          required: true,
        },
      ],
    },
    claimCriteria: [
      {
        damageType: {
          type: String,
          enum: ["crop_loss", "yield_reduction", "quality_damage"],
          required: true,
        },
        minimumDamagePercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        compensationPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],
    regions: [
      {
        state: {
          type: String,
          required: true,
        },
        district: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

insurancePolicySchema.pre("save", function (next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(this.seasonDates.startDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(this.seasonDates.endDate);
  endDate.setHours(0, 0, 0, 0);

  if (today >= startDate && today <= endDate) {
    this.status = "active";
  } else if (today > endDate) {
    this.status = "inactive";
  } else {
    this.status = "draft";
  }

  next();
});

async function updatePolicyStatuses() {
  const today = new Date();

  await InsurancePolicy.updateMany(
    {
      "seasonDates.startDate": {
        $lte: today,
      },
      "seasonDates.endDate": {
        $gte: today,
      },
    },
    { status: "active" }
  );

  await InsurancePolicy.updateMany(
    {
      "seasonDates.endDate": {
        $lt: today,
      },
    },
    { status: "inactive" }
  );
}

const InsurancePolicy = mongoose.model(
  "InsurancePolicy",
  insurancePolicySchema
);

module.exports = { InsurancePolicy, updatePolicyStatuses };
