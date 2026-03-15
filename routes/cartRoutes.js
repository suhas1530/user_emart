// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const Cart = require('../models/Cart');
// const Order = require('../models/Order');

// // Get user's cart
// router.get('/mycart', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     let cart = await Cart.findOne({ userId });
    
//     if (!cart) {
//       cart = new Cart({ userId, items: [] });
//       await cart.save();
//     }
    
//     res.json(cart);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Add item to cart
// router.post('/add', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     const { productId, variantId, productName, variantName, image, price, weight, unit, stock } = req.body;
    
//     let cart = await Cart.findOne({ userId });
    
//     if (!cart) {
//       cart = new Cart({ userId, items: [] });
//     }
    
//     // Check if item already exists
//     const existingItemIndex = cart.items.findIndex(
//       item => item.productId === productId && item.variantId === variantId
//     );
    
//     if (existingItemIndex > -1) {
//       // Update quantity
//       cart.items[existingItemIndex].quantity += 1;
//     } else {
//       // Add new item
//       cart.items.push({
//         productId,
//         variantId,
//         productName,
//         variantName,
//         image,
//         price,
//         weight,
//         unit,
//         stock,
//         quantity: 1
//       });
//     }
    
//     cart.updatedAt = new Date();
//     await cart.save();
    
//     res.json({ message: 'Item added to cart', cart });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Update cart item quantity
// router.put('/update/:itemId', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     const { itemId } = req.params;
//     const { quantity } = req.body;
    
//     const cart = await Cart.findOne({ userId });
//     if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
//     const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
//     if (itemIndex === -1) return res.status(404).json({ message: 'Item not found' });
    
//     if (quantity < 1) {
//       cart.items.splice(itemIndex, 1);
//     } else {
//       cart.items[itemIndex].quantity = quantity;
//     }
    
//     cart.updatedAt = new Date();
//     await cart.save();
    
//     res.json({ message: 'Cart updated', cart });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Remove item from cart
// router.delete('/remove/:itemId', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     const { itemId } = req.params;
    
//     const cart = await Cart.findOne({ userId });
//     if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
//     cart.items = cart.items.filter(item => item._id.toString() !== itemId);
//     cart.updatedAt = new Date();
//     await cart.save();
    
//     res.json({ message: 'Item removed', cart });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Clear cart
// router.delete('/clear', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
    
//     const cart = await Cart.findOne({ userId });
//     if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
//     cart.items = [];
//     cart.updatedAt = new Date();
//     await cart.save();
    
//     res.json({ message: 'Cart cleared', cart });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Move cart to order (start checkout)
// router.post('/checkout', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.auth.userId || req.auth.memberId;
//     const userEmail = req.auth.email;
//     const userName = req.auth.username || req.auth.memberName;
    
//     // Get user's cart
//     const cart = await Cart.findOne({ userId });
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }
    
//     // Calculate totals
//     const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     const gstAmount = subtotal * 0.18;
//     const finalAmount = subtotal + gstAmount;
    
//     // Generate order ID
//     const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    
//     // Create order
//     const order = new Order({
//       orderId,
//       userId,
//       userName,
//       userEmail,
//       items: cart.items.map(item => ({
//         ...item.toObject(),
//         status: 'pending'
//       })),
//       totalAmount: subtotal,
//       gstAmount,
//       finalAmount,
//       status: 'checkout'
//     });
    
//     await order.save();
    
//     // Clear cart after creating order
//     cart.items = [];
//     cart.updatedAt = new Date();
//     await cart.save();
    
//     res.json({ 
//       message: 'Order created', 
//       orderId,
//       order 
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// ── GET /api/cart/mycart ─────────────────────────────────────────────────────
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
    console.error('GET /mycart error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/cart/add ───────────────────────────────────────────────────────
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;

    const {
      productId,
      productName,
      price,
      variantId   = "",
      variantName = "Standard",
      image       = "",
      weight      = null,
      unit        = "",
      stock       = null,
      quantity    = 1,
    } = req.body;

    // Only truly required fields
    if (!productId || !productName || price === undefined || price === null) {
      return res.status(400).json({
        message: `Missing required fields. Received: productId=${productId}, productName=${productName}, price=${price}`
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    // Match by productId + variantName
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variantName === variantName
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += 1;
    } else {
      cart.items.push({ productId, variantId, productName, variantName, image, price, weight, unit, stock, quantity });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error('POST /add error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/cart/update/:itemId ─────────────────────────────────────────────
router.put('/update/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity < 1) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    console.error('PUT /update error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/cart/remove/:itemId ──────────────────────────────────────────
router.delete('/remove/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId || req.auth.memberId;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Item removed', cart });
  } catch (error) {
    console.error('DELETE /remove error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/cart/clear ───────────────────────────────────────────────────
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
    console.error('DELETE /clear error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/cart/checkout ──────────────────────────────────────────────────
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const userId    = req.auth.userId   || req.auth.memberId;
    const userEmail = req.auth.email;
    const userName  = req.auth.username || req.auth.memberName || "User";

    // Try DB cart first, fall back to items sent in request body
    const cart    = await Cart.findOne({ userId });
    const dbItems = cart?.items || [];
    const bodyItems = req.body.items || [];

    // Use DB items if available, otherwise use frontend-sent items
    const orderItems = dbItems.length > 0 ? dbItems : bodyItems;

    console.log(`Checkout: userId=${userId}, dbItems=${dbItems.length}, bodyItems=${bodyItems.length}, using=${dbItems.length > 0 ? 'DB' : 'body'}`);

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const subtotal    = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gstAmount   = subtotal * 0.18;
    const finalAmount = subtotal + gstAmount;

    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    const order = new Order({
      orderId,
      userId,
      userName,
      userEmail,
      items: orderItems.map((item) => ({
        productId:   item.productId   || item._id,
        productName: item.productName,
        variantName: item.variantName || "Standard",
        image:       item.image       || "",
        price:       item.price,
        quantity:    item.quantity,
        status:      'pending',
      })),
      totalAmount: subtotal,
      gstAmount,
      finalAmount,
      status: 'checkout',
      address: req.body.address || {},
    });

    await order.save();

    // Clear DB cart after successful order (if it existed)
    if (cart && dbItems.length > 0) {
      cart.items = [];
      cart.updatedAt = new Date();
      await cart.save();
    }

    res.json({ message: 'Order created successfully', orderId, order });
  } catch (error) {
    console.error('POST /checkout error:', error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;