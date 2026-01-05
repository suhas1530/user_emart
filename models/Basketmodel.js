const mongoose = require("mongoose");

// ================= BASKET SCHEMA =================
const basketItemSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String },
  productDetails: { type: Object },
  variant: { type: Object },
  quantity: { type: Number, default: 1 },
  
  // Member actions
  memberNote: { type: String, default: "" },
  memberMessage: { type: String, default: "" },
  memberMessageTime: { type: Date },
  
  // Admin updates
  status: { 
    type: String, 
    default: "Pending Review",
    enum: [
      "Pending Review",
      "Product available",
      "Product not available",
      "Hold",
      "Processing",
      "Taking 7+ days",
      "Please search another page",
      "Rejected",
      "Not found"
    ]
  },
  adminPrice: { type: Number },
  finalPrice: { type: Number }, // with 18% GST
  adminNote: { type: String, default: "" },
  adminMessage: { type: String, default: "" },
  adminMessageTime: { type: Date },
  
  // Tracking
  requestedForDelivery: { type: Boolean, default: false },
  trackingStatus: { 
    type: String, 
    default: "Not Requested",
    enum: [
      "Not Requested",
      "Requested",
      "Estimation timelines",
      "Will ship tomorrow",
      "On delivery",
      "Arriving today",
      "Arriving tomorrow",
      "Other"
    ]
  },
  trackingNote: { type: String, default: "" },
  
  timestamps: { 
    addedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    priceUpdatedAt: { type: Date },
    trackingUpdatedAt: { type: Date }
  }
});

// ================= TRACKING SCHEMA =================
const trackingSchema = new mongoose.Schema({
  basketItemId: { type: mongoose.Schema.Types.ObjectId, ref: "BasketItem" },
  memberId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String },
  
  // Delivery tracking
  trackingStatus: { 
    type: String, 
    default: "Requested",
    enum: [
      "Requested",
      "Estimation timelines",
      "Will ship tomorrow",
      "On delivery",
      "Arriving today",
      "Arriving tomorrow",
      "Delivered",
      "Other"
    ]
  },
  trackingNote: { type: String, default: "" },
  estimatedDelivery: { type: Date },
  contactNumber: { type: String, default: "6360886843" },
  
  timestamps: { 
    requestedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
  }
});

const BasketItem = mongoose.model("BasketItem", basketItemSchema);
const Tracking = mongoose.model("Tracking", trackingSchema);

module.exports = { BasketItem, Tracking };