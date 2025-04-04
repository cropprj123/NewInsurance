const mongoose = require("mongoose");

const validator = require("validator");

const slugify = require("slugify");

const emailSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "email is required for the subscription"],
      maxlenth: [80, "no more than this is allowed"],
      minlenght: [1, "more words or letter are required "],
    },
    email: {
      type: String,
      required: [true, "An email is must"],
      unique: true,
      lowercase: true, //this will just transform email to lower case
      //this is from the validator npm
      validate: [validator.isEmail, "please provide a valid email"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;
