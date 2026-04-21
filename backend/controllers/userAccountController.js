const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAddress = {
      fullName: req.body.fullName,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      phone: req.body.phone,
      isDefault: req.body.isDefault || false
    };

    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error adding address' });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    address.fullName = req.body.fullName || address.fullName;
    address.addressLine1 = req.body.addressLine1 || address.addressLine1;
    address.addressLine2 = req.body.addressLine2 || address.addressLine2;
    address.city = req.body.city || address.city;
    address.state = req.body.state || address.state;
    address.zipCode = req.body.zipCode || address.zipCode;
    address.phone = req.body.phone || address.phone;

    if (req.body.isDefault !== undefined) {
      if (req.body.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
      }
      address.isDefault = req.body.isDefault;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error updating address' });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address' });
  }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:addressId/default
// @access  Private
const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === req.params.addressId;
    });

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error setting default address' });
  }
};

// @desc    Get notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:notificationId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(req.params.notificationId);
    if (notification) {
      notification.read = true;
      await user.save();
    }
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/users/notifications
// @access  Private
const clearAllNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notifications = [];
    await user.save();
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Error clearing notifications' });
  }
};

// @desc    Update settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.settings.darkMode = req.body.darkMode !== undefined ? req.body.darkMode : user.settings.darkMode;
      user.settings.notificationsEnabled = req.body.notificationsEnabled !== undefined ? req.body.notificationsEnabled : user.settings.notificationsEnabled;
      user.settings.language = req.body.language || user.settings.language;

      await user.save();
      res.json(user.settings);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
};

module.exports = {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getNotifications,
  markAsRead,
  clearAllNotifications,
  updateSettings
};
