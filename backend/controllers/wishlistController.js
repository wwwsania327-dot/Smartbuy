const Wishlist = require('../models/Wishlist');
const mongoose = require('mongoose');

// @desc    Get user's wishlist
// @route   GET /api/wishlist/:userId
// @access  Public
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'products',
      populate: { path: 'category', select: 'name' }
    });
    
    if (!wishlist) {
      wishlist = { products: [] };
    }
    
    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:userId/add
// @access  Public
const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // Ensure no duplicates
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
    
    // Return populated list
    wishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      populate: { path: 'category', select: 'name' }
    });
    
    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
};

// @desc    Remove product from wishlist
// @route   POST /api/wishlist/:userId/remove
// @access  Public
const removeFromWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (wishlist) {
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
      await wishlist.save();
      
      wishlist = await Wishlist.findById(wishlist._id).populate({
        path: 'products',
        populate: { path: 'category', select: 'name' }
      });
      res.json(wishlist.products);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
};

// @desc    Sync localStorage wishlist on login
// @route   POST /api/wishlist/:userId/sync
// @access  Public
const syncWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productIds } = req.body; // Array of IDs

    if (!Array.isArray(productIds)) return res.status(400).json({ message: 'Invalid payload' });

    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // Merge without duplicates
    productIds.forEach(id => {
      if (mongoose.Types.ObjectId.isValid(id) && !wishlist.products.includes(id)) {
        wishlist.products.push(id);
      }
    });

    await wishlist.save();
    
    wishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      populate: { path: 'category', select: 'name' }
    });
    
    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: 'Error syncing wishlist' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, syncWishlist };
