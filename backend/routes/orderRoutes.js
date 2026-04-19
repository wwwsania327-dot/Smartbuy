const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, updateOrderToPaid, getMyOrders, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/orders/all - Get all orders (Admin Only)
// This MUST be before any other GET routes to avoid conflict with /:id
router.get('/all', protect, admin, getOrders);

// GET /api/orders - Get logged in user orders
router.get('/', protect, getMyOrders);

// POST /api/orders - Create new order
router.post('/', protect, addOrderItems);

// GET /api/orders/:id - Get order by ID
router.get('/:id', protect, getOrderById);

// PUT /api/orders/:id/pay - Update order to paid
router.put('/:id/pay', protect, updateOrderToPaid);

// PUT /api/orders/:id/status - Update order status (Admin Only)
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
