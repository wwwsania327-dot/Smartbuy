const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-addresses');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching users' });
  }
};

// @desc    Update user status (block/unblock)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent blocking another admin
      if (user.role === 'admin' && status === 'blocked') {
        return res.status(400).json({ message: 'Cannot block an administrator' });
      }

      user.status = status;
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating user status' });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/SuperAdmin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    // Only allow 'user' and 'admin' roles to be set via this API
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Only user and admin roles are allowed.' });
    }

    // Prevent self-role modification
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent modifying another superadmin
      if (user.role === 'superadmin') {
        return res.status(403).json({ message: 'Cannot modify a superadmin account.' });
      }

      user.role = role;
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating user role' });
  }
};

module.exports = { getUsers, updateUserStatus, updateUserRole };
