const express = require('express');
const router = express.Router();
const { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory, healCategoryLinks } = require('../controllers/categoryController');

// POST /api/categories/heal - Heal product-category links
router.post('/heal', healCategoryLinks);

// GET /api/categories - Fetch all categories
router.get('/', getCategories);

// GET /api/categories/:id - Fetch single category with products
router.get('/:id', getCategoryById);

// POST /api/categories - Create a category (Admin only)
// TODO: Add admin middleware
router.post('/', createCategory);

// PUT /api/categories/:id - Update a category (Admin only)
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete a category (Admin only)
router.delete('/:id', deleteCategory);

module.exports = router;
