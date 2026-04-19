const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/categories/heal - Heal product-category links (Admin only)
router.post('/heal', protect, admin, healCategoryLinks);

// GET /api/categories - Fetch all categories
router.get('/', getCategories);

// GET /api/categories/:id - Fetch single category with products
router.get('/:id', getCategoryById);

// POST /api/categories - Create a category (Admin only)
router.post('/', protect, admin, createCategory);

// PUT /api/categories/:id - Update a category (Admin only)
router.put('/:id', protect, admin, updateCategory);

// DELETE /api/categories/:id - Delete a category (Admin only)
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
