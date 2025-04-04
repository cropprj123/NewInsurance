const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.ObjectId,
    ref: "Crop",
    required: [true, "Booking must belong to a Crop!"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a User!"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price."],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
  verificationCode: {
    type: String,
    required: [true, "Booking must have a verification code"],
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  }
});

// Add index for faster verification lookups
bookingSchema.index({ verificationCode: 1 });

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "crop",
    select: "name price image"
  });
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
