const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    // Safety check for user (middleware should handle this, but for internal stability)
    const orderUser = req.user ? req.user._id : req.body.user;
    if (!orderUser) {
      return res.status(401).json({ message: 'User identification required to place order' });
    }

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      // Map frontend fields (quantity, id) to backend fields (qty, product)
      const mappedItems = orderItems.map((item: any) => ({
        name: item.name,
        qty: item.quantity || item.qty,
        image: item.image,
        price: item.price,
        product: item.product || item.id
      }));

      const order = new Order({
        orderItems: mappedItems,
        user: orderUser,
        shippingAddress,
        paymentMethod,
        itemsPrice: Number(itemsPrice || 0),
        taxPrice: Number(taxPrice || 0),
        shippingPrice: Number(shippingPrice || 0),
        totalPrice: Number(totalPrice || 0)
      });

      const createdOrder = await order.save();
      console.log(`[OrderSuccess] Order created: ${createdOrder._id} for user: ${orderUser}`);
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.error('[Order ERROR] Exception during order creation:', error);
    
    // Explicitly log Mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('[Order Validation Error] Details:', JSON.stringify(error.errors, null, 2));
    }

    const fs = require('fs');
    try {
      fs.appendFileSync('backend_error.log', `[${new Date().toISOString()}] Error creating order: ${error.stack}\nBODY: ${JSON.stringify(req.body)}\n\n`);
    } catch (e) {}
    
    res.status(500).json({ 
      message: 'Server Error creating order', 
      error: error.message,
      details: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('[GetOrderById ERROR] Full stack trace:', error);
    res.status(500).json({ message: 'Server Error finding order', error: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    if (!req.user) return res.json([]);
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error retrieving user orders' });
  }
};

const getOrders = async (req, res) => {
  try {
    // Exact root cause fix: Ensure 'User' model is registered and populate is using valid fields
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('[GetOrders CRITICAL ERROR]:', error);
    res.status(500).json({ 
      message: 'Server Error retrieving all orders', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      
      const updatedOrder = await order.save();
      console.log(`[OrderUpdate] Status of ${order._id} updated to: ${order.status}`);
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating order status' });
  }
};

module.exports = { addOrderItems, getOrderById, updateOrderToPaid, getMyOrders, getOrders, updateOrderStatus };
