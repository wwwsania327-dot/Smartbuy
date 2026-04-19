const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, updateOrderToPaid, getMyOrders, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/orders - Get logged in user orders
router.get('/', protect, getMyOrders);

// GET /api/orders/all - Get all orders (Admin Only)
router.get('/all', protect, admin, getOrders);

// POST /api/orders - Create new order
router.post('/', protect, addOrderItems);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// PUT /api/orders/:id/pay - Update order to paid
router.put('/:id/pay', updateOrderToPaid);

// PUT /api/orders/:id/status - Update order status (Admin Only)
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
