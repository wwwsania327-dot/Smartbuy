const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus } = require('../controllers/userController');

// GET /api/users - Fetch all users
// TODO: Secure with Admin Middleware once JWT checks are established
router.get('/', getUsers);

// PUT /api/users/:id/status - Block or Unblock user
router.put('/:id/status', updateUserStatus);

module.exports = router;
