const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/users - Fetch all users
router.get('/', protect, admin, getUsers);

// PUT /api/users/:id/status - Block or Unblock user
router.put('/:id/status', protect, admin, updateUserStatus);

module.exports = router;
