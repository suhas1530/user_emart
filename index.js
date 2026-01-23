const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const basketRoutes = require('./routes/BasketRoutes')
const brandRoutes = require('./routes/brandRoutes');


const app = express();

// ================= Middleware =================
app.use(cors());
app.use(express.json());



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);


// app.use(history());
// app.use(express.static(path.join(__dirname, "dist")));
// app.get("*", (req, res) => {
//  res.sendFile(path.join(__dirname, "dist", "index.html"));
//  });

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
app.use('/api/payment', paymentRoutes);

app.use('/api', basketRoutes);
app.use('/api', brandRoutes);

// ================= Basic Test Route =================
app.get("/", (req, res) => {
  res.json({ message: "BasavaMart API is running" });
});

// ================= Start Server =================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
