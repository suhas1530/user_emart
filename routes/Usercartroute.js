const express  = require('express');
const router   = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const UserCart = require('../models/Usercart');

// ── GET /api/usercart/mycart ──────────────────────────────────────────────────
router.get('/mycart', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId;

    let cart = await UserCart.findOne({ userId });
    if (!cart) {
      cart = new UserCart({ userId, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error('GET /usercart/mycart error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/usercart/add ────────────────────────────────────────────────────
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId;

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

    if (!productId || !productName || price === undefined || price === null) {
      return res.status(400).json({
        message: `Missing required fields. Received: productId=${productId}, productName=${productName}, price=${price}`,
      });
    }

    let cart = await UserCart.findOne({ userId });
    if (!cart) cart = new UserCart({ userId, items: [] });

    // Match by productId + variantName to avoid duplicates
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variantName === variantName
    );

    if (existingIndex > -1) {
      // Item already exists — increment quantity
      cart.items[existingIndex].quantity += 1;
    } else {
      // New item — push to cart
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
        quantity,
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error('POST /usercart/add error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/usercart/update/:itemId ─────────────────────────────────────────
router.put('/update/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId   = req.auth.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await UserCart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1)
      return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity < 1) {
      // Remove item if qty drops below 1
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    console.error('PUT /usercart/update error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/usercart/remove/:itemId ──────────────────────────────────────
router.delete('/remove/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId     = req.auth.userId;
    const { itemId } = req.params;

    const cart = await UserCart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Item removed', cart });
  } catch (error) {
    console.error('DELETE /usercart/remove error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/usercart/clear ────────────────────────────────────────────────
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId;

    const cart = await UserCart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items     = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error('DELETE /usercart/clear error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;