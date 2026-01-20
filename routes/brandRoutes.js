const express = require("express");
const router = express.Router();

// Mock Brands Data for Development
// This ensures the frontend has something to load instead of failing
const mockBrands = [
  {
    _id: "brand1",
    brandName: "Local Test Brand",
    products: [
      {
        _id: "prod1",
        productName: "Test Product 1",
        images: ["image1.jpg"],
        variants: [
            { finalPrice: 100 }
        ],
        categoryName: "Test Category",
        subCategoryName: "Test SubCat"
      }
    ]
  }
];

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
