// const express = require("express");
// const router = express.Router();
// const { BasketItem, Tracking } = require("../models/Basketmodel");
// const { Member } = require("../models/authModel"); // Import Member from existing model

// // ================= BASKET ROUTES =================

// // Add item to basket
// router.post("/basket/add", async (req, res) => {
//   try {
//     const { memberId, productId, productName, productImage, productDetails, variant } = req.body;
    
//     const basketItem = new BasketItem({
//       memberId,
//       productId,
//       productName,
//       productImage,
//       productDetails,
//       variant,
//       status: "Pending Review"
//     });
    
//     await basketItem.save();
    
//     // Update member stats
//     await Member.findOneAndUpdate(
//       { memberId },
//       { $inc: { totalBasketItems: 1, pendingReviews: 1 } },
//       { new: true, upsert: false }
//     );
    
//     res.json({ success: true, message: "Added to basket", item: basketItem });
//   } catch (error) {
//     console.error("Error adding to basket:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get member basket
// router.get("/basket/:memberId", async (req, res) => {
//   try {
//     const items = await BasketItem.find({ memberId: req.params.memberId });
//     res.json({ success: true, items });
//   } catch (error) {
//     console.error("Error fetching basket:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Add member note/message
// router.post("/basket/note", async (req, res) => {
//   try {
//     const { itemId, memberNote, memberMessage } = req.body;
    
//     const update = {
//       memberNote,
//       memberMessage,
//       memberMessageTime: new Date()
//     };
    
//     const item = await BasketItem.findByIdAndUpdate(
//       itemId,
//       update,
//       { new: true }
//     );
    
//     res.json({ success: true, item });
//   } catch (error) {
//     console.error("Error adding note:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Request availability check
// router.post("/basket/check-availability/:itemId", async (req, res) => {
//   try {
//     const item = await BasketItem.findByIdAndUpdate(
//       req.params.itemId,
//       { 
//         status: "Processing",
//         $set: { "timestamps.reviewedAt": new Date() }
//       },
//       { new: true }
//     );
    
//     res.json({ 
//       success: true, 
//       message: "Basava Mart is checking availability. Please wait.",
//       item 
//     });
//   } catch (error) {
//     console.error("Error checking availability:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Request delivery
// router.post("/basket/request-delivery/:itemId", async (req, res) => {
//   try {
//     const item = await BasketItem.findByIdAndUpdate(
//       req.params.itemId,
//       { 
//         requestedForDelivery: true,
//         trackingStatus: "Requested"
//       },
//       { new: true }
//     );
    
//     // Create tracking record
//     const tracking = new Tracking({
//       basketItemId: item._id,
//       memberId: item.memberId,
//       productName: item.productName,
//       productImage: item.productImage,
//       trackingStatus: "Requested"
//     });
    
//     await tracking.save();
    
//     res.json({ success: true, message: "Delivery requested", item, tracking });
//   } catch (error) {
//     console.error("Error requesting delivery:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ================= ADMIN ROUTES =================

// // Get all basket items for admin
// router.get("/admin/basket-items", async (req, res) => {
//   try {
//     const items = await BasketItem.find().sort({ "timestamps.addedAt": -1 });
//     res.json({ success: true, items });
//   } catch (error) {
//     console.error("Error fetching basket items:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Update product status and price (admin)
// router.post("/admin/update-product", async (req, res) => {
//   try {
//     const { itemId, status, adminPrice, adminNote, adminMessage } = req.body;
    
//     let finalPrice = adminPrice;
//     if (adminPrice) {
//       finalPrice = adminPrice * 1.18; // Add 18% GST
//     }
    
//     const update = {
//       status,
//       adminPrice,
//       finalPrice,
//       adminNote,
//       adminMessage,
//       adminMessageTime: new Date(),
//       $set: { "timestamps.priceUpdatedAt": new Date() }
//     };
    
//     const item = await BasketItem.findByIdAndUpdate(
//       itemId,
//       update,
//       { new: true }
//     );
    
//     res.json({ success: true, item });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get all members with stats (admin)
// router.get("/admin/members", async (req, res) => {
//   try {
//     const members = await Member.find().sort({ createdAt: -1 });
//     const basketItems = await BasketItem.find();
    
//     // Add basket stats to members
//     const membersWithStats = await Promise.all(members.map(async (member) => {
//       const memberItems = basketItems.filter(item => item.memberId === member.memberId);
//       const pending = memberItems.filter(item => item.status === "Pending Review").length;
      
//       // Update member with stats in database
//       await Member.findByIdAndUpdate(
//         member._id,
//         {
//           totalBasketItems: memberItems.length,
//           pendingReviews: pending,
//           totalOrders: memberItems.filter(item => item.requestedForDelivery).length
//         },
//         { new: true }
//       );
      
//       return {
//         ...member.toObject(),
//         basketCount: memberItems.length,
//         pendingReviews: pending,
//         deliveryRequests: memberItems.filter(item => item.requestedForDelivery).length
//       };
//     }));
    
//     res.json({ success: true, members: membersWithStats });
//   } catch (error) {
//     console.error("Error fetching members:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Update tracking status (admin)
// router.post("/admin/update-tracking", async (req, res) => {
//   try {
//     const { trackingId, trackingStatus, trackingNote, estimatedDelivery } = req.body;
    
//     const update = {
//       trackingStatus,
//       trackingNote,
//       estimatedDelivery,
//       lastUpdated: new Date()
//     };
    
//     const tracking = await Tracking.findByIdAndUpdate(
//       trackingId,
//       update,
//       { new: true }
//     );
    
//     // Also update basket item
//     if (tracking && tracking.basketItemId) {
//       await BasketItem.findByIdAndUpdate(
//         tracking.basketItemId,
//         {
//           trackingStatus,
//           trackingNote,
//           $set: { "timestamps.trackingUpdatedAt": new Date() }
//         },
//         { new: true }
//       );
//     }
    
//     res.json({ success: true, tracking });
//   } catch (error) {
//     console.error("Error updating tracking:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get all tracking items (admin)
// router.get("/admin/tracking", async (req, res) => {
//   try {
//     const trackingItems = await Tracking.find()
//       .populate("basketItemId")
//       .sort({ "timestamps.lastUpdated": -1 });
    
//     res.json({ success: true, trackingItems });
//   } catch (error) {
//     console.error("Error fetching tracking:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });



// // Add to BasketRoutes.js

// // Get member details by memberId
// router.get("/admin/member-details/:memberId", async (req, res) => {
//   try {
//     const { memberId } = req.params;
    
//     // Find member by memberId (not _id)
//     const member = await Member.findOne({ memberId });
    
//     if (!member) {
//       // Try to find by _id as fallback
//       const memberById = await Member.findById(memberId);
//       if (!memberById) {
//         return res.status(404).json({ 
//           success: false, 
//           error: "Member not found" 
//         });
//       }
//       return res.json({ success: true, member: memberById });
//     }
    
//     res.json({ success: true, member });
//   } catch (error) {
//     console.error("Error fetching member details:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });
// // Add to BasketRoutes.js

// // Get members who have basket items with their details
// router.get("/admin/members-with-basket", async (req, res) => {
//   try {
//     // Get all basket items
//     const basketItems = await BasketItem.find();
    
//     // Get unique memberIds from basket items
//     const uniqueMemberIds = [...new Set(basketItems.map(item => item.memberId))];
    
//     // Fetch member details for each unique memberId
//     const membersWithDetails = await Promise.all(
//       uniqueMemberIds.map(async (memberId) => {
//         // Find member by memberId
//         const member = await Member.findOne({ memberId });
        
//         if (member) {
//           // Get member's basket items
//           const memberItems = basketItems.filter(item => item.memberId === memberId);
//           const pending = memberItems.filter(item => item.status === "Pending Review").length;
          
//           // Add basket stats to member object
//           return {
//             ...member.toObject(),
//             totalBasketItems: memberItems.length,
//             pendingReviews: pending,
//             createdAt: member.createdAt || new Date()
//           };
//         }
//         return null;
//       })
//     );
    
//     // Filter out null values and sort by most recent basket activity
//     const validMembers = membersWithDetails.filter(member => member !== null);
//     validMembers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
//     res.json({ success: true, members: validMembers });
//   } catch (error) {
//     console.error("Error fetching members with basket:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get member details by memberId (already exists, but ensure it's there)
// router.get("/admin/member-details/:memberId", async (req, res) => {
//   try {
//     const { memberId } = req.params;
    
//     // Find member by memberId
//     const member = await Member.findOne({ memberId });
    
//     if (!member) {
//       return res.status(404).json({ 
//         success: false, 
//         error: "Member not found" 
//       });
//     }
    
//     res.json({ success: true, member });
//   } catch (error) {
//     console.error("Error fetching member details:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });
// // Get tracking for specific member (member panel)
// router.get("/tracking/member/:memberId", async (req, res) => {
//   try {
//     const basketItems = await BasketItem.find({ 
//       memberId: req.params.memberId,
//       requestedForDelivery: true 
//     }).sort({ "timestamps.trackingUpdatedAt": -1 });
    
//     res.json({ success: true, items: basketItems });
//   } catch (error) {
//     console.error("Error fetching member tracking:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// module.exports = router;





const express = require("express");
const router = express.Router();
const { BasketItem, Tracking } = require("../models/Basketmodel");
const { Member } = require("../models/authModel");

// ================= BASKET ROUTES =================

// Add item to basket
router.post("/basket/add", async (req, res) => {
  try {
    const { memberId, productId, productName, productImage, productDetails, variant } = req.body;
    
    const basketItem = new BasketItem({
      memberId,
      productId,
      productName,
      productImage,
      productDetails,
      variant,
      status: "Pending Review"
    });
    
    await basketItem.save();
    
    // Update member stats
    await Member.findOneAndUpdate(
      { memberId },
      { $inc: { totalBasketItems: 1, pendingReviews: 1 } },
      { new: true, upsert: false }
    );
    
    res.json({ success: true, message: "Added to basket", item: basketItem });
  } catch (error) {
    console.error("Error adding to basket:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get member basket
router.get("/basket/:memberId", async (req, res) => {
  try {
    const items = await BasketItem.find({ memberId: req.params.memberId });
    res.json({ success: true, items });
  } catch (error) {
    console.error("Error fetching basket:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add member note/message
router.post("/basket/note", async (req, res) => {
  try {
    const { itemId, memberNote, memberMessage } = req.body;
    
    const update = {
      memberNote,
      memberMessage,
      memberMessageTime: new Date()
    };
    
    const item = await BasketItem.findByIdAndUpdate(
      itemId,
      update,
      { new: true }
    );
    
    res.json({ success: true, item });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Request availability check
router.post("/basket/check-availability/:itemId", async (req, res) => {
  try {
    const item = await BasketItem.findByIdAndUpdate(
      req.params.itemId,
      { 
        status: "Processing",
        $set: { "timestamps.reviewedAt": new Date() }
      },
      { new: true }
    );
    
    res.json({ 
      success: true, 
      message: "Basava Mart is checking availability. Please wait.",
      item 
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Request delivery
router.post("/basket/request-delivery/:itemId", async (req, res) => {
  try {
    const item = await BasketItem.findByIdAndUpdate(
      req.params.itemId,
      { 
        requestedForDelivery: true,
        trackingStatus: "Requested"
      },
      { new: true }
    );
    
    // Create tracking record
    const tracking = new Tracking({
      basketItemId: item._id,
      memberId: item.memberId,
      productName: item.productName,
      productImage: item.productImage,
      trackingStatus: "Requested"
    });
    
    await tracking.save();
    
    res.json({ success: true, message: "Delivery requested", item, tracking });
  } catch (error) {
    console.error("Error requesting delivery:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================= ADMIN ROUTES =================

// Get all basket items for admin
router.get("/admin/basket-items", async (req, res) => {
  try {
    const items = await BasketItem.find().sort({ "timestamps.addedAt": -1 });
    res.json({ success: true, items });
  } catch (error) {
    console.error("Error fetching basket items:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update product status and price (admin)
router.post("/admin/update-product", async (req, res) => {
  try {
    const { itemId, status, adminPrice, adminNote, adminMessage } = req.body;
    
    let finalPrice = adminPrice;
    if (adminPrice) {
      finalPrice = adminPrice * 1.18; // Add 18% GST
    }
    
    const update = {
      status,
      adminPrice,
      finalPrice,
      adminNote,
      adminMessage,
      adminMessageTime: new Date(),
      $set: { "timestamps.priceUpdatedAt": new Date() }
    };
    
    const item = await BasketItem.findByIdAndUpdate(
      itemId,
      update,
      { new: true }
    );
    
    res.json({ success: true, item });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all members (admin) - REMOVE THIS OR KEEP BUT FIX
router.get("/admin/members", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    const basketItems = await BasketItem.find();
    
    // Add basket stats to members
    const membersWithStats = await Promise.all(members.map(async (member) => {
      const memberItems = basketItems.filter(item => item.memberId === member.memberId);
      const pending = memberItems.filter(item => item.status === "Pending Review").length;
      
      // Update member with stats in database
      await Member.findByIdAndUpdate(
        member._id,
        {
          totalBasketItems: memberItems.length,
          pendingReviews: pending,
          totalOrders: memberItems.filter(item => item.requestedForDelivery).length
        },
        { new: true }
      );
      
      return {
        ...member.toObject(),
        basketCount: memberItems.length,
        pendingReviews: pending,
        deliveryRequests: memberItems.filter(item => item.requestedForDelivery).length
      };
    }));
    
    res.json({ success: true, members: membersWithStats });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update tracking status (admin)
router.post("/admin/update-tracking", async (req, res) => {
  try {
    const { trackingId, trackingStatus, trackingNote, estimatedDelivery } = req.body;
    
    const update = {
      trackingStatus,
      trackingNote,
      estimatedDelivery,
      lastUpdated: new Date()
    };
    
    const tracking = await Tracking.findByIdAndUpdate(
      trackingId,
      update,
      { new: true }
    );
    
    // Also update basket item
    if (tracking && tracking.basketItemId) {
      await BasketItem.findByIdAndUpdate(
        tracking.basketItemId,
        {
          trackingStatus,
          trackingNote,
          $set: { "timestamps.trackingUpdatedAt": new Date() }
        },
        { new: true }
      );
    }
    
    res.json({ success: true, tracking });
  } catch (error) {
    console.error("Error updating tracking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all tracking items (admin)
router.get("/admin/tracking", async (req, res) => {
  try {
    const trackingItems = await Tracking.find()
      .populate("basketItemId")
      .sort({ "timestamps.lastUpdated": -1 });
    
    res.json({ success: true, trackingItems });
  } catch (error) {
    console.error("Error fetching tracking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================= NEW ENDPOINTS FOR MEMBER MANAGEMENT =================

// Get members who have basket items with their details
router.get("/admin/members-with-basket", async (req, res) => {
  try {
    // Get all basket items
    const basketItems = await BasketItem.find();
    
    // Get unique memberIds from basket items
    const uniqueMemberIds = [...new Set(basketItems.map(item => item.memberId))];
    
    // Fetch member details for each unique memberId
    const membersWithDetails = await Promise.all(
      uniqueMemberIds.map(async (memberId) => {
        // Find member by memberId
        const member = await Member.findOne({ memberId });
        
        if (member) {
          // Get member's basket items
          const memberItems = basketItems.filter(item => item.memberId === memberId);
          const pending = memberItems.filter(item => item.status === "Pending Review").length;
          
          // Add basket stats to member object
          return {
            ...member.toObject(),
            totalBasketItems: memberItems.length,
            pendingReviews: pending,
            deliveryRequests: memberItems.filter(item => item.requestedForDelivery).length,
            createdAt: member.createdAt || new Date()
          };
        }
        return null;
      })
    );
    
    // Filter out null values and sort by most recent basket activity
    const validMembers = membersWithDetails.filter(member => member !== null);
    validMembers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ success: true, members: validMembers });
  } catch (error) {
    console.error("Error fetching members with basket:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get member details by memberId (SINGLE DEFINITION - REMOVED DUPLICATE)
router.get("/admin/member-details/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // console.log("Fetching member details for:", memberId);
    
    // Try to find by memberId first
    let member = await Member.findOne({ memberId });
    
    if (!member) {
      // Try to find by _id as fallback
      member = await Member.findById(memberId);
      
      if (!member) {
        // console.log("Member not found with memberId or _id:", memberId);
        return res.status(404).json({ 
          success: false, 
          error: "Member not found" 
        });
      }
    }
    
    // console.log("Found member:", member.memberName);
    
    // Get member's basket items for stats
    const basketItems = await BasketItem.find({ memberId: member.memberId });
    const pending = basketItems.filter(item => item.status === "Pending Review").length;
    
    const memberWithStats = {
      ...member.toObject(),
      totalBasketItems: basketItems.length,
      pendingReviews: pending,
      deliveryRequests: basketItems.filter(item => item.requestedForDelivery).length
    };
    
    res.json({ success: true, member: memberWithStats });
  } catch (error) {
    console.error("Error fetching member details:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tracking for specific member (member panel)
router.get("/tracking/member/:memberId", async (req, res) => {
  try {
    const basketItems = await BasketItem.find({ 
      memberId: req.params.memberId,
      requestedForDelivery: true 
    }).sort({ "timestamps.trackingUpdatedAt": -1 });
    
    res.json({ success: true, items: basketItems });
  } catch (error) {
    console.error("Error fetching member tracking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get basket count for member
router.get("/basket/count/:memberId", async (req, res) => {
  try {
    const count = await BasketItem.countDocuments({ memberId: req.params.memberId });
    res.json({ success: true, count });
  } catch (error) {
    console.error("Error fetching basket count:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});



// Add these routes to your basketRoutes.js file

// Update quantity
router.put("/basket/update-quantity/:itemId", async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        error: "Quantity must be at least 1" 
      });
    }
    
    const item = await BasketItem.findByIdAndUpdate(
      req.params.itemId,
      { quantity },
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: "Item not found" 
      });
    }
    
    res.json({ success: true, item });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove item from basket (ADD THIS - it was missing in your code)
router.delete("/basket/remove/:itemId", async (req, res) => {
  try {
    const item = await BasketItem.findByIdAndDelete(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: "Item not found" 
      });
    }
    
    // Update member stats
    await Member.findOneAndUpdate(
      { memberId: item.memberId },
      { $inc: { totalBasketItems: -1 } },
      { new: true }
    );
    
    res.json({ 
      success: true, 
      message: "Item removed from basket" 
    });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;