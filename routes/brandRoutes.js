const express = require("express");
const router = express.Router();


router.get("/brands", (req, res) => {
  try {
    // Return mock data
    res.json(mockBrands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
