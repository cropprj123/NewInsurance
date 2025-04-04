const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.ObjectId,
    ref: "Crop",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
