const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/SuperAdmin
const createCoupon = async (req, res) => {
  try {
    const { code, discount, type, usageType, maxDiscount, isActive } = req.body;

    const couponExists = await Coupon.findOne({ code });

    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discount,
      type,
      usageType,
      maxDiscount,
      isActive
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/SuperAdmin
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      coupon.code = req.body.code || coupon.code;
      coupon.discount = req.body.discount !== undefined ? req.body.discount : coupon.discount;
      coupon.type = req.body.type || coupon.type;
      coupon.usageType = req.body.usageType || coupon.usageType;
      coupon.maxDiscount = req.body.maxDiscount !== undefined ? req.body.maxDiscount : coupon.maxDiscount;
      coupon.isActive = req.body.isActive !== undefined ? req.body.isActive : coupon.isActive;

      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/SuperAdmin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applicable coupon for user
// @route   GET /api/coupons/applicable
// @access  Public (Optional Auth)
const getApplicableCoupon = async (req, res) => {
  try {
    let usageType = 'general';
    
    if (req.user) {
      const orderCount = await Order.countDocuments({ user: req.user._id });
      if (orderCount === 0) {
        usageType = 'first_order';
      } else if (orderCount === 1) {
        usageType = 'second_order';
      }
    }

    // Find active coupon for this usageType
    // Try specific usageType first, then fallback to general
    let coupon = await Coupon.findOne({ usageType, isActive: true }).sort({ discount: -1 });
    
    if (!coupon && usageType !== 'general') {
      coupon = await Coupon.findOne({ usageType: 'general', isActive: true }).sort({ discount: -1 });
    }

    res.json(coupon || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  getApplicableCoupon
};
