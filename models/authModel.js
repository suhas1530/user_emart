const mongoose = require("mongoose");

/* ================= USER ================= */
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now }
});

/* ================= MEMBER ================= */
const memberSchema = new mongoose.Schema({
  memberId: { type: String, unique: true, required: true },
  memberName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  businessName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Member = mongoose.model("Member", memberSchema);

module.exports = { User, Member };