const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Get user's cart
router.get('/mycart', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const { productId, variantId, productName, variantName, image, price, weight, unit, stock } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      cart.items.push({
        productId,
        variantId,
        productName,
        variantName,
        image,
        price,
        weight,
        unit,
        stock,
        quantity: 1
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/update/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found' });

    if (quantity < 1) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Item removed', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Move cart to order (start checkout)
// Move cart to order (start checkout)
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const userEmail = req.auth.email;
    const userName = req.auth.username || req.auth.memberName;

    let orderItems = [];
    let subtotal = 0;

    // 1. Check if items are provided in body (Frontend Cart)
    if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
      orderItems = req.body.items.map(item => ({
        ...item,
        status: 'pending'
      }));
      // Calculate subtotal from provided items
      subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    else {
      // 2. Fallback to Backend Cart
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      orderItems = cart.items.map(item => ({
        ...item.toObject(),
        status: 'pending'
      }));
      subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Calculate totals
    // Use amount from body if provided (frontend calculation), else calculate
    const gstAmount = subtotal * 0.18;
    const finalAmount = req.body.amount || (subtotal + gstAmount); // Default fallback

    // Generate order ID
    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    const orderData = {
      orderId,
      userId,
      userName,
      userEmail,
      items: orderItems,
      totalAmount: subtotal,
      gstAmount,
      finalAmount,
      status: 'checkout'
    };

    // 3. Handle Address if provided
    if (req.body.address) {
      orderData.address = req.body.address;
      orderData.status = 'availability_check';
    }

    // Create order
    const order = new Order(orderData);
    await order.save();

    // Clear cart after creating order (if backend cart exists)
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date();
      await cart.save();
    }

    res.json({
      message: 'Order created',
      orderId,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;