const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Store must have name"],
    },
    address: {
      type: String,
      required: [true, "store must have the address"],
    },
    phonenumber: {
      type: Number,
      maxlength: [11, "Max length reached"],
      minlength: [10, "More words or letters required"],
    },
    locations: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
