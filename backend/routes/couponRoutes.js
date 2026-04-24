const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

// GET all coupons (Admin and SuperAdmin)
router.route('/').get(protect, admin, getCoupons);

// POST create coupon (Only SuperAdmin)
router.route('/').post(protect, superAdmin, createCoupon);

// PUT update coupon (Only SuperAdmin)
router.route('/:id').put(protect, superAdmin, updateCoupon);

// DELETE coupon (Only SuperAdmin)
router.route('/:id').delete(protect, superAdmin, deleteCoupon);

module.exports = router;
