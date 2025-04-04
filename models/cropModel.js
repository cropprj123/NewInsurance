const mongoose = require("mongoose");
const slugify = require("slugify");

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      unique: true,
      trim: true,
      maxlength: [80, "Max length reached"],
      minlength: [4, "More words or letters required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
    },
    quantity: {
      type: Number,
      required: [true, "You must define the quantity of the product"],
      default: 1,
    },
    type: {
      type: String,
      enum: ["Fertilizer", "Seed", "Crop Protection"],
    },
    variants: {
      type: String,
    },
    subtype: {
      type: String,
      enum: [
        "Nano Fertilizer",
        "Water Soluble Fertilizer",
        "Speciality Fertilizer",
        "Fungicides",
        "Insecticides",
        "Bio Insecticides",
        "field crop seed",
        "vegetable seed",
        "fruit seed",
      ],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    description: {
      type: String,
      // required: [true, "You need to provide a description"],
    },
    soldby: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    usage: {
      type: String,
    },
    storelocation: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Store",
      },
    ],
    reviews: {
      type: Number,
      default: 0,
    },
    slug: String,
    soldout: {
      type: Boolean,
      default: function () {
        return this.quantity === 0; // Set soldout to true if quantity is zero
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cropSchema.index({ slug: 1 });
cropSchema.index({ createdAt: -1 });
cropSchema.index({ name: 1 });

cropSchema.virtual("avgrating").get(function () {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce(
      (acc, rating) => acc + rating.rating,
      0
    );
    return totalRating / this.ratings.length;
  } else {
    return 0;
  }
});

cropSchema.virtual("reviewCount").get(function () {
  if (this.ratings) {
    return this.ratings.length;
  } else {
    return 0;
  }
});

cropSchema.virtual("ratings", {
  ref: "Review",
  foreignField: "crop",
  localField: "_id",
});

cropSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Crop = mongoose.model("Crop", cropSchema);

module.exports = Crop;
