const mongoose = require("mongoose");

const insurancePremiumPaymentSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Farmer reference is required"],
    },
    farmVisitTracking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FarmVisitTracking",
      required: [true, "Farm Visit Tracking reference is required"],
    },
    insurancePolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsurancePolicy",
    },
    paymentDetails: {
      amount: {
        type: Number,
        required: [true, "Payment amount is required"],
        min: [0, "Payment amount cannot be negative"],
      },
      paymentMethod: {
        type: String,
        enum: ["Online", "Bank Transfer", "Cash", "Cheque"],
        required: [true, "Payment method is required"],
      },
      transactionId: {
        type: String,
        unique: true,
        trim: true,
      },
      status: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending",
      },
    },
    coverageStartDate: {
      type: Date,
      required: [true, "Coverage start date is required"],
    },
    coverageEndDate: {
      type: Date,
      required: [true, "Coverage end date is required"],
    },
  },
  {
    timestamps: true,
  }
);

insurancePremiumPaymentSchema.pre("save", async function (next) {
  if (!this.insurancePolicy) {
    try {
      const farmVisitTracking = await this.model("FarmVisitTracking")
        .findById(this.farmVisitTracking)
        .populate({
          path: "insuranceAssignment",
          populate: {
            path: "insurancePolicy",
          },
        });

      if (!farmVisitTracking || !farmVisitTracking.insuranceAssignment) {
        return next(
          new Error("Could not find associated insurance assignment")
        );
      }

      // Set the insurance policy
      this.insurancePolicy =
        farmVisitTracking.insuranceAssignment.insurancePolicy._id;

      // Set payment amount if not already set
      if (!this.paymentDetails.amount) {
        this.paymentDetails.amount =
          farmVisitTracking.insuranceAssignment.insurancePolicy.premium;
      }

      // Set coverage dates if not already set
      if (!this.coverageStartDate) {
        this.coverageStartDate = new Date();
      }
      if (!this.coverageEndDate) {
        this.coverageEndDate = new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        );
      }

      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

insurancePremiumPaymentSchema.pre("save", async function (next) {
  try {
    if (this.paymentDetails.status === "Completed") {
      await this.model("FarmVisitTracking").findByIdAndUpdate(
        this.farmVisitTracking,
        {
          $set: {
            insuranceStatus: "Active",
            paymentReceived: true,
          },
        }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

const InsurancePremiumPayment = mongoose.model(
  "InsurancePremiumPayment",
  insurancePremiumPaymentSchema
);

module.exports = InsurancePremiumPayment;
