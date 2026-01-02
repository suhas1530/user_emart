const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: String,
  variantId: String,
  productName: String,
  variantName: String,
  image: String,
  price: Number,
  quantity: Number,
  weight: Number,
  unit: String,
  status: { 
    type: String, 
    enum: ['pending', 'available', 'not_available', 'delayed', 'hold', 'processing', 'delivered', 'cancelled', 'returning'],
    default: 'pending'
  }
});

const addressSchema = new mongoose.Schema({
  phone: String,
  alternatePhone: String,
  address: String,
  deliveryAddress: String,
  pincode: String,
  city: String,
  state: String,
  isAvailable: { type: Boolean, default: false }
});

const paymentSchema = new mongoose.Schema({
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: Number,
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  paymentDate: Date
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  userName: String,
  userEmail: String,
  items: [orderItemSchema],
  address: addressSchema,
  payment: paymentSchema,
  totalAmount: Number,
  gstAmount: Number,
  finalAmount: Number,
  status: { 
    type: String, 
    enum: ['cart', 'checkout', 'availability_check', 'payment_pending', 'payment_done', 'processing', 'completed'],
    default: 'cart'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;