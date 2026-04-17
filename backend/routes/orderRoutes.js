const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, updateOrderToPaid, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/orders - Get logged in user orders
router.get('/', protect, getMyOrders);

// POST /api/orders - Create new order
router.post('/', protect, addOrderItems);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// PUT /api/orders/:id/pay - Update order to paid
router.put('/:id/pay', updateOrderToPaid);

module.exports = router;
