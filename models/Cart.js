const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  variantId: { type: String, required: true },
  productName: { type: String, required: true },
  variantName: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  weight: { type: Number },
  unit: { type: String },
  stock: { type: Number }
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;