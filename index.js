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
// Configure CORS with specific options for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins for uploads endpoint
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());

// Custom middleware to add CORS headers for static files
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files with proper CORS headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(history());
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
res.sendFile(path.join(__dirname, "dist", "index.html"));
});

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
