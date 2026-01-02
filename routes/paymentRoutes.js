const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const authMiddleware = require('../middleware/authMiddleware');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const options = {
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      amount: amount,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error) {
    console.error('Razorpay error:', error);
    res.status(500).json({ message: 'Payment gateway error' });
  }
});

// Verify payment (webhook)
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment successful
      // Update order status in your database
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

module.exports = router;