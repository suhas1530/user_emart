const mongoose = require("mongoose");

const memberRequestSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  phone: String,
  altPhone: String,
  address: String,
  businessName: String,
  proofFile: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "hold"],
    default: "pending",
  },

  memberEmail: String,
  memberPassword: String,
}, { timestamps: true });

module.exports = mongoose.model("MemberRequest", memberRequestSchema);
