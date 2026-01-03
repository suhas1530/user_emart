// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const Order = require('../models/Order');

// // Get all orders (admin only)
// router.get('/orders', authMiddleware, async (req, res) => {
//   try {
//     // Check if admin
//     if (req.auth.role !== 'user' && req.auth.role !== 'member') {
//       return res.status(403).json({ message: 'Admin access required' });
//     }

//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get order statistics
// router.get('/stats', authMiddleware, async (req, res) => {
//   try {
//     if (req.auth.role !== 'user' && req.auth.role !== 'member') {
//       return res.status(403).json({ message: 'Admin access required' });
//     }

//     const totalOrders = await Order.countDocuments();
//     const pendingOrders = await Order.countDocuments({ 
//       status: { $in: ['availability_check', 'payment_pending'] } 
//     });
//     const completedOrders = await Order.countDocuments({ 
//       status: { $in: ['payment_done', 'completed'] } 
//     });
    
//     // Revenue from completed orders
//     const revenueResult = await Order.aggregate([
//       { $match: { status: { $in: ['payment_done', 'completed'] } } },
//       { $group: { _id: null, total: { $sum: '$finalAmount' } } }
//     ]);

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });

//     res.json({
//       total: totalOrders,
//       pending: pendingOrders,
//       completed: completedOrders,
//       revenue: revenueResult[0]?.total || 0,
//       todayOrders
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;



//this is working code 


const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// Get all orders (admin only)
// Get all orders (public access)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get order statistics
// Get order statistics (public access)
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({
      status: { $in: ['availability_check', 'payment_pending'] }
    });

    const completedOrders = await Order.countDocuments({
      status: { $in: ['payment_done', 'completed'] }
    });

    // Revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['payment_done', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    res.json({
      total: totalOrders,
      pending: pendingOrders,
      completed: completedOrders,
      revenue: revenueResult[0]?.total || 0,
      todayOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;