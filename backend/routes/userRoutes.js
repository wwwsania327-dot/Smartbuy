const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus, updateUserRole } = require('../controllers/userController');
const { 
  updateProfile, addAddress, updateAddress, deleteAddress, 
  setDefaultAddress, getNotifications, markAsRead, 
  clearAllNotifications, updateSettings 
} = require('../controllers/userAccountController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

// GET /api/users - Fetch all users
router.get('/', protect, admin, getUsers);

// PUT /api/users/:id/status - Block or Unblock user
router.put('/:id/status', protect, admin, updateUserStatus);

// PUT /api/users/:id/role - Update user role (Superadmin only)
router.put('/:id/role', protect, superAdmin, updateUserRole);

// Profile & Settings
router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);

// Addresses
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.put('/addresses/:addressId/default', protect, setDefaultAddress);

// Notifications
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:notificationId/read', protect, markAsRead);
router.delete('/notifications', protect, clearAllNotifications);

module.exports = router;
