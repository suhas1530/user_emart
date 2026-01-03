// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const Order = require('../models/Order');

// // Get user's orders
// router.get('/myorders', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     const orders = await Order.find({ userId }).sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get order by ID
// router.get('/:orderId', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     const { orderId } = req.params;
    
//     const order = await Order.findOne({ orderId, userId });
//     if (!order) return res.status(404).json({ message: 'Order not found' });
    
//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Save address
// router.put('/:orderId/address', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     const { orderId } = req.params;
//     const addressData = req.body;
    
//     const order = await Order.findOne({ orderId, userId });
//     if (!order) return res.status(404).json({ message: 'Order not found' });
    
//     order.address = addressData;
//     order.status = 'availability_check';
//     order.updatedAt = new Date();
    
//     await order.save();
//     res.json({ message: 'Address saved', order });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Check availability
// router.post('/:orderId/check-availability', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     const { orderId } = req.params;
    
//     const order = await Order.findOne({ orderId, userId });
//     if (!order) return res.status(404).json({ message: 'Order not found' });
    
//     // Check availability logic (you can integrate with external API)
//     order.address.isAvailable = true;
//     order.status = 'payment_pending';
//     order.updatedAt = new Date();
    
//     await order.save();
    
//     // For now, we'll assume everything is available
//     res.json({ 
//       message: 'Availability checked', 
//       isAvailable: true,
//       order 
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Admin: Update product status
// router.put('/admin/:orderId/item/:itemId/status', authMiddleware, async (req, res) => {
//   try {
//     // Check if admin
//     if (req.auth.role !== 'user') {
//       return res.status(403).json({ message: 'Admin access required' });
//     }
    
//     const { orderId, itemId } = req.params;
//     const { status } = req.body;
    
//     const order = await Order.findOne({ orderId });
//     if (!order) return res.status(404).json({ message: 'Order not found' });
    
//     const itemIndex = order.items.findIndex(item => item._id.toString() === itemId);
//     if (itemIndex === -1) return res.status(404).json({ message: 'Item not found' });
    
//     order.items[itemIndex].status = status;
    
//     // Check if all items are available for payment
//     const allAvailable = order.items.every(item => item.status === 'available');
//     if (allAvailable) {
//       order.status = 'payment_pending';
//     }
    
//     order.updatedAt = new Date();
//     await order.save();
    
//     res.json({ message: 'Status updated', order });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Admin: Update order status
// router.put('/admin/:orderId/status', authMiddleware, async (req, res) => {
//   try {
//     if (req.auth.role !== 'user') {
//       return res.status(403).json({ message: 'Admin access required' });
//     }
    
//     const { orderId } = req.params;
//     const { status } = req.body;
    
//     const order = await Order.findOne({ orderId });
//     if (!order) return res.status(404).json({ message: 'Order not found' });
    
//     order.status = status;
//     order.updatedAt = new Date();
//     await order.save();
    
//     res.json({ message: 'Order status updated', order });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Save payment details
// router.post('/:orderId/payment', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     const { orderId } = req.params;
//     const paymentData = req.body;
    
//     const order = await Order.findOne({ orderId, userId });
//     if (!order) return res.status(404).json({ message: 'Order not found' });
    
//     order.payment = {
//       ...paymentData,
//       paymentDate: new Date()
//     };
//     order.status = 'payment_done';
//     order.updatedAt = new Date();
    
//     await order.save();
//     res.json({ message: 'Payment saved', order });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;



//working code



const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// Get user's orders
router.get('/myorders', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId, userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save address
router.put('/:orderId/address', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const { orderId } = req.params;
    const addressData = req.body;
    
    const order = await Order.findOne({ orderId, userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.address = addressData;
    order.status = 'availability_check';
    order.updatedAt = new Date();
    
    await order.save();
    res.json({ message: 'Address saved', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check availability
router.post('/:orderId/check-availability', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId, userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check availability logic (you can integrate with external API)
    order.address.isAvailable = true;
    order.status = 'payment_pending';
    order.updatedAt = new Date();
    
    await order.save();
    
    // For now, we'll assume everything is available
    res.json({ 
      message: 'Availability checked', 
      isAvailable: true,
      order 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product/item status (public access)
router.put('/:orderId/item/:itemId/status', async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const itemIndex = order.items.findIndex(
      item => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    order.items[itemIndex].status = status;

    // If all items available → move to payment_pending
    const allAvailable = order.items.every(
      item => item.status === 'available'
    );
    if (allAvailable) {
      order.status = 'payment_pending';
    }

    order.updatedAt = new Date();
    await order.save();

    res.json({ message: 'Status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// Update order status (public access)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Save payment details
router.post('/:orderId/payment', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const { orderId } = req.params;
    const paymentData = req.body;
    
    const order = await Order.findOne({ orderId, userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.payment = {
      ...paymentData,
      paymentDate: new Date()
    };
    order.status = 'payment_done';
    order.updatedAt = new Date();
    
    await order.save();
    res.json({ message: 'Payment saved', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;