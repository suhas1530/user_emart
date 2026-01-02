const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');


const app = express();

// ================= Middleware =================
app.use(cors());
app.use(express.json());

// ================= Database Connection =================
const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://basavaamart:BasavaMart123@basavamart.13lfydm.mongodb.net/BasavaMart?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// ================= Routes =================
app.use("/api/auth", authRoutes);
app.use("/api/member", require("./routes/memberRoutes"));

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// ================= Basic Test Route =================
app.get("/", (req, res) => {
  res.json({ message: "BasavaMart API is running" });
});

// ================= Start Server =================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
