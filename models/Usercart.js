const mongoose = require('mongoose');

const userCartItemSchema = new mongoose.Schema({
  productId:   { type: String, required: true },
  variantId:   { type: String, default: "" },
  productName: { type: String, required: true },
  variantName: { type: String, default: "Standard" },
  image:       { type: String, default: "" },
  price:       { type: Number, required: true },
  quantity:    { type: Number, default: 1, min: 1 },
  weight:      { type: Number, default: null },
  unit:        { type: String, default: "" },
  stock:       { type: Number, default: null },
});

const userCartSchema = new mongoose.Schema({
  userId:    { type: String, required: true, unique: true },
  items:     [userCartItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserCart = mongoose.model('UserCart', userCartSchema);
module.exports = UserCart;