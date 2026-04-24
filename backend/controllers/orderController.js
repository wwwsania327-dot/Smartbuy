const Order = require('../models/Order');
const User = require('../models/User');

// Helper to add notification to user
const pushNotification = async (userId, type, title, message) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        notifications: {
          type,
          title,
          message,
          createdAt: new Date()
        }
      }
    });
  } catch (err) {
    console.error('Notification Error:', err);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      discountPrice,
      couponCode,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    const orderUser = req.user ? req.user._id : req.body.user;
    if (!orderUser) {
      return res.status(401).json({ message: 'User identification required to place order' });
    }

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      const mappedItems = orderItems.map((item) => ({
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
        paymentMethod: paymentMethod === 'Razorpay' ? 'ONLINE' : paymentMethod, // Fallback for old frontend
        itemsPrice: Number(itemsPrice || 0),
        discountPrice: Number(discountPrice || 0),
        couponCode: couponCode || '',
        taxPrice: Number(taxPrice || 0),
        shippingPrice: Number(shippingPrice || 0),
        totalPrice: Number(totalPrice || 0),
        paymentStatus: 'Pending'
      });

      const createdOrder = await order.save();

      // Push notification for order placed
      await pushNotification(
        orderUser,
        'ORDER_PLACED',
        'Order Placed Successfully',
        `Your order #${createdOrder._id.toString().slice(-6)} has been placed and is being processed.`
      );

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'Paid';
      order.paymentId = req.body.id;
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    if (!req.user) return res.json([]);
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders/all
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();

      // Notification for status change
      let title = 'Order Update';
      let message = `Your order #${updatedOrder._id.toString().slice(-6)} status is now: ${updatedOrder.status}`;
      
      if (updatedOrder.status === 'Shipped') {
        title = '🚀 Order Shipped';
        message = `Good news! Your order #${updatedOrder._id.toString().slice(-6)} has been shipped.`;
      } else if (updatedOrder.status === 'Out for Delivery') {
        title = '🛵 Out for Delivery';
        message = `Your order #${updatedOrder._id.toString().slice(-6)} is out for delivery and will reach you soon.`;
      } else if (updatedOrder.status === 'Delivered') {
        title = '✅ Order Delivered';
        message = `Your order #${updatedOrder._id.toString().slice(-6)} has been successfully delivered. Enjoy!`;
      } else if (updatedOrder.status === 'Cancelled') {
        title = '❌ Order Cancelled';
        message = `Your order #${updatedOrder._id.toString().slice(-6)} has been cancelled.`;
      }

      await pushNotification(updatedOrder.user, 'ORDER_UPDATE', title, message);

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
