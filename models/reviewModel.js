const mongoose = require("mongoose");

const Crop = require("./cropModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    crop: {
      type: mongoose.Schema.ObjectId,
      ref: "Crop",
      required: [true, "Review must belong to a crop."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user "],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ crop: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  }).populate({
    path: "crop",
    select: "name",
  });
  next();
});
reviewSchema.statics.calcAverageRatings = async function (cropId) {
  const stats = await this.aggregate([
    {
      $match: { crop: cropId },
    },
    {
      $group: {
        _id: "$crop",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Crop.findByIdAndUpdate(cropId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Crop.findByIdAndUpdate(cropId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.crop);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  // console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
