const crypto = require("crypto");

const mongoose = require("mongoose");

const validator = require("validator");

const bcrypt = require("bcryptjs");
const capitalizeWords = (str) => {
  return str ? str.toUpperCase().trim() : str;
};
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
      unique: true,
      validate: {
        validator: function (val) {
          return /^\d{10}$/.test(val);
        },
        message: "Please provide a valid phone number",
      },
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    role: {
      type: String,
      enum: ["farmer", "admin", "agent"],
      default: "farmer",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
      select: false,
    },
    address: {
      street: {
        type: String,
        trim: true,
        set: capitalizeWords,
      },
      city: {
        type: String,
        trim: true,
        set: capitalizeWords,
      },
      district: {
        type: String,
        trim: true,
        set: capitalizeWords,
      },
      state: {
        type: String,
        trim: true,
        set: capitalizeWords,
      },
      pincode: {
        type: String,
        validate: {
          validator: function (val) {
            return /^[1-9][0-9]{5}$/.test(val);
          },
          message: "Please provide a valid 6-digit pincode",
        },
      },
      landmark: {
        type: String,
        trim: true,
        set: capitalizeWords,
      },
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.virtual("policyEnrollments", {
  ref: "PolicyEnrollment",
  foreignField: "farmer",
  localField: "_id",
});
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("Email or phonenumber address already exists"));
  } else {
    next(error);
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
